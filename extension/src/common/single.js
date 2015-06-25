/////////////  TOCK JS  //////////////////////

Date.now=Date.now||function(){return+new Date};if(typeof Function.prototype.bind!="function"){Function.prototype.bind=function(ctx){var args=Array.prototype.slice.call(arguments,1),fn=this;return function(){args.push.apply(args,arguments);return fn.apply(ctx,args)}}}(function(root,factory){if(typeof define==="function"&&define.amd){define(factory)}else if(typeof exports==="object"){module.exports=factory()}else{root.Tock=factory()}})(this,function(){function _tick(){this.time+=this.interval;if(this.countdown&&this.duration_ms-this.time<0){this.final_time=0;this.go=false;this.callback(this);window.clearTimeout(this.timeout);this.complete(this);return}else{this.callback(this)}var diff=Date.now()-this.start_time-this.time,next_interval_in=diff>0?this.interval-diff:this.interval;if(next_interval_in<=0){this.missed_ticks=Math.floor(Math.abs(next_interval_in)/this.interval);this.time+=this.missed_ticks*this.interval;if(this.go){_tick.call(this)}}else if(this.go){this.timeout=window.setTimeout(_tick.bind(this),next_interval_in)}}function _startCountdown(duration){this.duration_ms=duration;this.start_time=Date.now();this.time=0;this.go=true;_tick.call(this)}function _startTimer(start_offset){this.start_time=start_offset||Date.now();this.time=0;this.go=true;_tick.call(this)}var MILLISECONDS_RE=/^\s*(\+|-)?\d+\s*$/,MM_SS_RE=/^(\d{1,2}):(\d{2})$/,MM_SS_ms_OR_HH_MM_SS_RE=/^(\d{1,2}):(\d{2})(?::|\.)(\d{2,3})$/,MS_PER_HOUR=36e5,MS_PER_MIN=6e4,MS_PER_SEC=1e3,yyyy_mm_dd_HH_MM_SS_ms_RE=/^(\d{4})-([0-1]\d)-([0-3]\d)(?:\s|T)(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3})Z?)?$/;var Tock=function(options){options=options||{};if(!(this instanceof Tock))return new Tock(options);Tock.instances=(Tock.instances||0)+1;this.go=false;this.timeout=null;this.missed_ticks=null;this.interval=options.interval||10;this.countdown=options.countdown||false;this.start_time=0;this.pause_time=0;this.final_time=0;this.duration_ms=0;this.time=0;this.callback=options.callback||function(){};this.complete=options.complete||function(){}};Tock.prototype.reset=function(){if(this.countdown){return false}this.stop();this.start_time=0;this.time=0};Tock.prototype.start=function(time){if(this.go)return false;time=time?this.timeToMS(time):0;this.start_time=time;this.pause_time=0;if(this.countdown){_startCountdown.call(this,time)}else{_startTimer.call(this,Date.now()-time)}};Tock.prototype.stop=function(){this.pause_time=this.lap();this.go=false;window.clearTimeout(this.timeout);if(this.countdown){this.final_time=this.duration_ms-this.time}else{this.final_time=Date.now()-this.start_time}};Tock.prototype.pause=function(){if(this.go){this.pause_time=this.lap();this.stop()}else{if(this.pause_time){if(this.countdown){_startCountdown.call(this,this.pause_time)}else{_startTimer.call(this,Date.now()-this.pause_time)}this.pause_time=0}}};Tock.prototype.lap=function(){if(this.go){var now;if(this.countdown){now=this.duration_ms-(Date.now()-this.start_time)}else{now=Date.now()-this.start_time}return now}return this.pause_time||this.final_time};Tock.prototype.msToTime=function(ms){if(ms<=0){return"00:00.000"}var milliseconds=(ms%MS_PER_SEC).toString(),seconds=Math.floor(ms/MS_PER_SEC%60).toString(),minutes=Math.floor(ms/MS_PER_MIN%60).toString();if(milliseconds.length===1){milliseconds="00"+milliseconds}else if(milliseconds.length===2){milliseconds="0"+milliseconds}if(seconds.length===1){seconds="0"+seconds}if(minutes.length===1){minutes="0"+minutes}return minutes+":"+seconds+"."+milliseconds};Tock.prototype.msToTimecode=function(ms){if(ms<=0){return"00:00:00"}var seconds=Math.floor(ms/MS_PER_SEC%60).toString(),minutes=Math.floor(ms/MS_PER_MIN%60).toString(),MS_PER_HOURs=Math.floor(ms/MS_PER_HOUR%60).toString();if(seconds.length===1){seconds="0"+seconds}if(minutes.length===1){minutes="0"+minutes}if(MS_PER_HOURs.length===1){MS_PER_HOURs="0"+MS_PER_HOURs}return MS_PER_HOURs+":"+minutes+":"+seconds};Tock.prototype.timeToMS=function(time){if(MILLISECONDS_RE.test(String(time))){return time}var ms,time_split,match,date,now=new Date;if(MM_SS_RE.test(time)){time_split=time.split(":");ms=parseInt(time_split[0],10)*MS_PER_MIN;ms+=parseInt(time_split[1],10)*MS_PER_SEC}else{match=time.match(MM_SS_ms_OR_HH_MM_SS_RE);if(match){if(match[3].length==3||parseInt(match[3],10)>59){ms=parseInt(match[1],10)*MS_PER_MIN;ms+=parseInt(match[2],10)*MS_PER_SEC;ms+=parseInt(match[3],10)}else{ms=parseInt(match[1],10)*MS_PER_HOUR;ms+=parseInt(match[2],10)*MS_PER_MIN;ms+=parseInt(match[3],10)*MS_PER_SEC}}else if(yyyy_mm_dd_HH_MM_SS_ms_RE.test(time)){date=new Date;now=new Date;match=time.match(yyyy_mm_dd_HH_MM_SS_ms_RE);date.setYear(match[1]);date.setMonth(match[2]);date.setDate(match[3]);date.setHours(match[4]);date.setMinutes(match[5]);date.setSeconds(match[6]);if(typeof match[7]!=="undefined"){date.setMilliseconds(match[7])}ms=Math.max(0,date.getTime()-now.getTime())}else{now=new Date;ms=Date.parse(time);if(!isNaN(ms)){ms=Math.max(0,ms-now.getTime())}else{ms=0}}}return ms};return Tock});

