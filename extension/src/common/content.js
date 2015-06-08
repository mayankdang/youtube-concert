function youtuber() {
    var player=document.getElementsByClassName("html5-video-container")[0].getElementsByTagName("video")[0];

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
                player.setVolume(volume);
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
        player.pauseVideo();
    }

    function playVideo() {
        player.play();
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
            setTimeout(function(){ player.pauseVideo();},15);
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
    function changeVideoId() {
        doSend('CHANGE_VIDEO_ID:'+getVideoId());
        playing = false;
        document.getElementById("play").src=img_array[0];
        //setTimeout(function(){window.location=(document.location.href.split('=')[0])+'='+getVideoId()},15);
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
        document.getElementById("event_status").innerText=status;
    }

    kango.addMessageListener("mainToContent", function(mainEvt) {

        console.log("Received message from main:" + mainEvt.data);

        if(mainEvt.data.indexOf("START_VIDEO")>-1) {
            player.play();
        }

        if(mainEvt.data.indexOf("PAUSE_VIDEO")>-1) {
            player.pauseVideo();
        }

        if(mainEvt.data.indexOf("GROUP_CREATED")>-1) {
            alert("Group Created:" + mainEvt.data.split(":")[1]);
        }

        if(mainEvt.data.indexOf("RESET_VIDEO")>-1) {
            player.currentTime=0;
            player.play();
        }

        if(mainEvt.data.indexOf("VOLUME")>-1){
            var x=evt.data.split(":")[1];
            var ip=evt.data.split(":")[0].split(" ");
            if(myip==ip){
                player.setVolume(parseInt(x));
            }
        }


    });

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
        // joinConcert();
        console.log("joined concert !!!!!!!")
        var concertId=document.location.href.split("v=")[1].split("#")[1];
        doSend('JOIN_CONCERT:'+concertId);
    } else if(splitCount==3&&hash1>-1&&hash2>-1&&hash1+1<hash2&&hash2==document.location.href.length-1){
        // createConcert();
        var videoId=document.location.href.split("v=")[1].split("#")[0];
        var concertId=document.location.href.split("v=")[1].split("#")[1];
        doSend('CREATE_CONCERT:'+videoId+':'+concertId);
    }

}

function doSend(message)
{
    console.log("sending to main: " + message + '\n');
    kango.dispatchMessage("contentToMain", {message:message});
}