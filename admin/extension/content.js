var threshold = 42;
var videoChecking=false;
var link=window.location.href;
var joineePlayerOffset = -1;
var joineeUpdatedTimestamp = -1;
var preloadDuration = 50;

var ACK = "ACK";
var AWESOME_DELAY = 0;
var CLIENT_TIMESTAMP = "CLIENT_TIMESTAMP";
var CLIENT_VERSION = "CLIENT_VERSION";
var CLOCK_DIFF = "CLOCK_DIFF";
var CONCERT_CREATED = "CONCERT_CREATED";
var CONCERT_JOINED = "CONCERT_JOINED";
var CONCERT_TAG = "CONCERT_TAG";
var CONCERT_TAKEN = "CONCERT_TAKEN";
var DIE = "DIE";
var I_AM_ALREADY_OWNER = "I_AM_ALREADY_OWNER";
var LATEST_JOINEE_CONCERT="LATEST_JOINEE_CONCERT";
var LATEST_OWNER_CONCERT="LATEST_OWNER_CONCERT";
var LEAVE_CONCERT = "LEAVE_CONCERT";
var LOAD_VIDEO = "LOAD_VIDEO";
var NETWORK_DELAY = "NETWORK_DELAY";
var NO_CONCERT = "NO_CONCERT";
var OWNER_DELAY = "OWNER_DELAY";
var OWNER_FLAG = "OWNER_FLAG";
var PAGE_LOADED = "PAGE_LOADED";
var PATCH_CONTENT = "PATCH_CONTENT";
var PATCH_MAIN = "PATCH_MAIN";
var R_ADMIN_PATCH = 6;
var R_ADMIN_VERSION_UPDATE = 7;
var R_CLOCK_DIFF = 2;
var R_CREATE_USER = 0;
var R_HANDSHAKING = 1;
var R_LEAVE_CONCERT = 8;
var R_NETWORK_DELAY = 2;
var R_PAGE_LOADED = 5;
var R_USER_ONLINE = 4;
var R_VIDEO_UPDATE = 3;
var REQUEST_TYPE = "REQUEST_TYPE";
var RESPONSE_TYPE = "RESPONSE_TYPE";
var SERVER_TIMESTAMP = "SERVER_TIMESTAMP";
var SYNC_VIDEO = "SYNC_VIDEO";
var TAB_ID = "TAB_ID";
var TAB_UPDATE_LATEST = "TAB_UPDATE_LATEST";
var USER_ID = "USER_ID";
var VIDEO_STATE = "VIDEO_STATE";
var VIDEO_TIME = "VIDEO_TIME";
var VIDEO_URL = "VIDEO_URL";
var VOFFSET = "VOFFSET";

var videoState=null;
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
        }
    } else if(currentTabState === TAB_YOUTUBE){

        if (of===null) {
            if(toGo===TAB_YOUTUBE){
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
                var p = document.getElementById("concertTag");
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
        var response = mainEvt.data.response;
        if(response!=null&&response[CLIENT_TIMESTAMP]!=null&&!ownerFlag){
            response[CLIENT_TIMESTAMP]=response[CLIENT_TIMESTAMP]-AWESOME_DELAY;
        }

        var responseType = response[RESPONSE_TYPE];
        ownerFlag = response[OWNER_FLAG];
        var videoId = response[VIDEO_URL];
        var clientTimestamp = response[CLIENT_TIMESTAMP];

        if (response != null && response[REQUEST_TYPE] == R_VIDEO_UPDATE && response[OWNER_FLAG] == false) {
            try {
                if (videoId !== null)
                    redirectBasedOnState(videoId,response[CONCERT_TAG],ownerFlag);
            } catch (err) {
            }

            onOwnerUpdate(response[VOFFSET] , response[VIDEO_STATE], response[VIDEO_URL], response[CLIENT_TIMESTAMP]);
            displayConcertName(response[CONCERT_TAG]);
        }
        else if (response!=null && response[REQUEST_TYPE]== R_PAGE_LOADED) {

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

if (document.location.host.indexOf(".youtube.com")>-1) {
    youtuber();

    function sendUpdatedPlayerInfoToServer() {
        if (ownerFlag) {
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
                sendUpdatedPlayerInfoToServer();
                getPlayerInfoFromServer();
                bootingVideoFlag = true;
            }
        },
        complete: function(){
        }
    });
    checkingTimer.start(1000000000);


    doSend({a: R_PAGE_LOADED, url:window.location.href});
}

function doSend(message)
{
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
            if (
                (VS === 1)
                && (
                vp ||
                ( Math.abs( (new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO)  ) - 248 > threshold )
                )
            )
            {
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
                    internalTimer = new Tock({
                        countdown: true,
                        interval: interval + WAITING_TIME,
                        callback: function() { },
                        complete: function() {
                            try { document.getElementsByTagName("video").style.opacity=1; } catch (er) {}
                            seekToCurrentVideo( VO +new Date().getTime()-CT );
                            playCurrentVideo();
                            setVolume(100);
                            canSync = true;
                        }
                    });

                    internalTimer.start(interval+WAITING_TIME);
                    seekToCurrentVideo( VO + new Date().getTime() - CT - preloadDuration );
                    setVolume(0);
                    playCurrentVideo();
                }
            } else if ( (VS === 2) && (!vp) ) {
                //seekToCurrentVideo( VO - preloadDuration );
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