var IP = "192.168.0.102";
var PORT = "8000";
var websocket;
var wsConnectionAttempts = 1
var videoChecking=false;

// response macros
var USER_ID = "userId";
var CONCERT_TAG = "concertTag";
var VIDEO_URL = "videoUrl";
var VOFFSET = "vOffset";
var VIDEO_STATE = "videoState";
var OWNER_FLAG = "ownerFlag";
var CLIENT_TIMESTAMP = "clientTimeStamp";
var REQUEST_TYPE = "requestType";
var ACK = "ack";
var NETWORK_DELAY = "networkDelay";
var OWNER_DELAY = "ownerDelay";
var CONCERT_CREATED = "concertCreated";
var CONCERT_JOINED = "concertJoined";
var RESPONSE_TYPE = "responseType";
var CHUTIYA_KATA = "chutiyaKata";
var NO_CONCERT = "noConcert";
var I_AM_ALREADY_OWNER = "iAmAlreadyOwner";

// Request Types
var R_CREATE_USER = 0;
var R_HANDSHAKING = 1;
var R_NETWORK_DELAY = 2;
var R_VIDEO_UPDATE = 3;
var R_USER_ONLINE = 4;
var R_PAGE_LOADED = 5;

// contentToMainActions
var PAGE_LOADED = "pageLoaded";
var SYNC_VIDEO = "syncVideo";

var sentNetworkDelay=false;
var delayArray = [];

function generateInteval (k) {
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
        if (kango.storage.getItem(USER_ID)) {
            wsConnectionAttempts = 1;
            var userId = kango.storage.getItem(USER_ID);
            var messageToSend = new Object();
            messageToSend[USER_ID] = userId;
            messageToSend[REQUEST_TYPE] = R_USER_ONLINE;
            initiateHandshaking();
            doSend(messageToSend);
        } else {
            var messageToSend = new Object();
            messageToSend[REQUEST_TYPE] = R_CREATE_USER;
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
        messageToSend[REQUEST_TYPE] = R_HANDSHAKING;
        for (var i=0;i<5;i++) {
            setTimeout(function() {
                messageToSend[CLIENT_TIMESTAMP] = new Date().getTime();
                doSend(messageToSend);
            }, 200*i);
        }
    }

    function saveNetworkDelay(delay) {
        console.log("delay is - " + delay);
        if (!sentNetworkDelay) {
            if (delayArray.length>=3) {
                computeDelayMedianAndSend();
                sentNetworkDelay = true;
            } else {
                delayArray.push(parseInt(delay));
            }
        }
    }

    function sortNumberComparator(a,b) {
        return a - b;
    }

    function computeDelayMedianAndSend() {
        delayArray.sort(sortNumberComparator);
        // extra division by 2 to divide RoundTripTime RTT and get single way duration.

        var networkDelay = parseInt(delayArray[1]);
        var messageToSend = new Object();
        messageToSend[REQUEST_TYPE] = R_NETWORK_DELAY;
        messageToSend[NETWORK_DELAY] = networkDelay;
        messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
        doSend(messageToSend);
        console.log("delayArray:" + JSON.stringify(delayArray));
    }

    function onMessage(evt) {

        var response = JSON.parse(evt.data);
        console.log("Message received:" + evt.data);

        var userId = response[USER_ID];
        var concertTag = response[CONCERT_TAG];
        var videoUrl = response[VIDEO_URL];
        var vOffset = response[VOFFSET];
        var videoState = response[VIDEO_STATE];
        var ownerFlag = response[OWNER_FLAG];
        var clientTimeStamp = response[CLIENT_TIMESTAMP];
        var requestType = response[REQUEST_TYPE];
        var ack = response[ACK];
        var networkDelay = response[NETWORK_DELAY];
        var responseType=response[RESPONSE_TYPE];

        if (requestType == R_CREATE_USER) {
            kango.storage.setItem(USER_ID, userId);
            initiateHandshaking();
        }

        if (requestType == R_HANDSHAKING) {
            console.log("Handshaking ki request aayi hai.");
            var diff = new Date().getTime()-parseInt(clientTimeStamp);
            saveNetworkDelay(diff);
        }

        if (requestType == R_NETWORK_DELAY) {
            console.log("******* Network Delay is: " + networkDelay + " *******");
            kango.storage.setItem(NETWORK_DELAY, networkDelay);
        }

        if (requestType == R_VIDEO_UPDATE || requestType == R_PAGE_LOADED) {
            try {
                concertYoutubeTab.dispatchMessage("mainToContent",{response:response});
            } catch (exception) {

            }
        }
    }

    function doDisconnect() {
        websocket.close();
    }

}

