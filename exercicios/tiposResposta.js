const env = require('../.env');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(env.token);

bot.start(async ctx => {
    const from = ctx.update.message.from;

    await ctx.reply(`Seja bem vindo, ${from.first_name}! 😁`);

    await ctx.replyWithHTML(`Resposta com <b>HTML</b>`);

    await ctx.replyWithMarkdown(`_Resposta_ com *Markdown*`);

    await ctx.replyWithPhoto({ source: `${__dirname}/bot.jpeg` });
    
    await ctx.replyWithPhoto({ url: 'https://media.istockphoto.com/photos/cute-blue-robot-giving-thumbs-up-3d-picture-id1350820098?b=1&k=20&m=1350820098&s=170667a&w=0&h=8gO4GcPH-wsEZS6PYn2WXbQN3ZPPv98vE6mBl-Ckwr8=' });

    await ctx.replyWithPhoto(
        'https://media.istockphoto.com/photos/cute-blue-robot-giving-thumbs-up-3d-picture-id1350820098?b=1&k=20&m=1350820098&s=170667a&w=0&h=8gO4GcPH-wsEZS6PYn2WXbQN3ZPPv98vE6mBl-Ckwr8=',
        { caption: 'Resposta com foto.' }
    );

    await ctx.replyWithLocation(-22.950996196, -43.206499174);

    await ctx.replyWithVideo('http://files.cod3r.com.br/curso-bot/cod3r-end.m4v');
});

bot.startPolling();