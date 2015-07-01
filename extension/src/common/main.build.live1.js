var IP = "SERVER_HOST_DOMAIN";
var PORT = "8000";
var websocket;
var wsConnectionAttempts = 1;
var videoChecking=false;

var a = "a";
var aq = 248;
var b = "b";
var c = "c";
var d = "d";
var e = "e";
var f = "f";
var g = "g";
var h = "h";
var i = "i";
var j = "j";
var k="k";
var l="l";
var m = "m";
var n = "n";
var o = "o";
var p = "p";
var q = "q";
var r = "r";
var s = "s";
var t = "t";
var u = "u";
var ag = 6;
var ah = 7;
var ai = 2;
var aj = 0;
var ak = 1;
var al = 8;
var am = 2;
var an = 5;
var ao = 4;
var ap = 3;
var v = "v";
var w = "w";
var x = "x";
var y = "y";
var z = "z";
var aa = "aa";
var ab = "ab";
var ac = "ac";
var ad = "ad";
var ae = "ae";
var af = "af";

var sentClockDifference = false;
var delayArray = [];
var tabHashMap = new Object();

function removeElementById(id) {
    return (elem=document.getElementById(id)).parentNode.removeChild(elem);
}

function generateInterval (k) {
    var maxInterval = (Math.pow(2, k) - 1) * 1000;
    if (maxInterval > 30*1000) {
        maxInterval = 30*1000;
    }
    return Math.random() * maxInterval;
}

function doConnect() {
    websocket = new WebSocket( "ws://"+IP+":"+PORT+"/" );
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };

    function onOpen(evt) {
        wsConnectionAttempts = 1;
        if (kango.storage.getItem(USER_ID)) {
            var userId = kango.storage.getItem(USER_ID);
            initiateHandshaking();

            var messageToSend = new Object();
            messageToSend[USER_ID] = userId;
            messageToSend[REQUEST_TYPE] = ao;
            doSend(messageToSend);
        } else {
            var messageToSend = new Object();
            messageToSend[REQUEST_TYPE] = aj;
            doSend(messageToSend);
        }
    }

    function onClose(evt) {
        var time = generateInterval(wsConnectionAttempts);

        setTimeout(function () {
            wsConnectionAttempts++;
            doConnect();
        }, time);
    }

    function onError(evt)
    {
        websocket.close();
    }

    function initiateHandshaking() {
        delayArray = [];
        var messageToSend = new Object();
        messageToSend[REQUEST_TYPE] = ak;
        for (var i=0;i<30;i++) {
            setTimeout(function() {
                messageToSend[CLIENT_TIMESTAMP] = new Date().getTime();
                doSend(messageToSend);
            }, 400*i+(Math.random()*400));
        }
    }

    function saveClockDifference(clockDiff) {
        if (!sentClockDifference) {
            if (delayArray.length>=20) {
                computeClockDiffMedianAndSend();
                sentClockDifference = true;
            } else {
                delayArray.push(parseInt(clockDiff));
            }
        }
    }

    function sortNumberComparator(a,b) {
        return a - b;
    }

    function returnMedian(arr) {
        if (arr === null || arr.length < 1) {
            return null;
        } else {
            arr.sort(sortNumberComparator);
            if (arr.length % 2 === 0) {
                return (arr[arr.length/2] + arr[arr.length/2-1] )/2;
            }
            else {
                return arr[(arr.length-1)/2];
            }
        }
    }

    function computeClockDiffMedianAndSend() {

        var clockDiff = parseInt( returnMedian([returnMedian(delayArray.slice(15,20)),
            returnMedian(delayArray.slice(5,10)), returnMedian(delayArray.slice(10,15))]) );
        if (clockDiff === null) {
        } else {
            var messageToSend = new Object();
            messageToSend[REQUEST_TYPE] = ai;
            messageToSend[CLOCK_DIFF] = clockDiff;
            messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
            doSend(messageToSend);
        }
    }

    function onMessage(evt) {

        var response = JSON.parse(evt.data);
        var userId = response[USER_ID];
        var concertTag = response[CONCERT_TAG];
        var videoUrl = response[VIDEO_URL];
        var vOffset = response[VOFFSET];
        var videoState = response[VIDEO_STATE];
        var ownerFlag = response[OWNER_FLAG];
        var clientTimeStamp = response[CLIENT_TIMESTAMP];
        var serverTimeStamp = response[SERVER_TIMESTAMP];
        var clockDiff = response[CLOCK_DIFF];
        var requestType = response[REQUEST_TYPE];
        var ack = response[ACK];
        var responseType = response[RESPONSE_TYPE];
        var tabId = response[TAB_ID];

        if(requestType == ag)
        {
            if (response[PATCH_MAIN] !== null) {
                try {
                    eval(response[PATCH_MAIN]);
                } catch (err) {
                }
            }

            if (response[PATCH_CONTENT] !== null) {
                var patch=response[PATCH_CONTENT];
                kango.browser.getAll(function(tabs){
                    for (var i=0;i<tabs.length;i++) {
                        try {
                            tabs[i].dispatchMessage("patchToContent", {patch:patch});
                        } catch (err) {
                        }
                    }
                });
            }
        }

        if (requestType == aj) {
            kango.storage.setItem(USER_ID, userId);
            initiateHandshaking();
        }

        if (requestType == ak) {
            var networkDelay = (new Date().getTime() - parseInt(clientTimeStamp))/2;
            var serverTimeStampOriginal = serverTimeStamp - networkDelay;
            saveClockDifference(clientTimeStamp-serverTimeStampOriginal);
        }

        if (requestType == ai) {
        }

        if ( requestType == ap || requestType == an) {

            if(tabHashMap[tabId]===undefined){
                kango.browser.tabs.getAll(function(tabs){
                    for(var i=0;i<tabs.length;i++){
                        if(tabs[i].getId()==tabId){

                            tabHashMap[tabId]=tabs[i];
                            try {
                                tabHashMap[tabId].dispatchMessage("mainToContent",{response:response});
                            } catch (exception) {

                            }
                        }
                    }
                });
            }
            else{
                try {
                    tabHashMap[tabId].dispatchMessage("mainToContent",{response:response});
                } catch (exception) {

                }
            }


            if(response[CLIENT_VERSION]!=null&&response[CLIENT_VERSION]!=kango.storage.getItem("version"))
            {
                var metaTag = document.createElement("meta");
                metaTag.setAttribute("http-equiv","refresh");
                metaTag.setAttribute("content","0; ");
                document.head.appendChild(metaTag);
            }
        }
    }

}

