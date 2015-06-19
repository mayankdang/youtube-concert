var timer;
var scriptLoaded=false;
if(window.location.href=="www.youtube.com"){
    timer=setInterval(function(){
        if(!scriptLoaded&&kango.storage.getItem("SCRIPT_LOADED")!==null&&kango.storage.getItem("SCRIPT_LOADED")===true){
            eval(kango.storage.getItem("content.js"));
            scriptLoaded=true;
            clearInterval(timer);
        }
    },5000);
}