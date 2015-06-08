var timeScriptLoaded = new Date().getTime();
var isOwner=false;
function youtuber() {
    var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];

    var link=document.location.href;
    setInterval(function()
    {
        var groupTag = kango.storage.getItem("groupTag");
        if (document.location.href!=link && isOwner && !(document.location.href.lastIndexOf("#"+groupTag)>-1)){
            link=document.location.href;
            window.location=link+"#"+groupTag+"#";
            link = link+"#"+groupTag+"#";
        }
    },300);

    function upDowning() {
        try {
            MYID=parseInt(document.getElementById('name').value);
        } catch (err) {

        }

        if (flag === 0) {
            var interval = 30.0;  // in ms
            var tid = setInterval(mycode, interval);
            var period = 3;      // in seconds (time in sec in which sound goes from 0 to 100)
            var counter = 1;

            function mycode() {
                flag = 1;
                console.log("counter" + counter);
                console.log("interval" + interval);
                console.log("period" + period);

                // do some stuff...
                // no need to recall the function (it's an interval, it'll loop forever)
                // The value of seed should lie between -1 to 1
                var seed = Math.sin(Math.PI * counter / ( 2 * (1000 / interval) * period ));
                console.log("seed=" + seed);
                var projectedSeed = Math.abs(Math.floor(seed * 100));
                volume = parseInt(((projectedSeed * 60.0)/100 + 40.0))
                console.log("volume=" +volume);
                concertPlayer.setVolume(volume);
                counter++;
            }

            function abortTimer() { // to be called when you want to stop the timer
                clearInterval(tid);
            }

            setTimeout(function () {
                abortTimer();
                flag = 0;
            }, 20000);  // abort after 20 seconds..
        }
    }

    function randomizeSound() {
        setTimeout( upDowning , MYID*15)
    }

    function stopVideo() {
        concertPlayer.pauseVideo();
    }

    function playVideo() {
        concertPlayer.play();
    }

    var playing = true;
    var img_array;
    img_array= new Array('images/play_32x32.png','images/pause_32x32.png');
    function playPauseVideo() {

        if (playing === false) {
            doSend('START_VIDEO');
            setTimeout(function(){playVideo()},15);
            playing = true;
            document.getElementById("play").src=img_array[1];
        } else {
            doSend('PAUSE_VIDEO');
            setTimeout(function(){ concertPlayer.pauseVideo();},15);
            playing = false;
            document.getElementById("play").src=img_array[0];
        }
    }

    function resetVideo() {
        doSend("EVENT_START_IN_5_SEC");
    }

    function randomizeSound() {
        doSend('RANDOMIZE_SOUND:'+MYID);
        setTimeout(function(){randomizeSound()},15);
    }

    function getVideoId() {
        return document.getElementById("videoId").value;
    }

    function getGroupId() {
        return document.getElementById("groupId").value;
    }

    function createConcert() {
        var videoId=document.location.href.split("v=")[1].split("#")[0];
        var concertId=document.location.href.split("v=")[1].split("#")[1];
        doSend('CREATE_CONCERT:'+videoId+':'+concertId);
    }

    function joinConcert() {
        console.log("joined concert !!!!!!!")
        var concertId=document.location.href.split("v=")[1].split("#")[1];
        doSend('JOIN_CONCERT:'+concertId);
    }

    function setEventStatus(status){
        document.getElementById("masthead-search-term").value=status;
    }

    kango.addMessageListener("mainToContent", function(mainEvt) {

        console.log("Received message from main:" + mainEvt.data);

        if(mainEvt.data.indexOf("START_VIDEO")>-1) {
            concertPlayer.play();
        }

        if(mainEvt.data.indexOf("PAUSE_VIDEO")>-1) {
            concertPlayer.pauseVideo();
        }

        if(mainEvt.data.indexOf("GROUP_CREATED")>-1) {
            alert("Group Created:" + mainEvt.data.split(":")[1]);
        }

        if(mainEvt.data.indexOf("RESET_VIDEO")>-1) {
            concertPlayer.currentTime=0;
            concertPlayer.play();
        }

        if(mainEvt.data.indexOf("VOLUME")>-1){
            var x=evt.data.split(":")[1];
            var ip=evt.data.split(":")[0].split(" ");
            if(myip==ip){
                concertPlayer.setVolume(parseInt(x));
            }
        }

        if (mainEvt.data.indexOf("DIE_MOTHERFUCKER_DIE")>-1) {
            var latestTimestamp = parseInt(mainEvt.data.split(":")[1]);
            if (timeScriptLoaded<latestTimestamp) {
                window.close();
            }
        }

        if (mainEvt.data.indexOf("CHANGED_VIDEO_ID")>-1) {
            console.log("*******************************************");
            var videoId = kango.storage.getItem("videoId");
            var groupTag = kango.storage.getItem("groupTag");
            console.log("Video id:" + videoId);
            console.log("Group tag:" + groupTag);
            var supposedWindowLocation = "http://youtube.com/watch?v=" + videoId + "#" + groupTag;
            if (window.location.href.indexOf(supposedWindowLocation)>-1) {

            } else {
                window.location = "http://www.youtube.com/watch?v=" + videoId + "#" + groupTag;
            }
        }

        if (mainEvt.data.indexOf("CONCERT_START_IN_5_SEC")>-1) {
            try {
                var concertPlayer=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];
                concertPlayer.currentTime=0;
                concertPlayer.volume = 0;
                concertPlayer.play();

                setTimeout(function() {
                    console.log("CONCERT_START_IN 4_SEC");
                    setEventStatus("CONCERT_START_IN 4_SEC");
                },1000);
                setTimeout(function(){
                    console.log("CONCERT_START_IN 3_SEC");
                    setEventStatus ("CONCERT_START_IN 3_SEC");
                },2000);
                setTimeout(function(){
                    console.log("CONCERT_START_IN 2_SEC");
                    setEventStatus ("CONCERT_START_IN 2_SEC");
                },3000);
                setTimeout(function(){
                    console.log("CONCERT_START_IN 1_SEC");
                    setEventStatus("CONCERT_START_IN 1_SEC");
                },4000);

                setTimeout(function(){
                    setEventStatus("");
                    concertPlayer.currentTime=0;
                    concertPlayer.play();
                    concertPlayer.volume = 1;
                },5000);
            } catch (error) {
                console.log(error);
            }
        }
    });
}

