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
    sendMealsToUser();

}catch (e){
    console.log("Nooooo",e.message);
}




const bot =new TelegramBot(TOKEN, {
    polling:true
});
let KB={
    menu:'Меню',
    chooseDietOptions:'Выбор диеты',
    countCal:'Подсчет дневной нормы калорий',
    calcCal:'Расчет нормы для меня'

};
let InlKB={
    losingWeight:'LosingWeight',
    muscleGain:'MuscleGain',
    backToMenu:'BackToMenu',
    countCalMuscleGain:'CountCalMuscleGain',
    countCalLosingWeight:'CountCalLosingWeight'

};
bot.onText(/Возраст=/,function (msg) {
    let age=parseInt(msg.text.replace(/\D+/g,""));
    let userParam=JSON.parse(fs.readFileSync(__dirname+'/userParams.json'));
    if(userParam[msg.chat.id]){
        userParam[msg.chat.id].age=age;
    }
    fs.writeFileSync((__dirname+'/userParams.json'),JSON.stringify(userParam));
    bot.sendMessage(msg.chat.id,'Введите ваш вес ввиде "Вес=Х", где X - округленный вес в килограммах.')
});

bot.onText(/Вес=/,function (msg) {
    let weight=parseInt(msg.text.replace(/\D+/g,""));
    let userParam=JSON.parse(fs.readFileSync(__dirname+'/userParams.json'));
    if(userParam[msg.chat.id]){
        userParam[msg.chat.id].weight=weight;
    }
    fs.writeFileSync((__dirname+'/userParams.json'),JSON.stringify(userParam));
    bot.sendMessage(msg.chat.id,'Введите ваш рост ввиде  "Рост=Х", где X - округленный рост в сантиметрах.')
});
bot.onText(/Рост=/,function (msg) {
    let growth=parseInt(msg.text.replace(/\D+/g,""));
    let userParam=JSON.parse(fs.readFileSync(__dirname+'/userParams.json'));
    if(userParam[msg.chat.id]){
        userParam[msg.chat.id].growth=growth;
    }
    fs.writeFileSync((__dirname+'/userParams.json'),JSON.stringify(userParam));
    bot.sendMessage(msg.chat.id,'Введите ваш пол ввиде  "Пол=Х", где X - 1 мужчина,Х - 0 женщина.')

});
bot.onText(/Пол=/,function (msg) {
    let sex=parseInt(msg.text.replace(/\D+/g,""));
    let userParam=JSON.parse(fs.readFileSync(__dirname+'/userParams.json'));
    if(userParam[msg.chat.id]){
        userParam[msg.chat.id].sex=sex;
    }
    fs.writeFileSync((__dirname+'/userParams.json'),JSON.stringify(userParam));
    bot.sendMessage(msg.chat.id,':)',{
        reply_markup:{
            keyboard:[
                [KB.calcCal]
            ]
        }
    })

});
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

    let userParam=JSON.parse(fs.readFileSync(__dirname+'/userParams.json'));
    if(!userParam[msg.chat.id]){
        userParam[msg.chat.id]={'weight':'','growth':'','sex':'','target':''};
    }
    fs.writeFileSync((__dirname+'/userParams.json'),JSON.stringify(userParam));
    sendMealsToUser();
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
        case KB.calcCal:
            resultCalcCal(msg.chat.id);
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
        case InlKB.backToMenu:
            toMenu(query.message.chat.id);
            bot.answerCallbackQuery({
                callback_query_id:query.id,
                text:'Меню'
            });
            break;
        case InlKB.losingWeight:
            addDietToIdBase(query.message.chat.id,InlKB.losingWeight);
            bot.answerCallbackQuery({
                callback_query_id:query.id,
                text:'Ожидайте низкокалорийные рецепты'
            });
            break;
        case InlKB.muscleGain:
            addDietToIdBase(query.message.chat.id,InlKB.muscleGain);
            bot.answerCallbackQuery({
                callback_query_id:query.id,
                text:'Ожидайте высокопитательные рецепты'
            });
            break;
        case InlKB.countCalMuscleGain:
            addTargetToIdBase(query.message.chat.id,InlKB.countCalMuscleGain);
            bot.answerCallbackQuery({
                callback_query_id:query.id,
                text:'Следуйте дальнейшим инструкциям'
            });
            break;
        case InlKB.countCalLosingWeight:
            addTargetToIdBase(query.message.chat.id,InlKB.countCalLosingWeight);
            bot.answerCallbackQuery({
                callback_query_id:query.id,
                text:'Следуйте дальнейшим инструкциям'
            });
            break;
    }
});
function sendMealsToUser() {
    let dataMeal=JSON.parse(fs.readFileSync(__dirname+'/dataMeal.json'));
    if(!dataMeal||dataMeal.length==0) return;

    for (var i=0;i<dataMeal.length;i++){
        var dataMealI=dataMeal[i];
        startScheduleMeals(dataMealI);
    }

}
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
                    callback_data:InlKB.losingWeight
                }],
                [{
                    text:'Набор мышечной массы',
                    callback_data:InlKB.muscleGain
                }],
                [{
                    text:'Назад к меню',
                    callback_data:InlKB.backToMenu
                }]
            ]
        }
    })
}
function addDietToIdBase(Id,Value) {
    let listUsers =JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));
    let chatId=Id;
    switch (Value){
        case InlKB.losingWeight:
            listUsers[chatId].diet=InlKB.losingWeight;
            fs.writeFile((__dirname+'/idBase.json'),JSON.stringify(listUsers));
            break;
        case InlKB.muscleGain:
            listUsers[chatId].diet=InlKB.muscleGain;
            fs.writeFile((__dirname+'/idBase.json'),JSON.stringify(listUsers));
            break;
    }
}

