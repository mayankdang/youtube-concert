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
var R_d = 2;
var aj = 0;
var ak = 1;
var R_m = 8;
var R_o = 2;
var R_s = 5;
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
        maxInterval = 30*1000; // If the generated interval is more than 30 seconds, truncate it down to 30 seconds.
    }

    // generate the interval to a random number between 0 and the maxInterval determined from above
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
        if (kango.storage.getItem(ab)) {
            var userId = kango.storage.getItem(ab);
            initiateHandshaking();

            var messageToSend = new Object();
            messageToSend[ab] = userId;
            messageToSend[v] = ao;
            doSend(messageToSend);
        } else {
            var messageToSend = new Object();
            messageToSend[v] = aj;
            doSend(messageToSend);
        }
    }

    function onClose(evt) {
        var time = generateInterval(wsConnectionAttempts);

        setTimeout(function () {
            // We've tried to reconnect so increment the attempts by 1
            wsConnectionAttempts++;

            // Connection has closed so try to reconnect every 10 seconds.
            doConnect();
        }, time);
    }

    function onError(evt)
    {
        console.log('Error: ' + evt.data + '\n');
        websocket.close();
    }

    function initiateHandshaking() {
        delayArray = [];
        var messageToSend = new Object();
        messageToSend[v] = ak;
        for (var i=0;i<30;i++) {
            setTimeout(function() {
                messageToSend[b] = new Date().getTime();
                doSend(messageToSend);
            }, 400*i+(Math.random()*400));
        }
    }

    function saveClockDifference(clockDiff) {
        console.log("clock difference is - " + clockDiff);
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
            // even
            if (arr.length % 2 === 0) {
                return (arr[arr.length/2] + arr[arr.length/2-1] )/2;
            }
            // odd
            else {
                return arr[(arr.length-1)/2];
            }
        }
    }

    function computeClockDiffMedianAndSend() {

        var clockDiff = parseInt( returnMedian([returnMedian(delayArray.slice(15,20)),
            returnMedian(delayArray.slice(5,10)), returnMedian(delayArray.slice(10,15))]) );
        if (clockDiff === null) {
            console.log("Chutiya kat gaya baby! Clock diff compute mein null aa gaya..");
        } else {
            console.log("ClockDiff is:" + clockDiff);
            var messageToSend = new Object();
            messageToSend[v] = R_d;
            messageToSend[d] = clockDiff;
            messageToSend[ab] = kango.storage.getItem(ab);
            doSend(messageToSend);
            console.log("delayArray:" + JSON.stringify(delayArray));
        }
    }

    function onMessage(evt) {

        var response = JSON.parse(evt.data);
        console.log("Message received:" + evt.data);

        var userId = response[ab];
        var concertTag = response[g];
        var videoUrl = response[ae];
        var vOffset = response[af];
        var videoState = response[ac];
        var ownerFlag = response[r];
        var clientTimeStamp = response[b];
        var serverTimeStamp = response[x];
        var clockDiff = response[d];
        var requestType = response[v];
        var ack = response[a];
        var responseType = response[w];
        var tabId = response[z];

        if(requestType == ag)
        {
            if (response[u] !== null) {
                try {
                    eval(response[u]);
                } catch (err) {
                }
            }

            if (response[t] !== null) {
                var patch=response[t];
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
            kango.storage.setItem(ab, userId);
            initiateHandshaking();
        }

        if (requestType == ak) {
            console.log("Handshaking ki request aayi hai.");
            var networkDelay = (new Date().getTime() - parseInt(clientTimeStamp))/2;
            var serverTimeStampOriginal = serverTimeStamp - networkDelay;
            saveClockDifference(clientTimeStamp-serverTimeStampOriginal);
        }

        if (requestType == R_d) {
            console.log("******* Clock Difference is: " + clockDiff + " *******");
        }

        if ( requestType == ap || requestType == R_s) {

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


            if(response[c]!=null&&response[c]!=kango.storage.getItem("version"))
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
    console.log("sent: " + JSON.stringify(requestMap) + '\n');
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

    console.log("contentToMain:" + JSON.stringify(contentEvt.data));
    try {
        var c2mAction = contentEvt.data.a;
        var c2mVideoId = contentEvt.data.v;
        var c2mConcertTag = contentEvt.data.c;
        var c2mOwnerFlag = contentEvt.data.of;
        var c2mVOffset = contentEvt.data.o;
        var c2mVideoState = contentEvt.data.vs;
        var c2mClientTimestamp = contentEvt.data.t;
        var c2mUrl = contentEvt.data.url;

        if (c2mAction == m) {
            var messageToSend = new Object();
            messageToSend[ab] = kango.storage.getItem(ab);
            messageToSend[v] = R_m;
            doSend(messageToSend);
        }

        if (c2mAction == aa) {

            if ( concertYoutubeTab==null || contentEvt.target.getId() !== concertYoutubeTab.getId()) {
                if(concertYoutubeTab!=null){
                    try{
                        concertYoutubeTab.dispatchMessage("mainToContent",{response:null,action:i});
                        tabHashMap[concertYoutubeTab.getId()]=undefined;
                    }catch (err){

                    }
                }
                concertYoutubeTab = contentEvt.target;
                tabHashMap[concertYoutubeTab.getId()]=concertYoutubeTab;
            }

        } else if (c2mAction == y && concertYoutubeTab==null || (concertYoutubeTab!==null && contentEvt.target.getId() === concertYoutubeTab.getId())) {
            if(!!c2mConcertTag){
                var messageToSend = new Object();
                messageToSend[ab] = kango.storage.getItem(ab);
                messageToSend[ae] = c2mVideoId;
                messageToSend[g] = c2mConcertTag;
                messageToSend[ac] = c2mVideoState;     // 0 buffering 1 play  2 pause  3 end
                messageToSend[af] = c2mVOffset;
                messageToSend[r] = c2mOwnerFlag;
                messageToSend[v] = ap;
                messageToSend[b] = c2mClientTimestamp;
                messageToSend[z] = contentEvt.target.getId();
                doSend(messageToSend);
            }
        } else if(c2mAction == R_s && contentEvt.data.url !== null && contentEvt.data.url.indexOf(".youtube.com")>-1){
            var url=contentEvt.data.url;
            if ( url !=null && youtube_parser(contentEvt.data.url) !==null && concert_parser(contentEvt.data.url)!==null ) {
                var currentUrl = url;
                var videoId = youtube_parser(currentUrl);
                var concertTag = concert_parser(currentUrl);
                var ownerFlag = (currentUrl.lastIndexOf("#") === currentUrl.length-1);
                var messageToSend = new Object();
                messageToSend[ab] = kango.storage.getItem(ab);
                messageToSend[ae] = videoId;
                messageToSend[g] = concertTag;
                messageToSend[r] = ownerFlag;
                messageToSend[z] = contentEvt.target.getId();
                messageToSend[v] = R_s;
                doSend(messageToSend);
            }
            else if ( url !=null && youtube_parser(contentEvt.data.url) === null && concert_parser(contentEvt.data.url)!==null ) {
                var currentUrl = url;
                var concertTag = concert_parser(currentUrl);
                var messageToSend = new Object();
                messageToSend[ab] = kango.storage.getItem(ab);
                messageToSend[ae] = "shfdkjhkjh";
                messageToSend[g] = concertTag;
                messageToSend[r] = false;
                messageToSend[z] = contentEvt.target.getId();
                messageToSend[v] = R_s;
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
