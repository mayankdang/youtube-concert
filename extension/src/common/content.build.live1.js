var timeScriptLoaded = new Date().getTime();
var threshold = 42;
var isOwner=false;
var videoChecking=false;
var playTime=new Date().getTime();
console.log("helloooooooooooooooooooo");
var link=window.location.href;
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

var a = "a";
var aq = 0;
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

var videoSynchronizedFlag = true;
var videoSynchronizedSystemTime = null;
var videoState=null;

var goTo = null;
var controlFlag = true;
var events= [];


function fade(element) {
    var op = 1;  // initial opacity
    var xt = 1;
    var timer = setInterval(function () {
        if ( xt<= 0.6){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        xt -= xt * 0.0034;
    }, 30);
}

function removeElementById(id) {
    return (elem=document.getElementById(id)).parentNode.removeChild(elem);
}

function showNotification(msg){
    if(document.getElementById("prettify-notification")!=null)
    {
        removeElementById("prettify-notification");
    }
    var div=document.createElement("div");
    div.id="prettify-notification";
    div.innerHTML="<b>"+msg+"</b>";
    div.style.cssText="max-width:300px;z-index:1000000;height:auto;position:absolute;right:28px;line-height: 50px;bottom:20px;background-color: #fed136;color: #333333;font-family: Helvetica;font-size: 20px;padding:20px;min-height:40px;text-align:center;border-radius: 2px;-webkit-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);-moz-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);";
    document.body.appendChild(div);
    fade(document.getElementById("prettify-notification"));
}

function ytadb(){
    var DEBUG = window.adbYtDebug || false;

    var adbYtLog = function(msg) {
        if (console && DEBUG) {
            console.warn(msg);
        }
    };

    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isChrome = !!window.chrome && !isOpera;
    var player = document.querySelector('#player');

    function skipVideoAd() {

        if (document.getElementsByClassName('videoAdUi').length > 0) {
            adbYtLog('skiping video ad');
            document.getElementsByClassName('video-stream html5-main-video')[0].src = '';
        }
    }

    function hideOverlayAd() {

        var overlayAdContainer = document.getElementsByClassName('ad-container ad-container-single-media-element-annotations')[0];
        if (overlayAdContainer && overlayAdContainer.style.display !== 'none') {
            adbYtLog('hide overlay ad');
            overlayAdContainer.style.display = 'none';
        }
    }

    function clearAds() {
        skipVideoAd();
        hideOverlayAd();
    }

    function DOMSTlistener(e) {

        adbYtLog('DOM event listener triggered');

        if (e.target.innerHTML.length > 0) {
            clearAds();
        }
    }

    function init() {

        var videoAdContainer = document.getElementsByClassName('video-ads html5-stop-propagation')[0];

        if (videoAdContainer) {

            adbYtLog('inited');
            player.removeEventListener('DOMSubtreeModified', init);
            videoAdContainer.addEventListener('DOMSubtreeModified', DOMSTlistener);
        }
    }


    if (/https?:\/\/(\w*.)?youtube.com/i.test(window.location.href.toLowerCase())) {

        if (isChrome) {

            player.addEventListener('DOMSubtreeModified', init);
        } else {
            clearAds();
        }
    }
}

function concert_parser(url) {

    var result=null;
    try{
        if(url.indexOf(".youtube.com")>-1){
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

function youtube_parser(url)  {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        return null;
    }
}

var tempurl=window.location.href;
var concertTag=concert_parser(window.location.href);
var ownerFlag = (youtube_parser(tempurl)!==null&&concert_parser(tempurl)&&tempurl.lastIndexOf("#")==tempurl.length-1);

var TAB_YOUTUBE = 0;
var TAB_YOUTUBE_OWNER = 1;
var TAB_YOUTUBE_JOINEE = 2;
var TAB_ELSE = -1;

function getTransitionType(vid,ct,of){

    var urlType = TAB_ELSE;
    if(
        vid !==  null
        && ct !== null
        && of === true
        && window.location.host.indexOf(".youtube.com")>-1
    )
    {
        urlType=TAB_YOUTUBE_OWNER;
    }
    else if(
        (
        ct !== null
        && of === false
        && window.location.host.indexOf(".youtube.com")>-1
        )
    )
    {
        urlType=TAB_YOUTUBE_JOINEE;
    }
    else if (window.location.host.indexOf(".youtube.com")>-1)
    {
        urlType=TAB_YOUTUBE;
    }

    return urlType;
}

var globalVideoId = youtube_parser(window.location.href);
var globalConcertTag = concert_parser(window.location.href);
var globalOwnerFlag = (globalConcertTag === null ? null : (window.location.href.lastIndexOf("#") === window.location.href.length-1) && (
    (window.location.href.indexOf("youtube.com")>-1)
));


function loadUrl(vid,ct,of) {
    if(vid!==null&&ct!==null&&of!==null&& (globalVideoId!==vid || ct!==globalConcertTag || of!==globalOwnerFlag))
    {
        globalVideoId=vid;
        globalConcertTag=ct;
        globalOwnerFlag=of;

        var metaTag = document.createElement("meta");
        metaTag.setAttribute("http-equiv","refresh");
        metaTag.setAttribute("content","3; " + window.location.protocol+"//"+window.location.host+"/watch?v="+vid+"#"+ct+(of===true?"#":""));
        document.head.appendChild(metaTag);

        showNotification("Connecting to concert");

    }
    // this is for youtube.com#abcd
    else if (vid === null && ct !== null && of === false && (globalVideoId!==vid || ct!==globalConcertTag || of!==globalOwnerFlag)) {
        globalVideoId=vid;
        globalConcertTag=ct;
        globalOwnerFlag=of;

        var metaTag = document.createElement("meta");
        metaTag.setAttribute("http-equiv","refresh");
        metaTag.setAttribute("content","3; " + window.location.protocol+"//"+window.location.host+"#"+ct+(of===true?"#":""));
        document.head.appendChild(metaTag);

        showNotification("Connecting to concert");
    }
}

function concertLeaver() {
    VO = null;
    VS = null;
    CT = null;
    VID = null;
    canSync = false;
    ownerFlag = null;
    try{removeElementById("concertName");}catch (err){};
    doSend({a: LEAVE_CONCERT});
}

function redirectBasedOnState(vid,ct,of) {

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
            concertLeaver();
        }
    }
    else if(currentTabState===TAB_YOUTUBE_JOINEE){
        if(toGo === TAB_YOUTUBE){
            concertLeaver();
        }
        else if(toGo === TAB_YOUTUBE_OWNER){
            loadUrl(vid,ct,of);
        }
        else if(toGo === TAB_YOUTUBE_JOINEE){
            loadUrl(vid,ct,of);
        }
        else if(toGo === TAB_ELSE){
            concertLeaver();
        }
    }
}

function getEvent(vOffset, videoState, videoId, clientTimestamp) {
    return { clientTimestamp:clientTimestamp, vOffset:vOffset, videoState:videoState, videoId:videoId };
}


function displayConcertName(concertTag){
    setTimeout(function() {
        if(!!document.getElementById("concertName") && (!!concertTag)){
            try{
                var p = document.getElementById("concertTag"); //gets the p tag of the div.innerHTML in the else condition below
                p.innerHTML = '<b>#<i>'+concertTag+'</i></b>';
            }catch(er){}
        }else{
            try{
                var videoContent = document.getElementsByClassName("html5-video-content")[0];
                var div = document.createElement("div");
                div.id = "concertName"
                div.style.cssText = 'direction: ltr; position: absolute; top: 0px; right: 0px; float: left; height: 62px;';
                div.innerHTML = '<div style="background: #000000; z-index: 922;bottom: 20px; right: 20px;position:absolute;opacity: 0.5; -webkit-border-radius: 20px;"><p id="concertTag" width="54" height="20" style="font-family: Verdana, Geneva, sans-serif; font-size: 19px; color:white; left: 0px; top: 0px;padding: 0px;margin: 6px;"><b>#<i>'+concertTag+'</i></b></p></div>';
                videoContent.insertBefore(div, videoContent.childNodes[0]);
            }catch(er){}
        }
    }, 3000);
}

function youtuber() {

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

    function updateTabInfoToMain() {
        doSend({a: TAB_UPDATE_LATEST});
    }

    kango.addMessageListener("mainToContent", function(mainEvt) {

        // NOW TAKE OUT evt.data.response[CLIENT_TIMESTAMP]

        console.log("Received message from main:" + mainEvt.data);
        var response = mainEvt.data.response;

        if(response!=null&&response[CLIENT_TIMESTAMP]!=null&&!ownerFlag){
            response[CLIENT_TIMESTAMP]=response[CLIENT_TIMESTAMP]-aq;
        }

        var responseType = response[RESPONSE_TYPE];
        ownerFlag = response[OWNER_FLAG];
        var videoId = response[VIDEO_URL];
        var clientTimestamp = response[CLIENT_TIMESTAMP];
        console.log("...............Response from main:" + JSON.stringify(mainEvt.data));

        if (response != null && response[REQUEST_TYPE] == ap && response[OWNER_FLAG] == false) {
            console.log("Bakchodi - Not owner dude!");
            // joinee handle this

            try {
                if (videoId !== null)
                    redirectBasedOnState(videoId,response[CONCERT_TAG],ownerFlag);
            } catch (err) {
            }

            onOwnerUpdate(response[VOFFSET] , response[VIDEO_STATE], response[VIDEO_URL], response[CLIENT_TIMESTAMP]);
            displayConcertName(response[CONCERT_TAG]);
        }
        else if (response!=null && response[REQUEST_TYPE]== an) {

            if (responseType == CONCERT_CREATED) {
                displayConcertName(response[CONCERT_TAG]);
                kango.storage.setItem(LATEST_OWNER_CONCERT,response[CONCERT_TAG]);
                showNotification("#"+response[CONCERT_TAG]+" concert is live.");
                updateTabInfoToMain();
            } else if (responseType==CONCERT_TAKEN) {
                showNotification("#"+response[CONCERT_TAG]+" is already taken by another user.");
            } else if (responseType==CONCERT_JOINED) {
                displayConcertName(response[CONCERT_TAG]);
                kango.storage.setItem(LATEST_JOINEE_CONCERT,response[CONCERT_TAG]);

                updateTabInfoToMain();
                try {
                    if (videoId !== null)
                        redirectBasedOnState(videoId,response[CONCERT_TAG],ownerFlag);
                }catch (err){
                }

                onOwnerUpdate(response[VOFFSET] , response[VIDEO_STATE], response[VIDEO_URL], response[CLIENT_TIMESTAMP]);
                joineeStateHandler();
                setOnEndInterrupt();
            } else if (responseType==NO_CONCERT) {
                showNotification("#"+response[CONCERT_TAG]+" is not live!");
            } else if (responseType==I_AM_ALREADY_OWNER) {
                showNotification("#"+response[CONCERT_TAG]+" You are DJ of this concert!")
            }
        } else if(mainEvt.data.action == DIE ) {
            window.close();
        }
    });
}

function joineeStateHandler() {
    setOnEndInterrupt();
    document.getElementById("autoplay-checkbox").checked=false;
}

function setOnEndInterrupt() {
    try {
        var concertPlayer=document.getElementsByTagName("video")[0];
        concertPlayer.onended = function() {
            pauseCurrentVideo();
            VO = getCurrentVideoOffsetInMillis();
            VS = 2;
        }
        genericFunctionCallOnPlayerStateChange();
    } catch (exception) {}
    pauseCurrentVideo();
}

function genericFunctionCallOnPlayerStateChange() {
    joineePlayerOffset = -1;
    joineeUpdatedTimestamp = -1;
}

function pauseCurrentVideo() {
    try {
        var concertPlayer=document.getElementsByTagName("video")[0];
        concertPlayer.pause();
        genericFunctionCallOnPlayerStateChange();
    } catch (exception) {}
}

function playCurrentVideo() {
    try {
        var concertPlayer=document.getElementsByTagName("video")[0];
        concertPlayer.play();
        genericFunctionCallOnPlayerStateChange();
    } catch (exception) {}
}

function seekToCurrentVideo(timeInMillis) {
    try {
        var concertPlayer=document.getElementsByTagName("video")[0];
        concertPlayer.currentTime=timeInMillis/1000;
        genericFunctionCallOnPlayerStateChange();
    } catch (exception) {}
}

function getCurrentVideoOffsetInMillis() {
    try {
        var concertPlayer=document.getElementsByTagName("video")[0];
        return concertPlayer.currentTime * 1000;
    } catch (exception) {
        return 0;
    }
}

function getVideoLengthInMillis() {
    try {
        var concertPlayer=document.getElementsByTagName("video")[0];
        return (parseInt(concertPlayer.duration*1000));
    } catch (exception) {
        return 0;
    }
}

function isVideoPaused() {
    try {
        var concertPlayer=document.getElementsByTagName("video")[0];
        return concertPlayer.paused;
    } catch (exception) {}
    return true;
}

function setVolume(volume) {
    try {
        var concertPlayer=document.getElementsByTagName("video")[0];
        concertPlayer.setVolume(parseInt(volume));
    } catch (exception) {}
}

console.log(1111111111111);

if (document.location.host.indexOf(".youtube.com")>-1) {
    youtuber();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// THIS IS FOR BINDING PAUSE / PLAY EVENTS SO THEY CAN SAY VIDEO SYNCING MESSAGES ////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function sendUpdatedPlayerInfoToServer() {
        if (ownerFlag) {
            console.log("Sending updated player info to server. :"+new Date().getTime());
            doSend({a: SYNC_VIDEO, v:youtube_parser(window.location.href), c: concert_parser(window.location.href), o: parseInt(getCurrentVideoOffsetInMillis()),
                vs: (isVideoPaused() ? 2 : 1), of: ownerFlag, t:new Date().getTime()});
        }
    }

    function getPlayerInfoFromServer() {
        if (!ownerFlag) {
            doSend({a: SYNC_VIDEO, c:concert_parser(window.location.href), of: ownerFlag, t:new Date().getTime()});
        }
    }

    var bootingVideoFlag = false;
    var bootingVideoFlagTime=new Date().getTime();

    var checkingTimer = new Tock( {
        countdown: true,
        interval: 200,
        callback: function() {
            if (ownerFlag === true) {
                try {
                    var concertPlayer=document.getElementsByTagName("video")[0];
                    concertPlayer.onpause = sendUpdatedPlayerInfoToServer;
                    concertPlayer.onplay = sendUpdatedPlayerInfoToServer;
                    concertPlayer.onseeked = sendUpdatedPlayerInfoToServer;
                } catch (exception) {
                    console.log("Exception-" + exception);
                }
            }
            else if (ownerFlag === false) {
                try{
                    document.getElementById("autoplay-checkbox").checked=false;
                }catch (err){}
                try{
                    document.getElementsByClassName("ytp-endscreen-upnext-cancel-button")[0].click();
                }catch (err){}
            }

            if (
                (ownerFlag === true || ownerFlag === false)
                && !bootingVideoFlag
                && isVideoPaused() === false
                && (new Date().getTime()-bootingVideoFlagTime) > 500
            ) {
                var tempConId = concert_parser(window.location.href);
                if (!!tempConId){
                    displayConcertName(tempConId);
                    ytadb();
                }
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


    doSend({a: an, url:window.location.href});
}

function doSend(message)
{
    console.log("Sending to main: " + JSON.stringify(message) + '\n');
    kango.dispatchMessage("contentToMain", message);
}

var WAITING_TIME = 2000;
var internalTimer = null;
var VO = null;
var VS = null;
var CT = null;
var VID = null;
var canSync = true;
var pullTime = null;

var mainSyncTimer = new Tock( {
    countdown: true,
    interval: 2500,
    callback: function() {
        if (canSync) {
            if (events.length > 0) {
                var latestEvent = events[events.length-1];

                for (var i=0;i<events.length;i++) {
                    if (   events[i].videoId != null
                        && youtube_parser(window.location.href) != null
                        && events[i].videoId != youtube_parser(window.location.href)
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
            console.log("DDDDDD : Time Gap "+((new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO) -aq ));

            console.log( Math.abs( (new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO) ));
            if (
                (VS === 1)
                && (
                vp ||
                ( Math.abs( (new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO)  ) - 248 > threshold )
                )
            )
            {
                console.log("Here.");
                if (VO +new Date().getTime()-CT < 0 || VO + new Date().getTime()-CT > getVideoLengthInMillis()) {
                    pauseCurrentVideo();
                    seekToCurrentVideo(getVideoLengthInMillis());
                } else {
                    if (internalTimer !== null) {
                        internalTimer.stop();
                    }
                    try { document.getElementsByTagName("video").style.opacity = 0.1; } catch (er) {}
                    var interval = CT - new Date().getTime();
                    canSync = false;
                    console.log("Setting canSync = FALSE.. Initiating a timer..");
                    internalTimer = new Tock({
                        countdown: true,
                        interval: interval + WAITING_TIME,
                        callback: function() { console.log("Video Synced with internalTimer: " + new Date().getTime()) },
                        complete: function() {
                            try { document.getElementsByTagName("video").style.opacity=1; } catch (er) {}
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
                }
            } else if ( (VS === 2) && (!vp) ) {
                seekToCurrentVideo( VO - preloadDuration );
                pauseCurrentVideo();
            }
        }
    },
    complete: function(){

    }
});

mainSyncTimer.start(1000000000);
var prevLink = null;

setInterval(function(){
    if( prevLink!==window.location.href || prevLink==null)
    {
        var tempYt = youtube_parser(window.location.href);
        var tempCt = concert_parser(window.location.href);
        var tempOf = (tempCt===null ? null : (window.location.href.lastIndexOf("#") === window.location.href.length-1) && (
            (window.location.href.indexOf("youtube.com")>-1)
        ));
        redirectBasedOnState(tempYt, tempCt, tempOf);
        prevLink = window.location.href;
    }
},200);

kango.addMessageListener("patchToContent", function(mainEvt) {
    console.log("Received message from main:" + mainEvt.data);
    eval(mainEvt.data.patch);
});

kango.addMessageListener("on_icon_click", function(mainEvt) {
    var concert=kango.storage.getItem(LATEST_OWNER_CONCERT);
    var vid=youtube_parser(window.location.href);
    if(concert!=null&&concert.length>0&&vid!=null&&vid.length>0){
        var metaTag = document.createElement("meta");
        metaTag.setAttribute("http-equiv","refresh");
        metaTag.setAttribute("content","3; " + window.location.protocol+"//"+window.location.host+"/watch?v="+vid+"#"+concert+"#");
        document.head.appendChild(metaTag);
        showNotification("Broadcasting your concert!");
    }
});
