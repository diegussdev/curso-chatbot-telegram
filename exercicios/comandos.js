const env =  require('../.env');
const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(env.token);

bot.start(ctx => {
    const name = ctx.update.message.from.first_name;
    ctx.reply(`Seja bem vindo, ${name}!\nAvise se precisar de /ajuda`);
});

bot.command('ajuda', ctx => {
    ctx.reply(
        '/ajuda: vou mostras as opções'
        + '\n/ajuda2: para testar via hears'
        + '\n/op2: opção genérica'
        + '\n/op3: opção genérica qualquer'
    );
});

bot.hears('/ajuda2', ctx => {
    ctx.reply('Assim também funciona!');
});

bot.hears(/\/op(2|3)/i, ctx => {
    ctx.reply('Resposta padrão para comandos genéricos!');
});

bot.startPolling();