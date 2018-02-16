const TelegramBot=require('node-telegram-bot-api');
const request=require('request');
const _=require('lodash');
const fs=require('fs');
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
const PicScrs={
  [KB.cat]:[
      'cat1.jpg',
      'cat2.jpg',
      'cat3.jpg'
  ],
    [KB.car]:[
        'car1.jpg',
        'car2.jpg',
        'car3.jpg'
    ]
};
var kbActions={
    registration:'Зарегистироваться',
    connectToDB:'Подключиться к БД',
    menu:'menu'
};

bot.onText(/\/start/, msg => {
    console.log(msg.chat.id);
            bot.sendMessage(msg.chat.id, "Здравствуйте! \n Пожалуйста, зарегистрируйтесь для получения сообщений.", {
                reply_markup: {
                    keyboard: [
                        [{text:kbActions.registration , "request_contact": true}]
                    ],
                    one_time_keyboard: true
                }
            });

});
bot.on('contact',msg=>{
    var registeredUsers=JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));
    if(!registeredUsers[msg.contact.phone_number]){
        registeredUsers[msg.contact.phone_number]=msg.chat.id;
    }
    fs.writeFile((__dirname+'/idBase.json'),JSON.stringify(registeredUsers));

});

 bot.on('message', msg=>{

     switch (msg.text){
         case KB.picture:
             sendPictureScreen(msg.chat.id);
             break;
         case KB.currency:
             sendCurrencyScreen(msg.chat.id);
             break;
         case KB.car:
         case KB.cat:
             sendPictureByName(msg.chat.id, msg.text);
         break;
         case KB.back:
             sendgreeting2(msg, false);
             break;


     }

 });
 bot.on('callback_query', query=>{
    // console.log(JSON.stringify(query,null,2));
     const base= query.data;
     const symbol = 'RUB';

     bot.answerCallbackQuery({
        callback_query_id:query.id,
        text:'ok'
     });
     request('https://api.fixer.io/latest?symbols='+symbol+'&base='+base, (err,res, body)=>{
         if (err) throw new Error(err);
         if(res.statusCode===200){
             const  currencyData=JSON.parse(body);

             const html='<b>1'+base+'</b>-<em>'+currencyData.rates[symbol]+symbol+'</em>';

             bot.sendMessage(query.message.chat.id, html, {
               parse_mode:'HTML'
             })
         }

     });


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
 function sendgreeting(msg) {


 }
function sendgreeting2(msg) {

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

function sendPictureByName(catId, picName) {
     var srcs=PicScrs[picName];
     var src=srcs[_.random(0, srcs.length-1)];
     bot.sendMessage(catId,"pfuhe;f.////");
     fs.readFile(__dirname+'/pictures/'+src,(err,picture)=>{
         if (err) throw new Error(err);
         bot.sendPhoto(catId,picture).then(()=>{
             bot.sendMessage(catId,"pfuhe;f.////");
         });
     })

}

function sendCurrencyScreen(chatId) {
     bot.sendMessage(chatId, 'viberi kurs valut',{
         reply_markup:{
             inline_keyboard:[
                 [{
                 text:'dollar',
                     callback_data:'USD'
                 }],
                 [{
                     text:'evro',
                     callback_data:'EUR'
                 }]
             ]
         }
     })
    
}
function checkIn() {
    
}