var LOCALSTORAGE_USER_ID="21321321213";
var LOCALSTORAGE_TAB_ID=123456;
///////////////  MAIN JS    ///////////////////////////////////////////////////////=
var IP = "52.74.240.238";
var PORT = "8000";
var websocket;
var wsConnectionAttempts = 1;
var videoChecking=false;

// response macros
var USER_ID = "userId";
var CONCERT_TAG = "concertTag";
var VIDEO_URL = "videoUrl";
var VOFFSET = "vOffset";
var VIDEO_STATE = "videoState";
var OWNER_FLAG = "ownerFlag";
var CLIENT_TIMESTAMP = "clientTimeStamp";
var SERVER_TIMESTAMP = "serverTimeStamp";
var CLOCK_DIFF = "clockDiff";
var REQUEST_TYPE = "requestType";
var ACK = "ack";
var OWNER_DELAY = "ownerDelay";
var CONCERT_CREATED = "concertCreated";
var CONCERT_JOINED = "concertJoined";
var RESPONSE_TYPE = "responseType";
var CONCERT_TAKEN = "concertTaken";
var NO_CONCERT = "noConcert";
var I_AM_ALREADY_OWNER = "iAmAlreadyOwner";
var DIE = "die";
var TAB_ID = "tab_id";

// Request Types
var R_CREATE_USER = 0;
var R_HANDSHAKING = 1;
var R_CLOCK_DIFF = 2;
var R_VIDEO_UPDATE = 3;
var R_USER_ONLINE = 4;
var R_PAGE_LOADED = 5;

// contentToMainActions
var PAGE_LOADED = "pageLoaded";
var SYNC_VIDEO = "syncVideo";
var TAB_UPDATE_LATEST = "tabUpdateLatest";

