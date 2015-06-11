var timeScriptLoaded = new Date().getTime();
var isOwner=false;
var videoChecking=false;
var playTime=new Date().getTime();
console.log("helloooooooooooooooooooo");
var link=window.location.href;

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

    function pauseCurrentVideo() {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.pauseVideo();
    }

    function playCurrentVideo() {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.play();
    }

    function seekToCurrentVideo(timeInMillis) {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.currentTime=timeInMillis/1000;
    }

    function getPlayerState() {

    }

    function setVolume(volume) {
        var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
        concertPlayer.setVolume(parseInt(volume));
    }

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
//                    response[]
                }
            } else {
                console.log("Bakchodi - Owner dude!");
            }
        }

//        if (mainEvt.data.indexOf("DIE_MOTHERFUCKER_DIE")>-1) {
//            var latestTimestamp = parseInt(mainEvt.data.split(":")[1]);
//            if (timeScriptLoaded<latestTimestamp) {
//                window.close();
//            }
//        }

//        if (mainEvt.data.indexOf("CONCERT_START_IN_5_SEC")>-1) {
//            try {
//                playTime=5000+new Date().getTime();
//
//                concertPlayer.currentTime=0;
//                concertPlayer.volume = 0;
//                concertPlayer.play();
//
//                setTimeout(function() {
//                    console.log("CONCERT_START_IN 4_SEC");
//                    setEventStatus("CONCERT_START_IN 4_SEC");
//                },1000);
//                setTimeout(function(){
//                    console.log("CONCERT_START_IN 3_SEC");
//                    setEventStatus ("CONCERT_START_IN 3_SEC");
//                },2000);
//                setTimeout(function(){
//                    console.log("CONCERT_START_IN 2_SEC");
//                    setEventStatus ("CONCERT_START_IN 2_SEC");
//                },3000);
//                setTimeout(function(){
//                    console.log("CONCERT_START_IN 1_SEC");
//                    setEventStatus("CONCERT_START_IN 1_SEC");
//                },4000);
//
//                setTimeout(function(){
//                    setEventStatus("");
//                    concertPlayer.currentTime=0;
//                    concertPlayer.play();
//                    concertPlayer.volume = 1;
//                },5000);
//            } catch (error) {
//                console.log(error);
//            }
//        }
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

//function sendTimestampKillOtherTabs() {
//    doSend("MY_TIMESTAMP:"+timeScriptLoaded);
//}

console.log(1111111111111);

if (document.location.host=="www.youtube.com") {
    youtuber();
}

//function doSend(message)
//{
//    console.log("Sending to main: " + message + '\n');
//    kango.dispatchMessage("contentToMain", {message:message});
//}
