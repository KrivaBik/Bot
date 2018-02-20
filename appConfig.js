var fs=require('fs');

var configFileName=null;
var appConfig=null;

module.exports.setAppConfigName=function(configParamName){
    configFileName=configParamName;
};

module.exports.loadAppConfig=function(){
    appConfig=JSON.parse(fs.readFileSync(__dirname+'/'+configFileName+'.json'));
    if(!appConfig) return;
    return appConfig;
};
module.exports.getAppConfigParam= function(name){
    if(!appConfig) return null;
    return appConfig[name];
};