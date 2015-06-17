var timeScriptLoaded = new Date().getTime();
var threshold = 300;
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

// contentToMainActions
var PAGE_LOADED = "pageLoaded";
var SYNC_VIDEO = "syncVideo";
var CONCERT_CREATED = "concertCreated";
var CONCERT_JOINED = "concertJoined";
var RESPONSE_TYPE = "responseType";
var CHUTIYA_KATA = "chutiyaKata";
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

var videoSynchronizedFlag = true;
var videoSynchronizedSystemTime = null;
var videoState=null;

var goTo = null;
var controlFlag = true;
var ownerFlag = false;
var events= [];


function redirectBasedOnState(vid,ct,of){
    var url=window.location.href;
    if(
        youtube_parser(url) != vid
        || ct != concert_parser(url)
        || ( (of === true) && (url.lastIndexOf("#") == url.length-1) )
        || ( (of === false) && (url.lastIndexOf("#") != url.length-1) )
    )
    {
        url=window.location.protocol+"//"+window.location.host+"/watch?v="+vid+"#"+ct+(of==true?"#":"");
        window.location.assign(url);
        //kango.dispatchMessage("contentToMain", {a: LOAD_VIDEO, v: vid, c: ct, of: of, u: url})
    }
}

function getEvent(vOffset, videoState, videoId, clientTimestamp) {
    return { clientTimestamp:clientTimestamp, vOffset:vOffset, videoState:videoState, videoId:videoId };
}