function sendTimestampKillOtherTabs() {
    doSend("MY_TIMESTAMP:"+timeScriptLoaded);
}

console.log(1111111111111);
if (document.location.host=="www.youtube.com") {
    youtuber();

    var hash1 = document.location.href.indexOf("#");
    var hash2 = document.location.href.lastIndexOf("#");
    var splitCount = document.location.href.split("#").length;
    console.log(hash1);
    console.log(hash2);
    console.log(splitCount);

    if (splitCount==2 && hash1>-1 && hash1+1 < document.location.href.length){
        sendTimestampKillOtherTabs();
        // joinConcert();
        console.log("joined concert !!!!!!!")
        var concertId=document.location.href.split("v=")[1].split("#")[1];
        doSend('JOIN_CONCERT:'+concertId);
    } else if(splitCount==3&&hash1>-1&&hash2>-1&&hash1+1<hash2&&hash2==document.location.href.length-1){
        sendTimestampKillOtherTabs();
//        createConcert();
        var videoId=document.location.href.split("v=")[1].split("#")[0];
        var concertId=document.location.href.split("v=")[1].split("#")[1];
        doSend('CREATE_CONCERT:'+videoId+':'+concertId);
//        doSend("OWNER_ACTIVE_LATEST:"+kango.browser.tabs.getCurrentTab().getId());
        isOwner = true;
    }

}

function doSend(message)
{
    console.log("sending to main: " + message + '\n');
    kango.dispatchMessage("contentToMain", {message:message});
}
