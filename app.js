const TelegramBot=require('node-telegram-bot-api');
const TOKEN = '526588233:AAHhtkEj3Jq6A7pP048DItlam9k03IR99vA';
process.env["NTBA_FIX_319"] = 1;

const bot =new TelegramBot(TOKEN, {
    polling:true
});

bot.onText(/\/start/, msg => {
    const text='салам крыса';
    console.log(msg);
    bot.sendMessage(msg.chat.id, text)
});