function youtuber() {

    videoChecking=true;

//    function upDowning() {
//        try {
//            MYID=parseInt(document.getElementById('name').value);
//        } catch (err) {
//
//        }
//
//        if (flag === 0) {
//            var interval = 30.0;  // in ms
//            var tid = setInterval(mycode, interval);
//            var period = 3;      // in seconds (time in sec in which sound goes from 0 to 100)
//            var counter = 1;
//
//            function mycode() {
//                flag = 1;
//                console.log("counter" + counter);
//                console.log("interval" + interval);
//                console.log("period" + period);
//
//                // do some stuff...
//                // no need to recall the function (it's an interval, it'll loop forever)
//                // The value of seed should lie between -1 to 1
//                var seed = Math.sin(Math.PI * counter / ( 2 * (1000 / interval) * period ));
//                console.log("seed=" + seed);
//                var projectedSeed = Math.abs(Math.floor(seed * 100));
//                volume = parseInt(((projectedSeed * 60.0)/100 + 40.0))
//                console.log("volume=" +volume);
//                concertPlayer.setVolume(volume);
//                counter++;
//            }
//
//            function abortTimer() { // to be called when you want to stop the timer
//                clearInterval(tid);
//            }
//
//            setTimeout(function () {
//                abortTimer();
//                flag = 0;
//            }, 20000);  // abort after 20 seconds..
//        }
//    }
//
//    function randomizeSound() {
//        console.log("Randomize Sound called!");
//        setTimeout( upDowning , MYID*15)
//    }

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

    kango.addMessageListener("mainToContent", function(mainEvt) {

        // NOW TAKE OUT evt.data.response[CLIENT_TIMESTAMP]

        console.log("Received message from main:" + mainEvt.data);
        var response = mainEvt.data.response;
        var responseType = response[RESPONSE_TYPE];
        ownerFlag = response[OWNER_FLAG];
        var videoId = response[VIDEO_URL];
        var clientTimestamp = response[CLIENT_TIMESTAMP];

        if (response != null && response[REQUEST_TYPE] == R_VIDEO_UPDATE && response[OWNER_FLAG] == false) {
            console.log("...............Response from main:" + JSON.stringify(response));
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
            } else if (responseType==CHUTIYA_KATA) {
                alert(responseType);
            } else if (responseType==CONCERT_JOINED) {
                try{
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
    });
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

function genericFunctionCallOnPlayerStateChange() {
    joineePlayerOffset = -1;
    joineeUpdatedTimestamp = -1;
}

function pauseCurrentVideo() {
    try {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.pause();
        genericFunctionCallOnPlayerStateChange();
    } catch (exception) {}
}

function playCurrentVideo() {
    try {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.play();
        genericFunctionCallOnPlayerStateChange();
    } catch (exception) {}
}

function seekToCurrentVideo(timeInMillis) {
    try {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.currentTime=timeInMillis/1000;
        genericFunctionCallOnPlayerStateChange();
    } catch (exception) {}
}

function getCurrentVideoOffsetInMillis() {
    try {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        return concertPlayer.currentTime * 1000;
    } catch (exception) {
        return 0;
    }
}

function isVideoPaused() {
    try {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        return concertPlayer.paused;
    } catch (exception) {}
    return true;
}

function setVolume(volume) {
    try {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.setVolume(parseInt(volume));
    } catch (exception) {}
}

console.log(1111111111111);

if (document.location.host=="www.youtube.com") {

    youtuber();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// THIS IS FOR CLIENT SIDE SYNCING ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//    setInterval(function() {
//        // only if joinee.
//        if (kango.storage.getItem(OWNER_FLAG)==false) {
//            if ( (joineePlayerOffset == -1) || (joineeUpdatedTimestamp == -1) ) {
//                if (!isVideoPaused()) {
//                    joineePlayerOffset = getCurrentVideoOffsetInMillis();
//                    joineeUpdatedTimestamp = new Date().getTime();
//                }
//            }else {
//                var rightNowTimestamp = new Date().getTime();
//                if ( Math.abs( ((getCurrentVideoOffsetInMillis() - joineePlayerOffset) - (rightNowTimestamp - joineeUpdatedTimestamp)) ) > threshold) {
//                    console.log("1: " + (getCurrentVideoOffsetInMillis() - joineePlayerOffset) );
//                    console.log("2: " + (rightNowTimestamp - joineeUpdatedTimestamp));
//                    console.log("T: " + threshold);
//                    seekToCurrentVideo(joineePlayerOffset + (rightNowTimestamp - joineeUpdatedTimestamp));
//                    console.log("Seek to current video:" + joineePlayerOffset + (rightNowTimestamp - joineeUpdatedTimestamp));
//                }
//
//                var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
//                concertPlayer.pauseVideo = null;
//                concertPlayer.pause = null;
//                concertPlayer.play = null;
//                try {document.getElementsByClassName("ytp-button ytp-button-pause")[0].style.display = "none";} catch (exception) {}
//                try {document.getElementsByClassName("ytp-button ytp-button-next")[0].style.display = "none";} catch (exception) {}
//                try {document.getElementsByClassName("ytp-button ytp-button-prev")[0].style.display = "none";} catch (exception) {}
//                try {document.getElementsByClassName("html5-progress-bar ytp-force-transform")[0].style.display = "none";} catch (exception) {}
//                console.log("2000 ;) ");
//
//                joineeUpdatedTimestamp = new Date().getTime();
//                joineePlayerOffset = getCurrentVideoOffsetInMillis();
//            }
//        }
//    }, 2000);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// THIS IS FOR BINDING PAUSE / PLAY EVENTS SO THEY CAN SAY VIDEO SYNCING MESSAGES ////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function sendUpdatedPlayerInfoToServer() {
        if (ownerFlag) {
            console.log("Sending updated player info to server. :"+new Date().getTime());

            OWNER_VID = youtube_parser(window.location.href);
            OWNER_CON = concert_parser(window.location.href);

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
    setInterval(function() {
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

        if ( !bootingVideoFlag && isVideoPaused() === false && getCurrentVideoOffsetInMillis() > 0 ) {
            console.log("@@@@@@@ - sendUpdatedPlayerInfoToServer / getPlayerInfoFromServer : " + getCurrentVideoOffsetInMillis());
            sendUpdatedPlayerInfoToServer();
            getPlayerInfoFromServer();
            bootingVideoFlag = true;
        }

    }, 200);
}

function doSend(message)
{
    console.log("Sending to main: " + JSON.stringify(message) + '\n');
    kango.dispatchMessage("contentToMain", message);
}

var prevLink=window.location.href;
var concertTag=concert_parser(window.location.href);

setInterval( function() {
    if(ownerFlag)
     redirectBasedOnState(OWNER_VID, OWNER_CON,true);
}, 200);

var WAITING_TIME = 2000;
var internalTimer = null;
var VO = null;
var VS = null;
var CT = null;
var VID = null;
var canSync = true;
var pullTime = null;

var OWNER_VID = youtube_parser(window.location.href);
var OWNER_CON = concert_parser(window.location.href);

var mainSyncTimer = new Tock( {
    countdown: true,
    interval: 2500,
    callback: function() {
        if (canSync) {
            if (events.length > 0) {
                var latestEvent = events[events.length-1];
                VO = latestEvent.vOffset;
                VS = latestEvent.videoState;
                CT = latestEvent.clientTimestamp;
                VID = latestEvent.videoId;
                pullTime = new Date().getTime();
                events = []
            }
            var vp = isVideoPaused();
            console.log(vp);
            console.log( Math.abs( (new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO) ));
            if (
                (VS === 1) && ( vp ||
                    ( Math.abs( (new Date().getTime() - CT) - (getCurrentVideoOffsetInMillis() - VO) ) > threshold )
                    )
                )
            {
                console.log("Here.");
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
                        setVolume(100);
                        seekToCurrentVideo( VO +new Date().getTime()-CT + 190);
                        console.log("SEEKING :" + CT);
                        console.log("INTERVAL :" + interval);
                        canSync = true;
                        console.log("Timer completed. Setting canSync = TRUE");
                    }
                });

                internalTimer.start(interval+WAITING_TIME);
                seekToCurrentVideo( VO + new Date().getTime()-CT - preloadDuration );
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
mainSyncTimer.start(1000000000);
