const env = require('../.env');
const { Telegraf } = require('telegraf');
const moment = require('moment');
const bot = new Telegraf(env.token);

bot.hears(['pizza', 'Pizza', '🍕'], ctx => {
    ctx.reply('Quero!');
});

bot.hears([/chuchu/i, /alface/i], ctx => {
    ctx.reply('Passo.');
});

bot.hears([/(\d{2}\/\d{2}\/\d{4})/], ctx => {
    moment.locale('pt-Br');
    const data = moment(ctx.match[1], 'DD/MM/YYYY');
    ctx.reply(`${ctx.match[1]} cai em ${data.format('dddd')}`);
});

bot.startPolling();