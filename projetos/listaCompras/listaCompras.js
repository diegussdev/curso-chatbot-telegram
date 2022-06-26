const env = require('../../.env');
const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(env.token);

let lista = [];

const botoes = () => Markup.inlineKeyboard(
    lista.map(item => Markup.button.callback(item, `delete ${item}`)),
    { columns: 3 }
);

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name;
    await ctx.reply(`Seja bem vindo, ${name}!`);
    await ctx.reply('Escreva os itens que deseja adicionar...');
});

bot.on('text', ctx => {
    const item = ctx.update.message.text;
    lista.push(item);
    ctx.reply(`${item} adicionado.`, botoes());
});

bot.action(/delete (.+)/, ctx => {
    const item = ctx.match[1];
    if (lista.length) {
        lista = lista.filter(listaItem => listaItem !== item);
        ctx.reply(`${item} removido.`, botoes());
    }
})

bot.startPolling();