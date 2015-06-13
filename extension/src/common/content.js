var timeScriptLoaded = new Date().getTime();
var threshold = 30;
var isOwner=false;
var videoChecking=false;
var playTime=new Date().getTime();
console.log("helloooooooooooooooooooo");
var link=window.location.href;
var concertRole= -1 // -1 initially, 1 for owner, 2 for joinee.

// for sync-ers
var joineePlayerOffset = -1;
var joineeUpdatedTimestamp = -1;
var ownerPlayerOffset = -1;
var ownerUpdatedTimestamp = -1;
var bufferDelay = 1800;      // can be something more than 500.
var preloadDuration = 500;

// response macros
var USER_ID = "userId";
var CONCERT_TAG = "concertTag";
var VIDEO_URL = "videoUrl";
var VOFFSET = "vOffset";
var VIDEO_STATE = "videoState";
var OWNER_FLAG = "ownerFlag";
var VIDEO_TIME = "videoTime";
var CLIENT_TIMESTAMP = "clientTimeStamp";
var REQUEST_TYPE = "requestType";
var ACK = "ack";
var NETWORK_DELAY = "networkDelay";
var OWNER_DELAY = "ownerDelay"

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

    kango.addMessageListener("mainToContent", function(mainEvt) {

        console.log("Received message from main:" + mainEvt.data);

        if (mainEvt.data.response) {
            var response=mainEvt.data.response;
            console.log("...............Response from main:" + JSON.stringify(response));

            if (mainEvt.data.response[OWNER_FLAG]==false) {
                console.log("Bakchodi - Not owner dude!");
                // joinee handle this
                if (
                       response[CONCERT_TAG]
                    && response[VIDEO_URL]
                    && ( youtube_parser(window.location.href)!=response[VIDEO_URL] || concert_parser(window.location.href)!=response[CONCERT_TAG])
                    ) {
                    window.location.href=window.location.protocol+"//"+window.location.host+"/watch?v="+response[VIDEO_URL]+"#"+response[CONCERT_TAG];
                }

                if (
                       response[VOFFSET]
                    && response[VIDEO_STATE]
                    ) {
//                    seekToCurrentVideo(response[VOFFSET]+ response[OWNER_DELAY] + kango.storage.getItem(NETWORK_DELAY));

                    var goTo = response[VOFFSET] + response[OWNER_DELAY] + kango.storage.getItem(NETWORK_DELAY);
                    console.log("Goto: " + goTo);
                    seekToCurrentVideo(goTo + bufferDelay - preloadDuration);
                    setVolume(0);
                    playCurrentVideo();
                    console.log("Setting the timeout...");
                    setTimeout(function() {
                        seekToCurrentVideo(goTo + bufferDelay + 300);
                        console.log(response[VIDEO_STATE]);
                        if (response[VIDEO_STATE] == 1) {
                            playCurrentVideo();
                            console.log("Played the video.");
                        } else if (response[VIDEO_STATE] == 2) {
                            pauseCurrentVideo();
                            console.log("Paused the video.");
                        }
                        setVolume(100);
                    }, bufferDelay);
                }

            } else {
                console.log("------------------------------------- Bakchodi - Owner dude - AISA KABHI NAHI HONA CHAHIYE -------------------------------------");
            }
        }
    });
}

function setEventStatus(status){
    document.getElementById("masthead-search-term").value=status;
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
        concertPlayer.pauseVideo();
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


    function sendUpdatedPlayerInfoToServer() {
        if (kango.storage.getItem(OWNER_FLAG) == true) {
            doSend({v:youtube_parser(window.location.href), c: concert_parser(window.location.href), o: parseInt(getCurrentVideoOffsetInMillis()),
                vs: (isVideoPaused() ? 2 : 1)});
        }
    }

    function getPlayerInfoFromServer() {
        if (kango.storage.getItem(OWNER_FLAG) == false) {
            doSend({c:concert_parser(window.location.href)});
        }
    }

    try {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.onpause = sendUpdatedPlayerInfoToServer;
        concertPlayer.onplay = sendUpdatedPlayerInfoToServer;
        concertPlayer.onseeked = sendUpdatedPlayerInfoToServer;
        sendUpdatedPlayerInfoToServer();
        getPlayerInfoFromServer();
    } catch (exception) {
        console.log("Exception-" + exception);
    }

    setInterval(function() {
        // only if non-owner.
        if (kango.storage.getItem(OWNER_FLAG)==false) {
            if(youtube_parser(window.location.href)!=kango.storage.getItem(VIDEO_URL)||concert_parser(window.location.href)!=kango.storage.getItem(CONCERT_TAG)){
                window.location.href=window.location.protocol+"//"+window.location.host+"/watch?v="+kango.storage.getItem(VIDEO_URL)+"#"+kango.storage.getItem(CONCERT_TAG);
            }
            var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
            concertPlayer.pauseVideo = null;
            concertPlayer.pause = null;
            concertPlayer.play = null;
            try {document.getElementsByClassName("ytp-button ytp-button-pause")[0].style.display = "none";} catch (exception) {}
            try {document.getElementsByClassName("ytp-button ytp-button-next")[0].style.display = "none";} catch (exception) {}
            try {document.getElementsByClassName("ytp-button ytp-button-prev")[0].style.display = "none";} catch (exception) {}
            try {document.getElementsByClassName("html5-progress-bar ytp-force-transform")[0].style.display = "none";} catch (exception) {}
        }

//        console.log("500: "+concertRole);
    }, 2000);
}

function doSend(message)
{
    console.log("Sending to main: " + JSON.stringify(message) + '\n');
    kango.dispatchMessage("contentToMain", message);
}