function doSend(requestMap)
{
    console.log("sent: " + JSON.stringify(requestMap) + '\n');
    websocket.send(JSON.stringify(requestMap));
}

function concert_parser(url) {
    try{
        if(url.indexOf("youtube.com")>-1){
            if(url.lastIndexOf("#")==url.length-1){
                var turl=url.substring(0,url.length-1);
                var arr=turl.split("#");
                if(arr.length>=1){
                    return arr[arr.length-1].replace(/[^a-zA-Z0-9]/g, "");
                }
            }
            else if(url.lastIndexOf("#")>-1){
                var turl=url.substring(url.lastIndexOf("#")+1,url.length);
                var arr=turl.split("#");
                if(arr.length>=1){
                    return arr[arr.length-1].replace(/[^a-zA-Z0-9]/g, "");
                }
            }
        }
    }catch (err){
    }
    return null;
}

var concertLink="";
var concertYoutubeTab=null;
var concertTabId=-1;

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        return null;
    }
}

kango.addMessageListener("contentToMain", function(contentEvt) {

    console.log("contentToMain:" + contentEvt.data);

    try {
        var c2mAction = contentEvt.data.a;
        var c2mVideoId = contentEvt.data.v;
        var c2mConcertTag = contentEvt.data.c;
        var c2mOwnerFlag = contentEvt.data.of;
        var c2mVOffset = contentEvt.data.o;
        var c2mVideoState = contentEvt.data.vs;
        if (concertYoutubeTab!==null && c2mAction == SYNC_VIDEO) {
            var messageToSend = new Object();
            messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
            messageToSend[VIDEO_URL] = c2mVideoId;
            messageToSend[CONCERT_TAG] = c2mConcertTag;
            messageToSend[VIDEO_STATE] = c2mVideoState;     // 0 buffering 1 play  2 pause  3 end
            messageToSend[VOFFSET] = c2mVOffset;
            messageToSend[OWNER_FLAG] = c2mOwnerFlag;
            messageToSend[REQUEST_TYPE] = R_VIDEO_UPDATE;
            doSend(messageToSend);
        }
    } catch (err) {

    }
});

//
//kango.addMessageListener("optionsToMain", function(optionEvt) {
//    console.log("optionToMain:" + optionEvt.data.message);
//    doSend(optionEvt.data.message);
//});
//
//doConnect();

var currentUrl=null;
var videoId = null;
var concertTag = null;
var ownerFlag = null;

function handleEvent(event){
    if (
    // koi naya url...
    //        concertYoutubeTab==null||event.url !== currentUrl
    true
    )
        {
            if ( youtube_parser(event.url)!==null && concert_parser(event.url)!==null ) {
                currentUrl = event.url;
                videoId = youtube_parser(currentUrl);
                concertTag = concert_parser(currentUrl);
                ownerFlag = (currentUrl.lastIndexOf("#") === currentUrl.length-1);
                var messageToSend = new Object();
                messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
                messageToSend[VIDEO_URL] = videoId;
                messageToSend[CONCERT_TAG] = concertTag;
                messageToSend[OWNER_FLAG] = ownerFlag;
                messageToSend[REQUEST_TYPE] = R_PAGE_LOADED;
                doSend(messageToSend);
                concertYoutubeTab = event.target;
            }
            else {
                    concertYoutubeTab=null;
                }
         }
}

kango.browser.addEventListener(kango.browser.event.DOCUMENT_COMPLETE, function(event){
    handleEvent(event);
});

kango.browser.addEventListener(kango.browser.event.TAB_REMOVED, function(event){
    if (concertYoutubeTab !==null && concertYoutubeTab.getId()==event.tabId){
        concertYoutubeTab=null
    }
});

doConnect();