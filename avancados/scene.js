const env = require('../.env');
const { Telegraf, Scenes } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const bot = new Telegraf(env.token);

const session = new LocalSession({ database: env.databaseFile });
bot.use(session.middleware());

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name;
    await ctx.reply(`Seja bem vindo, ${name}!`);
    await ctx.reply(`Entrre com /echo ou /soma para iniciar...`);
});

const { enter, leave } = Scenes.Stage;

const echoScene = new Scenes.BaseScene('echo')
echoScene.enter(ctx => ctx.reply('Entrando em Echo Scene'));
echoScene.leave(ctx => ctx.reply('Saindo de Echo Scene'));
echoScene.command('sair', leave('echo'));
echoScene.on('text', ctx => ctx.reply(ctx.message.text));
echoScene.on('message', ctx => ctx.reply('Apenas mensagens de texto'));

let contador = 0;
const somaScene = new Scenes.BaseScene('soma');
somaScene.enter(ctx => ctx.reply('Entrando em Soma Scene'));
somaScene.leave(ctx => ctx.reply('Saindo de Soma Scene'));

somaScene.use(async (ctx, next) =>{
    await ctx.reply('Digite números para somar');
    await ctx.reply('Outros comandos: /zerar e /sair');
    next();
});

somaScene.command('zerar', ctx => {
    contador = 0;
    ctx.reply(`Valor: ${contador}`);
});

somaScene.command('sair', leave('soma'));

somaScene.hears(/(\d+)/, ctx => {
    contador += parseInt(ctx.match[1]);
    ctx.reply(`Valor: ${contador}`);
});

const stage = new Scenes.Stage([echoScene, somaScene]);
bot.use(stage.middleware());


bot.command('echo', enter('echo'));
bot.command('soma', enter('soma'));
bot.on('message', ctx => ctx.reply('Entre com /echo ou /soma'));

bot.startPolling();