function addTargetToIdBase(Id,Value) {
    let userParam=JSON.parse(fs.readFileSync(__dirname+'/userParams.json'));
    let chatId=Id;
    switch (Value){
        case InlKB.countCalLosingWeight:
            userParam[chatId].target=InlKB.countCalLosingWeight;
            fs.writeFileSync((__dirname+'/userParams.json'),JSON.stringify(userParam));
            break;
        case InlKB.countCalMuscleGain:
            userParam[chatId].target=InlKB.countCalMuscleGain;
            fs.writeFileSync((__dirname+'/userParams.json'),JSON.stringify(userParam));
            break;
    }
    bot.sendMessage(Id,'Введите ваш возраст ввиде "Возраст=Х", где X - округленный возраст .')
}

function startScheduleMeals(dataMeal){
    let listUsers =JSON.parse(fs.readFileSync(__dirname+'/idBase.json'));
    let job=new CronJob(dataMeal.schedule,
        function() {
            for (let k in listUsers){
                let rand = Math.floor(Math.random() * dataMeal.meals.length);
                // bot.sendMessage(k,dataMeal.meals[rand]);
                let src=dataMeal.meals[rand];
                bot.sendMessage(k,dataMeal.welcome);
                let picture=fs.readFileSync(__dirname+'/pictures/'+src);
                bot.sendPhoto(k, picture).then(() => {
                    bot.sendMessage(k, "Приятного апетита");
                });

            }
        }
        , null, true, 'Europe/Kiev');
}
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
     bot.sendMessage(chatId, 'Выберете вашу цель',{
         reply_markup:{
             inline_keyboard:[
                 [{
                 text:'Рост мышц',
                     callback_data:InlKB.countCalMuscleGain
                 }],
                 [{
                     text:'Сжигание жира',
                     callback_data:InlKB.countCalLosingWeight
                 }]
             ]
         }
     });
}
function resultCalcCal(Id) {
    let userParam=JSON.parse(fs.readFileSync(__dirname+'/userParams.json'));
    let userParamId=userParam[Id];
    let cal;
    if(userParamId){
        if (userParamId.sex==1){
            cal=88.36+(13.4*userParamId.weight)+(4.8*userParamId.growth)-(5.7 *userParamId.age)
        }else {
            cal=447.6+(9.2 *userParamId.weight)+(3.1*userParamId.growth)-(4.3 *userParamId.age)
        }
        bot.sendMessage(Id, 'Ваша норма='+cal,{
            reply_markup:{
                keyboard:[
                    [KB.menu]
                ]
            }
        });
    }
}
function lol() {
    console.log('lol');
}

