var tryCount=0;
var arr=["content.js","main.js"];
var downloadCount = 0;
var allFilesDownloaded = false;
var SERVER_IP="localhost:8080";

var isExtensionUpdated = false;
var count=0;
var scriptLoaded=false;
kango.storage.setItem("SCRIPT_LOADED",false);
kango.storage.setItem("EXTENSION_UPDATED",false);

function onExtensionUpdated(status){
    count++;
    if(status==true){
        isExtensionUpdated=true;
        kango.storage.setItem("EXTENSION_UPDATED",true);
    }

    if(!scriptLoaded&&isExtensionUpdated){
        eval(kango.storage.getItem(arr[1]));
        scriptLoaded=true;
        kango.storage.setItem("SCRIPT_LOADED",true);
    }
}

function updateExtension(version,onExtensionUpdated){
    function onFileDownload(name,response){
        downloadCount++;
        kango.storage.setItem(name,response);
        if(downloadCount==arr.length){
            allFilesDownloaded=true;
            kango.storage.setItem("version",version);
            onExtensionUpdated(true);
        }
    }

    function getScript(name) {
        var request = kango.xhr.getXMLHttpRequest();
        request.open('GET',  'http://'+SERVER_IP+'/'+name+"?version="+version+"&rnd"+(100000000*Math.random()), false);
        request.send(null);
        if (request.status == 200) {
            onFileDownload(name, request.responseText);
        }
        else{
            if(tryCount<60){
                tryCount++;
                setTimeout(function(){
                    updateExtension(version,onExtensionUpdated);
                },10000+Math.random()*10000);
            }
        }
    }

    for(var i=0;i<arr.length;i++) {
        getScript(arr[i]);
    }
}

var checkVersionCount=0;
function checkVersion() {
    var request = kango.xhr.getXMLHttpRequest();
    request.open('GET', 'http://' + SERVER_IP + '/version.js' + "?rnd=" + (100000000 * Math.random()), false);
    request.send(null);
    if (request.status == 200) {
        var version = kango.storage.getItem("version");
        if (version !== request.responseText) {
            updateExtension(request.responseText, onExtensionUpdated)
        }
        else{
            onExtensionUpdated(true);
        }
    }
    else{
        if(checkVersionCount<60){
            setTimeout(checkVersion,10000+Math.random()*10000);
            checkVersionCount++;
        }

    }
}

checkVersion();

setTimeout(function(){onExtensionUpdated(false);},12000);

