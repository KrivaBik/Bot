const TelegramBot=require('node-telegram-bot-api');
const TOKEN = '526588233:AAHhtkEj3Jq6A7pP048DItlam9k03IR99vA';
process.env["NTBA_FIX_319"] = 1;

const bot =new TelegramBot(TOKEN, {
    polling:true
});

var KB={
    currency:'курс',
    picture:'photo',
    cat:'cat',
    car:'car',
    back:'back'
};
bot.onText(/\/start/, msg => {
    sendgreeting(msg);
});

 bot.on('message', msg=>{
     switch (msg.text){
         case KB.picture:
             sendPictureScreen(msg.chat.id);
             break;
         case KB.currency:
             break;
         case KB.car:
         case KB.cat:
         break;
         case KB.back:
             sendgreeting(msg, false);
             break;


     }

 });

 function sendPictureScreen(chatId) {
     bot.sendMessage(chatId,'viberi tip pecture', {
         reply_markup:{
             keyboard:[
                 [KB.car,KB.cat],
                 [KB.back]
             ]
         }
     })
 }
 function sendgreeting(msg, sendHello=true) {
     const text= sendHello
     ?'Салам,'+msg.from.first_name+'-krisa'
     :'sobaka ti';
     bot.sendMessage(msg.chat.id, text, {
         reply_markup:{
             keyboard:[
                 [KB.currency, KB.picture]
             ]
         }
     })
 }

