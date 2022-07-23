const env = require('../../.env');
const { Telegraf, Scenes, Markup } = require('telegraf');
const moment = require('moment');
const LocalSession = require('telegraf-session-local');

const {
    getAgenda,
    getTarefa,
    getTarefas,
    getConcluidas,
    incluirTarefa,
    concluirTarefa,
    excluirTarefa,
    atualizarDataTarefa,
    atualizarObsTarefa
} = require('./agendaServicos');

const bot = new Telegraf(env.token);

bot.start(ctx => {
    const nome = ctx.update.message.from.first_name;
    ctx.reply(`Seja bem vindo, ${nome}!`);
});

const formatarData = data =>
    data ? moment(data).format('DD/MM/YYYY') : '';

const exibirTarefa = async (ctx, tarefaId, novaMsg = false) => {
    const tarefa = await getTarefa(tarefaId);
    const conclusao = tarefa.dt_conclusao ?
        `\nConcluída em: ${formatarData(tarefa.dt_conclusao)}` : '';
    
    let msg = `${tarefa.descricao}`;
    msg += `\nPrevisão: ${formatarData(tarefa.dt_previsao)}${conclusao}`;
    msg += `\nObservações:\n${tarefa.observacao || ''}`;

    if (novaMsg) {
        ctx.reply(msg, botoesTarefa(tarefaId));
    } else {
        ctx.editMessageText(msg, botoesTarefa(tarefaId)).catch(()=>{});
    }
};

const botoesAgenda = tarefas => {
    const botoes = tarefas.map(item => {
        const data = item.dt_previsao ?
            `${moment(item.dt_previsao).format('DD/MM/YYYY')} - ` : '';
        return [Markup.button.callback(`${data}${item.descricao}`, `mostrar ${item.id}`)];
    })
    return Markup.inlineKeyboard(botoes, { columns: 1 });
};

const botoesTarefa = idTarefa => Markup.inlineKeyboard([
    Markup.button.callback('✔️', `concluir ${idTarefa}`),
    Markup.button.callback('📅', `setData ${idTarefa}`),
    Markup.button.callback('💬', `addNota ${idTarefa}`),
    Markup.button.callback('✖️', `excluir ${idTarefa}`),
], { columns: 4 });

//------ Comandos do bot

bot.command('dia', async ctx => {
    const tarefas = await getAgenda(moment());

    if (tarefas.length <= 0) {
        ctx.reply('Não há tarefas para hoje');
        return;
    }

    ctx.reply(`Aqui está a sua agenda do dia`, botoesAgenda(tarefas));
});

bot.command('amanha', async ctx => {
    const tarefas = await getAgenda(moment().add({ day: 1 }));

    if (tarefas.length <= 0) {
        ctx.reply('Não há tarefas até amanhã');
        return;
    }

    ctx.reply(`Aqui está a sua agenda até amanhã`, botoesAgenda(tarefas));
});

bot.command('semana', async ctx => {
    const tarefas = await getAgenda(moment().add({ week: 1 }));

    if (tarefas.length <= 0) {
        ctx.reply('Não há tarefas após uma semana');
        return;
    }

    ctx.reply(`Aqui está a sua agenda da semana`, botoesAgenda(tarefas));
});

bot.command('concluidas', async ctx => {
    const tarefas = await getConcluidas();

    if (tarefas.length <= 0) {
        ctx.reply('Não há tarefas concluídas');
        return;
    }

    ctx.reply(`Estas são as tarefas que você já concluiu`, botoesAgenda(tarefas));
});

bot.command('tarefas', async ctx => {
    const tarefas = await getTarefas();

    if (tarefas.length <= 0) {
        ctx.reply('Não há tarefas sem data definida');
        return;
    }
    
    ctx.reply(`Estas são as tarefas sem data definida`, botoesAgenda(tarefas));
});

//------ Actions do bot

