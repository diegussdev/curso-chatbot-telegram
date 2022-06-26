const env =  require('../.env');
const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(env.token);

const tecladoCarne = Markup.keyboard([
    ['🐷 Porco', '🐮 Vaca', '🐑 Carneiro'],
    ['🐔 Galinha', '🐣 Eu como é ovo'],
    ['🐟 Peixe', '🐙 Frutos do mar'],
    ['🍄 Eu sou vegetariano']
]).resize().oneTime();

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name;

    await ctx.reply(`Seja bem vindo, ${name}!`);

    await ctx.reply(
        'Qual bebida você prefere?',
        Markup.keyboard(['Coca', 'Pepsi']).resize().oneTime()
    );
});

bot.hears(['Coca', 'Pepsi'], async ctx => {
    ctx.reply(`Eu também gosto de ${ctx.match}!`);
    await ctx.reply('Qual carne você prefere?', tecladoCarne);
})

bot.hears('🐮 Vaca', ctx => {
    ctx.reply('É a minha predileta também');
});

bot.hears('🍄 Eu sou vegetariano', ctx => {
    ctx.reply('Parabéns! Mas eu ainda como carne.');
});

bot.on('text', ctx => {
    ctx.reply('Legal!');
});

bot.startPolling();