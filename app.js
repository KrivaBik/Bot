const TelegramBot=require('node-telegram-bot-api');
const request=require('request');
const _=require('lodash');
const fs=require('fs');
var logger=require('./logger');
var CronJob = require('cron').CronJob;
const TOKEN = '526588233:AAHhtkEj3Jq6A7pP048DItlam9k03IR99vA';





try {
    var appConfig=require ('./appConfig');
    var configFileName=process.argv[2]|| "configPro";
    appConfig.setAppConfigName(configFileName);
    appConfig.loadAppConfig();
} catch (e){
    console.log("FAILED TO LOAD appConfig! APP START IMPOSSIBLE! REASON:",e.message);
    return;
}

var appPort= appConfig.getAppConfigParam("appPort") || 80;
var Schedule= appConfig.getAppConfigParam("Schedule");

try{
    let dataMeal=JSON.parse(fs.readFileSync(__dirname+'/dataMeal.json'));
    if(!dataMeal||dataMeal.length==0) return;

    for (var i=0;i<dataMeal.length;i++){
        var dataMealI=dataMeal[i];
        startScheduleMeals(dataMealI);
        console.log(i);
    }

}catch (e){
    console.log("Nooooo",e.message);
}




const bot =new TelegramBot(TOKEN, {
    polling:true
});
var KB={
    menu:'Меню',
    chooseDietOptions:'Выбор диеты',
    countCal:'Подсчет дневной нормы калорий',
    losingWeight:'LosingWeight',
    muscleGain:'MuscleGain',
    backToMenu:'BackToMenu'
};
// const PicScrs={
//   [KB.cat]:[
//       'cat1.jpg',
//       'cat2.jpg',
//       'cat3.jpg'
//   ],
//     [KB.car]:[
//         'brf1.jpg'
//     ]
// };
// var registeredUsers=JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));

bot.onText(/\/start/, msg => {
    let registeredUsers=JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));
    let mesg, objKB;
    if(!registeredUsers[msg.chat.id]){
        mesg="Здравствуйте! \n Пожалуйста, зарегистрируйтесь для реццептов полезных и быстрых рецептов";
        objKB ={reply_markup: {
            keyboard: [
                [{text:'Регистрация' , "request_contact": true}]
            ],
                one_time_keyboard: true
        }};
    }else {
        mesg="Салам "+msg.chat.first_name;
        objKB ={reply_markup: {
            keyboard: [
                [KB.menu]
            ]}};
    }
    bot.sendMessage(msg.chat.id, mesg, objKB);
});
bot.on('contact',msg=>{
    toMenu(msg.chat.id);
    let registeredUsers=JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));
    if(!registeredUsers[msg.chat.id]){
        registeredUsers[msg.chat.id]={'phone':msg.contact.phone_number,'diet':'' };
    }
    fs.writeFileSync((__dirname+'/idBase.json'),JSON.stringify(registeredUsers));
});

bot.on('message', msg=>{
    switch (msg.text){
        case KB.menu:
            sendMenu(msg.chat.id);
            break;
        case KB.chooseDietOptions:
            chooseDietOptions(msg.chat.id);
            break;
        case KB.countCal:
            sendCurrencyScreen(msg.chat.id);
            break;
        // case KB.car:
        // case KB.cat:
        //     sendPictureByName(msg.chat.id, msg.text);
        //     break;
        // case KB.back:
        //     sendgreeting2(msg, false);
        //     break;


    }

});
bot.on('message', msg=>{
    var listUsers =JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));
    var chatId=msg.chat.id;
    switch (msg.text){
        case KB.losingWeight:
            listUsers.chatId.diet=KB.losingWeight;
            fs.writeFile((__dirname+'/idBase.json'),JSON.stringify(listUsers),function () {
                bot.sendMessage(chatId,"Вы успешно зарегистрированы, ожидайте сообщение с рецептом)");
            });
            break;
        case KB.muscleGain:
            listUsers.chatId.diet=KB.losingWeight;
            fs.writeFile((__dirname+'/idBase.json'),JSON.stringify(registeredUsers),function () {
                bot.sendMessage(chatId,"Вы успешно зарегистрированы, ожидайте сообщение с рецептом)");
            });
            break;
    }

});
// bot.on('callback_query', query=>{
//     // console.log(JSON.stringify(query,null,2));
//     //  const base= query.data;
//     //  const symbol = 'RUB';
//     //  request('https://api.fixer.io/latest?symbols='+symbol+'&base='+base, (err,res, body)=>{
//     //      if (err) throw new Error(err);
//     //      if(res.statusCode===200){
//     //          const  currencyData=JSON.parse(body);
//     //
//     //          const html='<b>1'+base+'</b>-<em>'+currencyData.rates[symbol]+symbol+'</em>';
//     //
//     //          bot.sendMessage(query.message.chat.id, html, {
//     //            parse_mode:'HTML'
//     //          })
//     //      }
//     //
//     //  });
//     if(query.data==='menu'){
//         sendMenu(query.message.chat.id);
//     }
//     bot.answerCallbackQuery({
//         callback_query_id:query.id,
//         text:'ok'
//     });
//
//
//  });