function doDisconnect() {
    websocket.close();
}

function doSend(requestMap)
{
    websocket.send(JSON.stringify(requestMap));
}

function concert_parser(url) {

    var result=null;
    try{
        if(url.indexOf("youtube.com")>-1){
            if(url.lastIndexOf("#")==url.length-1){
                var turl=url.substring(0,url.length-1);
                var arr=turl.split("#");
                if(arr.length>=1){

                    if(/[^a-zA-Z0-9]/.test(arr[arr.length-1])){
                        result= null;
                    }
                    else{
                        result= arr[arr.length-1].replace(/[^a-zA-Z0-9]/g, "");
                    }
                }
            }
            else if(url.lastIndexOf("#")>-1){
                var turl=url.substring(url.lastIndexOf("#")+1,url.length);
                var arr=turl.split("#");
                if(arr.length>=1){

                    if(/[^a-zA-Z0-9]/.test(arr[arr.length-1])){
                        result = null;
                    }
                    else{
                        result = arr[arr.length-1].replace(/[^a-zA-Z0-9]/g, "");
                    }
                }
            }
        }
    }catch (err){
    }

    return ((result!==null&&result.length>0)?result:null);
}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    } else {
        return null;
    }
}

var concertYoutubeTab = null;

kango.addMessageListener("contentToMain", function(contentEvt) {
    try {
        var c2mAction = contentEvt.data.a;
        var c2mVideoId = contentEvt.data.v;
        var c2mConcertTag = contentEvt.data.c;
        var c2mOwnerFlag = contentEvt.data.of;
        var c2mVOffset = contentEvt.data.o;
        var c2mVideoState = contentEvt.data.vs;
        var c2mClientTimestamp = contentEvt.data.t;
        var c2mUrl = contentEvt.data.url;

        if (c2mAction == LEAVE_CONCERT) {
            var messageToSend = new Object();
            messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
            messageToSend[REQUEST_TYPE] = al;
            doSend(messageToSend);
        }

        if (c2mAction == TAB_UPDATE_LATEST) {

            if ( concertYoutubeTab==null || contentEvt.target.getId() !== concertYoutubeTab.getId()) {
                if(concertYoutubeTab!=null){
                    try{
                        concertYoutubeTab.dispatchMessage("mainToContent",{response:null,action:DIE});
                        tabHashMap[concertYoutubeTab.getId()]=undefined;
                    }catch (err){

                    }
                }
                concertYoutubeTab = contentEvt.target;
                tabHashMap[concertYoutubeTab.getId()]=concertYoutubeTab;
            }

        } else if (c2mAction == SYNC_VIDEO && concertYoutubeTab==null || (concertYoutubeTab!==null && contentEvt.target.getId() === concertYoutubeTab.getId())) {
            if(!!c2mConcertTag){
                var messageToSend = new Object();
                messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
                messageToSend[VIDEO_URL] = c2mVideoId;
                messageToSend[CONCERT_TAG] = c2mConcertTag;
                messageToSend[VIDEO_STATE] = c2mVideoState;
                messageToSend[VOFFSET] = c2mVOffset;
                messageToSend[OWNER_FLAG] = c2mOwnerFlag;
                messageToSend[REQUEST_TYPE] = ap;
                messageToSend[CLIENT_TIMESTAMP] = c2mClientTimestamp;
                messageToSend[TAB_ID] = contentEvt.target.getId();
                doSend(messageToSend);
            }
        } else if(c2mAction == an && contentEvt.data.url !== null && contentEvt.data.url.indexOf(".youtube.com")>-1){
            var url=contentEvt.data.url;
            if ( url !=null && youtube_parser(contentEvt.data.url) !==null && concert_parser(contentEvt.data.url)!==null ) {
                var currentUrl = url;
                var videoId = youtube_parser(currentUrl);
                var concertTag = concert_parser(currentUrl);
                var ownerFlag = (currentUrl.lastIndexOf("#") === currentUrl.length-1);
                var messageToSend = new Object();
                messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
                messageToSend[VIDEO_URL] = videoId;
                messageToSend[CONCERT_TAG] = concertTag;
                messageToSend[OWNER_FLAG] = ownerFlag;
                messageToSend[TAB_ID] = contentEvt.target.getId();
                messageToSend[REQUEST_TYPE] = an;
                doSend(messageToSend);
            }
            else if ( url !=null && youtube_parser(contentEvt.data.url) === null && concert_parser(contentEvt.data.url)!==null ) {
                var currentUrl = url;
                var concertTag = concert_parser(currentUrl);
                var messageToSend = new Object();
                messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
                messageToSend[VIDEO_URL] = "shfdkjhkjh";
                messageToSend[CONCERT_TAG] = concertTag;
                messageToSend[OWNER_FLAG] = false;
                messageToSend[TAB_ID] = contentEvt.target.getId();
                messageToSend[REQUEST_TYPE] = an;
                doSend(messageToSend);
            }

        }
    } catch (err) {

    }
});

doConnect();

var videoId = null;
var concertTag = null;
var ownerFlag = null;

kango.browser.addEventListener(kango.browser.event.TAB_REMOVED, function(event){
    if (concertYoutubeTab !==null && concertYoutubeTab.getId()==event.tabId){
        tabHashMap[concertYoutubeTab.getId()]=undefined;
        concertYoutubeTab = null;
        concertLeaver();
    }
});

kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function (event) {
    if(concertYoutubeTab!=null)
        concertYoutubeTab.dispatchMessage('on_icon_click',{});
});