bot.action(/mostrar (.+)/, async ctx => {
    await exibirTarefa(ctx, ctx.match[1]);
});

bot.action(/concluir (.+)/, async ctx => {
    await concluirTarefa(ctx.match[1]);
    await exibirTarefa(ctx, ctx.match[1]);
    await ctx.reply(`Tarefa Concluída`);
});

bot.action(/excluir (.+)/, async ctx => {
    await excluirTarefa(ctx.match[1]);
    await ctx.editMessageText(`Tarefa Excluída`);
});

const tecladoDatas = Markup.keyboard([
    ['Hoje', 'Amanhã'],
    ['1 Semana', '1 Mês'],
]).resize().oneTime();

let idTarefa = null;

//----- dataScene

const dataScene = new Scenes.BaseScene('data');

dataScene.enter(ctx => {
    idTarefa = ctx.match[1];
    ctx.reply(`Gostaria de definir alguma data?`, tecladoDatas);
});

dataScene.leave(ctx => {idTarefa = null});

dataScene.hears(/hoje/gi, async ctx => {
    const data = moment();
    handleData(ctx, data);
});

dataScene.hears(/(Amanh[ãa])/gi, async ctx => {
    const data = moment().add({ days: 1 });
    handleData(ctx, data);
});

dataScene.hears(/^(\d+) dias?$/gi, async ctx => {
    const data = moment().add({ days: ctx.match[1] });
    handleData(ctx, data);
});

dataScene.hears(/^(\d+) semanas?/gi, async ctx => {
    const data = moment().add({ weeks: ctx.match[1] });
    handleData(ctx, data);
});

dataScene.hears(/^(\d+) m[eê]s(es)?/gi, async ctx => {
    const data = moment().add({ months: ctx.match[1] });
    handleData(ctx, data);
});

dataScene.hears(/(\d{2}\/\d{2}\/\d{4})/g, async ctx => {
    const data = moment(ctx.match[1], 'DD/MM/YYYY');
    handleData(ctx, data);
});

const handleData = async (ctx, data) => {
    await atualizarDataTarefa(idTarefa, data);
    await ctx.reply(`Data atualizada!`, Markup.removeKeyboard());
    await exibirTarefa(ctx, idTarefa, true);
    ctx.scene.leave();
};

dataScene.on('message', ctx =>
    ctx.reply(`Padrões aceitos\ndd/MM/YYYY\nX dias\nX semanas\nX meses`));

// Observacao Scene
const obsScene = new Scenes.BaseScene('observacoes');

obsScene.enter(ctx => {
    idTarefa = ctx.match[1];
    ctx.reply(`Já pode adicionar suas anotações...`);
});

obsScene.leave(ctx => idTarefa = null);

obsScene.on('text', async ctx => {
    const tarefa = await getTarefa(idTarefa);
    const novoTexto = ctx.update.message.text;
    const obs = tarefa.observacao ? 
        tarefa.observacao + '\n---\n' + novoTexto : novoTexto;
    const res = await atualizarObsTarefa(idTarefa, obs);
    await ctx.reply(`Observação adicionada!`);
    await exibirTarefa(ctx, idTarefa, true);
    ctx.scene.leave();
});

obsScene.on('message', ctx => ctx.reply(`Apenas observações em texto são aceitas`));


const session = new LocalSession({ database: env.databaseFile });
bot.use(session.middleware());

const stage = new Scenes.Stage([dataScene, obsScene]);
bot.use(stage.middleware());

bot.action(/setData (.+)/, Scenes.Stage.enter('data'));
bot.action(/addNota (.+)/, Scenes.Stage.enter('observacoes'));

//------ Inserir Tarefa

bot.on('text', async ctx => {
    try {
        const tarefa = await incluirTarefa(ctx.update.message.text);
        await exibirTarefa(ctx, tarefa.id, true);
    } catch (err) {
        console.log(err);
    }
});

bot.startPolling();