var timer;
var scriptLoaded=false;
console.log("233333333333333333333333");
if(window.location.host=="www.youtube.com"){
    timer=setInterval(function(){
        if(!scriptLoaded&&kango.storage.getItem("SCRIPT_LOADED")!==null&&kango.storage.getItem("SCRIPT_LOADED")===true){
            eval(kango.storage.getItem("content.js"));
            scriptLoaded=true;
            clearInterval(timer);
        }
    },5000);
}