var sentClockDifference = false;
var delayArray = [];
var tabHashMap = new Object();

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
        if (LOCALSTORAGE_USER_ID) {
            var userId = LOCALSTORAGE_USER_ID;
            initiateHandshaking();

            var messageToSend = new Object();
            messageToSend[USER_ID] = userId;
            messageToSend[REQUEST_TYPE] = R_USER_ONLINE;
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
            }, 300*i);
        }
    }

    function saveClockDifference(clockDiff) {
        console.log("clock difference is - " + clockDiff);
        if (!sentClockDifference) {
            if (delayArray.length>=3) {
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

    function computeClockDiffMedianAndSend() {
        delayArray.sort(sortNumberComparator);

        var clockDiff = parseInt(delayArray[1]);
        var messageToSend = new Object();
        messageToSend[REQUEST_TYPE] = R_CLOCK_DIFF;
        messageToSend[CLOCK_DIFF] = clockDiff;
        messageToSend[USER_ID] = LOCALSTORAGE_USER_ID;
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
        var serverTimeStamp = response[SERVER_TIMESTAMP];
        var clockDiff = response[CLOCK_DIFF];
        var requestType = response[REQUEST_TYPE];
        var ack = response[ACK];
        var responseType = response[RESPONSE_TYPE];
        var tabId = response[TAB_ID];

        if (requestType == R_CREATE_USER) {
            initiateHandshaking();
        }

        if (requestType == R_HANDSHAKING) {
            console.log("Handshaking ki request aayi hai.");
            var networkDelay = (new Date().getTime() - parseInt(clientTimeStamp))/2;
            var serverTimeStampOriginal = serverTimeStamp - networkDelay;
            saveClockDifference(clientTimeStamp-serverTimeStampOriginal);
        }

        if (requestType == R_CLOCK_DIFF) {
            console.log("******* Clock Difference is: " + clockDiff + " *******");

            if(true)
            {
                currentUrl = getLocation();
                videoId = youtube_parser(currentUrl);
                concertTag = concert_parser(currentUrl);
                ownerFlag = false;
                var messageToSend = new Object();
                messageToSend[USER_ID] = LOCALSTORAGE_USER_ID;
                messageToSend[VIDEO_URL] = videoId;
                messageToSend[CONCERT_TAG] = "88";
                messageToSend[OWNER_FLAG] = false;
                messageToSend[TAB_ID] = LOCALSTORAGE_TAB_ID;
                messageToSend[REQUEST_TYPE] = R_PAGE_LOADED;
                doSend(messageToSend);
            }

        }

        if ( requestType == R_VIDEO_UPDATE || requestType == R_PAGE_LOADED) {
            mainToContent({response:response});
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
    return "88";
}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        return null;
    }
}

var concertYoutubeTab = null;

function contentToMain(message) {

    console.log("contentToMain:" + JSON.stringify(message));
    try {

        var c2mAction = message.a;
        var c2mVideoId = message.v;
        var c2mConcertTag = message.c;
        var c2mOwnerFlag = message.of;
        var c2mVOffset = message.o;
        var c2mVideoState = message.vs;
        var c2mClientTimestamp = message.t;
        if (c2mAction == SYNC_VIDEO ) {

            var messageToSend = new Object();
            messageToSend[USER_ID] = LOCALSTORAGE_USER_ID;
            messageToSend[VIDEO_URL] = c2mVideoId;
            messageToSend[CONCERT_TAG] = c2mConcertTag;
            messageToSend[VIDEO_STATE] = c2mVideoState;     // 0 buffering 1 play  2 pause  3 end
            messageToSend[VOFFSET] = c2mVOffset;
            messageToSend[OWNER_FLAG] = c2mOwnerFlag;
            messageToSend[REQUEST_TYPE] = R_VIDEO_UPDATE;
            messageToSend[CLIENT_TIMESTAMP] = c2mClientTimestamp;
            doSend(messageToSend);

        }
    } catch (err) {

    }
};

doConnect();

var currentUrl=null;
var videoId = null;
var concertTag = null;
var ownerFlag = null;


//////////////////////////////////////////// CONTENT JS ///////////////////////////////////////////////////////////


var timeScriptLoaded = new Date().getTime();
var threshold = 42;
var isOwner=false;
var videoChecking=false;
var playTime=new Date().getTime();
console.log("helloooooooooooooooooooo");
var link=getLocation();
var concertRole= -1; // -1 initially, 1 for owner, 2 for joinee.
// for sync-ers
var joineePlayerOffset = -1;
var joineeUpdatedTimestamp = -1;
var ownerPlayerOffset = -1;
var ownerUpdatedTimestamp = -1;
var bufferDelay = 800;      // can be something more than 500.
var preloadDuration = 50;
var EXTRA_DELAY=246;
var BUFFER_DELAY=500;

// response macros
var USER_ID = "userId";
var CONCERT_TAG = "concertTag";
var VIDEO_URL = "videoUrl";
var VOFFSET = "vOffset";
var VIDEO_STATE = "videoState";
var OWNER_FLAG = "ownerFlag";
var CLIENT_TIMESTAMP = "clientTimeStamp";
var VIDEO_TIME = "videoTime";
var CLIENT_TIMESTAMP = "clientTimeStamp";
var REQUEST_TYPE = "requestType";
var ACK = "ack";
var NETWORK_DELAY = "networkDelay";
var OWNER_DELAY = "ownerDelay";
var AWESOME_DELAY = 248;

// contentToMainActions
var PAGE_LOADED = "pageLoaded";
var SYNC_VIDEO = "syncVideo";
var TAB_UPDATE_LATEST = "tabUpdateLatest";
var CONCERT_CREATED = "concertCreated";
var CONCERT_JOINED = "concertJoined";
var RESPONSE_TYPE = "responseType";
var CONCERT_TAKEN = "concertTaken";
var NO_CONCERT = "noConcert";
var I_AM_ALREADY_OWNER = "iAmAlreadyOwner";
var LOAD_VIDEO = "loadVideo"

// Request Types
var R_CREATE_USER = 0;
var R_HANDSHAKING = 1;
var R_NETWORK_DELAY = 2;
var R_VIDEO_UPDATE = 3;
var R_USER_ONLINE = 4;
var R_PAGE_LOADED = 5;


var DIE = "die";

var videoSynchronizedFlag = true;
var videoSynchronizedSystemTime = null;
var videoState=null;

var goTo = null;
var controlFlag = true;
var events= [];

function concert_parser(url){
    try {
        if (url.indexOf("youtube.com")>-1) {
            if (url.lastIndexOf("#")==url.length-1) {
                var turl = url.substring(0,url.length-1);
                var arr = turl.split("#");
                if (arr.length>=1) {
                    return arr[arr.length-1].replace(/[^a-zA-Z0-9]/g, "");
                }
            }
            else if(url.lastIndexOf("#")>-1) {
                var turl = url.substring(url.lastIndexOf("#")+1,url.length);
                var arr = turl.split("#");
                if (arr.length>=1) {
                    return arr[arr.length-1].replace(/[^a-zA-Z0-9]/g, "");
                }
            }
        }
    } catch (err) { }
    return null;
}

function youtube_parser(url)  {
    return "O-zpOMYRi0w";
}

var tempurl=getLocation();
var concertTag=concert_parser(getLocation());
var ownerFlag = (youtube_parser(tempurl)!==null&&concert_parser(tempurl)&&tempurl.lastIndexOf("#")==tempurl.length-1);

var TAB_YOUTUBE = 0;
var TAB_YOUTUBE_OWNER = 1;
var TAB_YOUTUBE_JOINEE = 2;
var TAB_ELSE = -1;

function getUrlType(url){
    var urlType = TAB_ELSE;
    if(
        youtube_parser(url) !=  null
        && concert_parser(url) != null
        && url.lastIndexOf("#") == url.length-1
    )
    {
        urlType=TAB_YOUTUBE_OWNER;
    }
    else if(
        (
        concert_parser(url) != null
        && url.lastIndexOf("#") != url.length-1
        )
    )
    {
        urlType=TAB_YOUTUBE_JOINEE;
    }
    else if(
        window.location.host.indexOf(".youtube.com")>-1
    )
    {
        urlType=TAB_YOUTUBE;
    }
    return urlType;
}

function getTransitionType(vid,ct,of){
    if(vid===null||of===null){
        return -1;
    }

    var url=window.location.protocol+"//"+window.location.host+"/watch?v="+vid+"#"+ct+(of===true?"#":"");
    return getUrlType(url);
}

var globalVideoId = youtube_parser(getLocation());
var globalConcertTag = concert_parser(getLocation());
var globalOwnerFlag = ((globalVideoId!==null&&globalConcertTag!==null)?(getLocation().lastIndexOf("#")===getLocation().length-1):null);

function loadUrl(vid,ct,of) {
    if(vid!==null&&ct!==null&&of!==null&& (globalVideoId!==vid || ct!==globalConcertTag || of!==globalOwnerFlag))
    {
        var u = window.location.protocol+"//"+window.location.host+"/watch?v="+vid+"#"+ct+(of===true?"#":"");
        globalVideoId=vid;
        globalConcertTag=ct;
        globalOwnerFlag=of;

        //todo: best way to redirect or reload this url;
//        getLocation() = u;
        var metaTag = document.createElement("meta");
        metaTag.setAttribute("http-equiv","refresh");
        metaTag.setAttribute("content","1; watch?v="+vid+"#"+ct+(of===true?"#":""));
        document.head.appendChild(metaTag);


    }
}

function redirectBasedOnState(vid,ct,of){

    var toGo = getTransitionType(vid, ct, of);
    var currentTabState = getTransitionType(globalVideoId, globalConcertTag, globalOwnerFlag);

    if(currentTabState === TAB_ELSE) {
        if (toGo !== TAB_ELSE) {
            // nothing.
        }
    } else if(currentTabState === TAB_YOUTUBE){

        if (of===null) {
            if(toGo===TAB_YOUTUBE){
                //check
            }
            else if(toGo===TAB_ELSE){

            }
        } else {
            loadUrl(vid, ct, of);
        }
    }
    else if (currentTabState === TAB_YOUTUBE_OWNER) {
        if (toGo === TAB_YOUTUBE){
            loadUrl (vid, globalConcertTag, globalOwnerFlag);
        } else if (toGo === TAB_YOUTUBE_OWNER){
            // todo: broadcast new video loaded
            loadUrl(vid, ct, of);
        }
        else if(toGo ===TAB_YOUTUBE_JOINEE){
            loadUrl(vid,ct,of);
        }
        else if(toGo===TAB_ELSE){

        }
    }
    else if(currentTabState===TAB_YOUTUBE_JOINEE){
        if(toGo === TAB_YOUTUBE){
            //
        }
        else if(toGo === TAB_YOUTUBE_OWNER){
            loadUrl(vid,ct,of);
        }
        else if(toGo === TAB_YOUTUBE_JOINEE){
            loadUrl(vid,ct,of);
        }
        else if(toGo === TAB_ELSE){

        }
    }
}

function getEvent(vOffset, videoState, videoId, clientTimestamp) {
    return { clientTimestamp:clientTimestamp, vOffset:vOffset, videoState:videoState, videoId:videoId };
}


videoChecking=true;

function onOwnerUpdate(vOffset, videoState, videoId, clientTimestamp) {
    if (
        (vOffset !== null)
        && (videoState !== null)
        && (videoId !== null)
        && (clientTimestamp !== null)
    ) {
        var event = getEvent(vOffset , videoState, videoId, clientTimestamp);
        events.push(event);
    }
}


function mainToContent(message){

    // NOW TAKE OUT evt.data.response[CLIENT_TIMESTAMP]

    console.log("Received message from main:" + JSON.stringify(message));
    var response = message.response;

    if(response!=null&&response[CLIENT_TIMESTAMP]!=null&&!ownerFlag){
        response[CLIENT_TIMESTAMP]=response[CLIENT_TIMESTAMP]-AWESOME_DELAY;
    }

    var responseType = response[RESPONSE_TYPE];
    ownerFlag = response[OWNER_FLAG];
    var videoId = response[VIDEO_URL];
    var clientTimestamp = response[CLIENT_TIMESTAMP];
    console.log("...............Response from main:" + JSON.stringify(message));

    if (response != null && response[REQUEST_TYPE] == R_VIDEO_UPDATE && response[OWNER_FLAG] == false) {
        console.log("Bakchodi - Not owner dude!");
        // joinee handle this

        try {
            redirectBasedOnState(videoId,response[CONCERT_TAG],ownerFlag);
        } catch (err) {
        }

        onOwnerUpdate(response[VOFFSET] , response[VIDEO_STATE], response[VIDEO_URL], response[CLIENT_TIMESTAMP]);

    }
    else if (response!=null && response[REQUEST_TYPE]== R_PAGE_LOADED) {

        if (responseType == CONCERT_CREATED) {
            alert(responseType);
        } else if (responseType==CONCERT_TAKEN) {
            alert(responseType);
        } else if (responseType==CONCERT_JOINED) {
            try {
                redirectBasedOnState(videoId,response[CONCERT_TAG],ownerFlag);
            }catch (err){

            }
            onOwnerUpdate(response[VOFFSET] , response[VIDEO_STATE], response[VIDEO_URL], response[CLIENT_TIMESTAMP]);
        } else if (responseType==NO_CONCERT) {
            alert(responseType);
        } else if (responseType==I_AM_ALREADY_OWNER) {
            alert(responseType);
        }
    }
}

function pauseCurrentVideo() {
    try {
        executeOnYoutube("document.getElementsByTagName('video')[0].pause()","void");
    } catch (exception) {}
}

function playCurrentVideo() {
    try {
        executeOnYoutube("document.getElementsByTagName('video')[0].play()","void");
    } catch (exception) {}
}

function seekToCurrentVideo(timeInMillis) {
    try {
        executeOnYoutube("document.getElementsByTagName('video')[0].currentTime="+timeInMillis+"/1000","void");
    } catch (exception) {}
}

function getCurrentVideoOffsetInMillis() {
    try {
        return executeOnYoutube("document.getElementsByTagName('video')[0].currentTime*1000","int");
    } catch (exception) {
        return 0;
    }
}

function isVideoPaused() {
    try {
       return executeOnYoutube("document.getElementsByTagName('video')[0].paused;","boolean");
    }catch(exception){}
    return true
}

function setVolume(volume) {
    try {
        executeOnYoutube("document.getElementsByTagName('video')[0].setVolume(parseInt("+volume+"));","void");
    }catch(exception){}
}

console.log(1111111111111);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// THIS IS FOR BINDING PAUSE / PLAY EVENTS SO THEY CAN SAY VIDEO SYNCING MESSAGES ////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sendUpdatedPlayerInfoToServer() {
    if (ownerFlag) {
        console.log("Sending updated player info to server. :"+new Date().getTime());
        sendMessageToMain({a: SYNC_VIDEO, v:youtube_parser(getLocation()), c: concert_parser(getLocation()), o: parseInt(getCurrentVideoOffsetInMillis()),
            vs: (isVideoPaused() ? 2 : 1), of: ownerFlag, t:new Date().getTime()});
    }
}

function getPlayerInfoFromServer() {
    if (!ownerFlag) {
        sendMessageToMain({a: SYNC_VIDEO, c:concert_parser(getLocation()), of: ownerFlag, t:new Date().getTime()});
    }
}

var bootingVideoFlag = false;
var bootingVideoFlagTime=new Date().getTime();

var checkingTimer = new Tock( {
    countdown: true,
    interval: 200,
    callback: function() {
        if (ownerFlag) {
            try {
                var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
                concertPlayer.onpause = sendUpdatedPlayerInfoToServer;
                concertPlayer.onplay = sendUpdatedPlayerInfoToServer;
                concertPlayer.onseeked = sendUpdatedPlayerInfoToServer;
            } catch (exception) {
                console.log("Exception-" + exception);
            }
        }

        if ( !bootingVideoFlag && isVideoPaused() === false && (new Date().getTime()-bootingVideoFlagTime) > 500 ) {
            console.log("@@@@@@@ - sendUpdatedPlayerInfoToServer / getPlayerInfoFromServer : " + getCurrentVideoOffsetInMillis());
            sendUpdatedPlayerInfoToServer();
            getPlayerInfoFromServer();
            bootingVideoFlag = true;
        }
    },
    complete: function(){
    }
});
checkingTimer.start(1000000000);

function sendMessageToMain(message)
{
    console.log("Sending to main: " + JSON.stringify(message) + '\n');
    contentToMain(message);
}

var WAITING_TIME = 2000;
var internalTimer = null;
var VO = null;
var VS = null;
var CT = null;
var VID = null;
var canSync = true;
var pullTime = null;

function getLocation(){
    return "O-zpOMYRi0w";
};

var mainSyncTimer = new Tock( {
    countdown: true,
    interval: 2500,
    callback: function() {
        if (canSync) {
            if (events.length > 0) {
                var latestEvent = events[events.length-1];

                for (var i=0;i<events.length;i++) {
                    if (   events[i].videoId != null
                        && youtube_parser(getLocation()) != null
                        && events[i].videoId != youtube_parser(getLocation())
                    )
                    {
                        latestEvent = events[i];
                    }
                }

                VO = latestEvent.vOffset;
                VS = latestEvent.videoState;
                CT = latestEvent.clientTimestamp;
                VID = latestEvent.videoId;
                pullTime = new Date().getTime();
                events = []
            }
            var vp = isVideoPaused();
            console.log("DDDDDD : Time Gap "+((new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO) -AWESOME_DELAY ));

            console.log( Math.abs( (new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO) ));
            if (
                (VS === 1) && ( vp ||
                ( Math.abs( (new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO) -AWESOME_DELAY ) > threshold )
                )
            )
            {
                console.log("Here.");
                if (internalTimer !== null) {
                    internalTimer.stop();
                }
                try {
                    executeOnYoutube("document.getElementsByTagName('video')[0].style.opacity=0.1;");
                } catch (er) {}
                var interval = CT - new Date().getTime();
                canSync = false;
                console.log("Setting canSync = FALSE.. Initiating a timer..");
                internalTimer = new Tock({
                    countdown: true,
                    interval: interval + WAITING_TIME,
                    callback: function() { console.log("Video Synced with internalTimer: " + new Date().getTime()) },
                    complete: function() {
                        try {
                            executeOnYoutube("document.getElementsByTagName('video')[0].style.opacity=1;");
                        } catch (er) {}
                        //pauseCurrentVideo();
                        seekToCurrentVideo( VO +new Date().getTime()-CT );
                        playCurrentVideo();
                        setVolume(100);
                        console.log("SEEKING :" + CT);
                        console.log("INTERVAL :" + interval);
                        console.log("Timer completed. Setting canSync = TRUE");
                        canSync = true;
                    }
                });

                internalTimer.start(interval+WAITING_TIME);
                seekToCurrentVideo( VO + new Date().getTime() - CT - preloadDuration );
                setVolume(0);
                playCurrentVideo();

            } else if ( (VS === 2) && (!vp) ) {
                seekToCurrentVideo( VO - preloadDuration );
                pauseCurrentVideo();
            }
        }
    },
    complete: function(){

    }
});

function executeOnYoutube(script,type){

    if(type==="void"){
        return JSInterface.execute(script);
    }
    else if(type==="int"){
        return JSInterface.executeGetInt(script);
    }
    else if(type==="boolean"){
        return JSInterface.executeGetBoolean(script);
    }
}

mainSyncTimer.start(1000000000);
var prevLink = null;

setInterval(function(){
    if( prevLink!==getLocation() || prevLink==null)
    {
        redirectBasedOnState(youtube_parser(getLocation()),concert_parser(getLocation()),ownerFlag);
        prevLink = getLocation();
    }
},200);