bot.on('callback_query', query=>{
    switch (query.data){
        case KB.backToMenu:
            toMenu(query.message.chat.id);
            bot.answerCallbackQuery({
                callback_query_id:query.id,
                text:'Меню'
            });
            break;
        case KB.losingWeight:
            addDietToIdBase(query.message.chat.id,KB.losingWeight);
            bot.answerCallbackQuery({
                callback_query_id:query.id,
                text:'Ожидайте низкокалорийные рецепты'
            });
            break;
        case KB.muscleGain:
            addDietToIdBase(query.message.chat.id,KB.muscleGain);
            bot.answerCallbackQuery({
                callback_query_id:query.id,
                text:'Ожидайте высокопитательные рецепты'
            });
            break;
    }
});
function toMenu(Id) {
    let objKB ={reply_markup: {
        keyboard: [
            [{text:'Меню'
                }]
        ]}};
    bot.sendMessage(Id,':)',objKB);
}
function sendMenu(chatId) {
    bot.sendMessage(chatId,'Меню', {
        reply_markup:{
            keyboard:[
                [KB.chooseDietOptions],
                [KB.countCal]
            ]
        }
    });
}
function chooseDietOptions(Id) {

    bot.sendMessage(Id,'Выбор диеты', {
        reply_markup:{
            inline_keyboard:[
                [{
                    text:'Жиросжигание',
                    callback_data:KB.losingWeight
                }],
                [{
                    text:'Набор мышечной массы',
                    callback_data:KB.muscleGain
                }],
                [{
                    text:'Назад к меню',
                    callback_data:KB.backToMenu
                }]
            ]
        }
    })
}
function addDietToIdBase(Id,Value) {
    let listUsers =JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));
    let chatId=Id;
    switch (Value){
        case KB.losingWeight:
            listUsers[chatId].diet=KB.losingWeight;
            fs.writeFile((__dirname+'/idBase.json'),JSON.stringify(listUsers));
            break;
        case KB.muscleGain:
            listUsers[chatId].diet=KB.muscleGain;
            fs.writeFile((__dirname+'/idBase.json'),JSON.stringify(listUsers));
            break;
    }
}

function startScheduleMeals(dataMeal){
    var listUsers =JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));
    let job=new CronJob(dataMeal.schedule,
        function() {
            for (k in listUsers){
                var rand = Math.floor(Math.random() * dataMeal.meals.length);
                // bot.sendMessage(k,dataMeal.meals[rand]);

                var src=dataMeal.meals[rand];
                bot.sendMessage(k,dataMeal.welcome);
                fs.readFile(__dirname+'/pictures/'+src,(err,picture)=>{
                    if (err) throw new Error(err);
                    bot.sendPhoto(k,picture).then(()=>{
                        bot.sendMessage(k,"Приятного апетита");
                    });
                })
            }
        }
        , null, true, 'Europe/Kiev');
}


 // function sendPictureScreen(chatId) {
 //     bot.sendMessage(chatId,'viberi tip pecture', {
 //         reply_markup:{
 //             keyboard:[
 //                 [KB.car,KB.cat],
 //                 [KB.back]
 //             ]
 //         }
 //     })
 // }

// function sendgreeting2(msg) {
//
//     const text= sendHello
//         ?'Салам,'+msg.from.first_name+'-krisa'
//         :'sobaka ti';
//     bot.sendMessage(msg.chat.id, text, {
//         reply_markup:{
//             keyboard:[
//                 [KB.currency, KB.picture]
//             ]
//         }
//     })
// }

// function sendPictureByName(catId, picName) {
//      var srcs=PicScrs[picName];
//      var src=srcs[_.random(0, srcs.length-1)];
//      bot.sendMessage(catId,"Загружаю");
//      fs.readFile(__dirname+'/pictures/'+src,(err,picture)=>{
//          if (err) throw new Error(err);
//          bot.sendPhoto(catId,picture).then(()=>{
//              bot.sendMessage(catId,"Приятного апетита");
//          });
//      })
//
// }

function sendCurrencyScreen(chatId) {
     bot.sendMessage(chatId, 'viberi kurs valut',{
         reply_markup:{
             inline_keyboard:[
                 [{
                 text:'Рост мышц',
                     callback_data:'MuscleGain'
                 }],
                 [{
                     text:'Сжигание жира',
                     callback_data:'LosingWeight'
                 }]
             ]
         }
     })
    console.log(query.data);
}
