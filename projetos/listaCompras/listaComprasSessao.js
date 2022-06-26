const env = require('../../.env');
const { Telegraf, Markup } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const bot = new Telegraf(env.token);

const session = new LocalSession({ database: env.databaseFile });
bot.use(session.middleware());

const botoes = lista => Markup.inlineKeyboard(
    lista.map(item => Markup.button.callback(item, `delete ${item}`)),
    { columns: 3 }
);

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name;
    await ctx.reply(`Seja bem vindo, ${name}!`);
    await ctx.reply('Escreva os itens que deseja adicionar...');
});

bot.on('text', ctx => {
    let lista = JSON.parse(ctx.session.lista || '[]');
    const item = ctx.update.message.text;

    if (lista.includes(item)) {
        ctx.reply(`Item \"${item}\" já está na lista.`, botoes(lista));
        return;
    }

    lista.push(item);
    ctx.session.lista = JSON.stringify(lista);
    ctx.reply(`\"${item}\" adicionado.`, botoes(lista));
});

bot.action(/delete (.+)/, ctx => {
    let lista = JSON.parse(ctx.session.lista || '[]');
    const item = ctx.match[1];

    if (lista.length) {
        lista = lista.filter(listaItem => listaItem !== item);
        ctx.session.lista = JSON.stringify(lista);

        ctx.reply(`\"${item}\" removido.`, botoes(lista));
    }
})

bot.startPolling();