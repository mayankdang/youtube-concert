function youtuber(){
    var IP = "192.168.0.109";
    var PORT = "8000";

//  2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//  3. This function creates an <iframe> (and YouTube player)
//  after the API code downloads.
    var player;
    var idtemp=document.location.href.split("=")[1];

    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: idtemp,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

//  4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
        event.target.playVideo();
    }

//  5. The API calls this function when the player's state changes.
//  The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
    var done = false;

    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
            done = true;
//                    setTimeout(function(){stopVideo();player.seekTo(0);},3000);
        }
    }

    var flag=0;
    var volume=100;
    var MYID=0;



    function upDowning(){
        try{
            MYID=parseInt(document.getElementById('name').value);
        }catch (err){

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
        player.stopVideo();
    }

    function playVideo() {
        player.playVideo();
        player.setLoop();
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
        doSend('CREATE_CONCERT:'+getVideoId());
    }

    function joinConcert() {
        doSend('JOIN_CONCERT:'+getGroupId());
    }

    var delayArray = [];
    var sent = false;
    function saveNetworkDelay(delay) {
        if (!sent) {
            if (delayArray.length>=10) {
                computeDelayMedianAndSend();
                sent = true;
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
        doSend("NETWORK_DELAY:" + parseInt(
            (parseInt(delayArray[5]) + parseInt(delayArray[4])) / 4));
        console.log(JSON.stringify(delayArray));
    }

    function doConnect() {
        websocket = new WebSocket( "ws://"+IP+":"+PORT+"/" );
        websocket.onopen = function(evt) { onOpen(evt) };
        websocket.onclose = function(evt) { onClose(evt) };
        websocket.onmessage = function(evt) { onMessage(evt) };
        websocket.onerror = function(evt) { onError(evt) };
    }


    var myip;
    function onOpen(evt) {
        doSend("HELLO_BUDDY:"+new Date().getTime());
        for (var i=0;i<20;i++) {
            setTimeout(function() {
                doSend("HELLO_BUDDY:" + new Date().getTime());
            }, (i+1)* 80);
        }
    }

    function onClose(evt) {
        console.log("disconnected\n");
    }

    function onMessage(evt) {
        console.log("response: " + evt.data + '\n');

        if (evt.data.indexOf("HeyYo! ty")>-1) {
            alert("omg");
        }

        if (evt.data.indexOf("HANDSHAKING_DONE")>-1){
            console.log("Handshaking done.");
        }

        if(evt.data.indexOf("HEY_BUDDY")>-1) {
            var diff = new Date().getTime()-parseInt(evt.data.split(':')[1]);
            saveNetworkDelay(diff);
        }

        if(evt.data.indexOf("START_VIDEO")>-1) {
            playVideo();
        }

        if(evt.data.indexOf("PAUSE_VIDEO")>-1) {
            player.pauseVideo();
        }

        if(evt.data.indexOf("RESET_VIDEO")>-1) {
            player.seekTo(0);player.playVideo()
        }

        if(evt.data.indexOf("PRINT_TIME")>-1) {
            console.log(evt.data + " "+ new Date().getTime());
        }

        if(evt.data.indexOf("VOLUME")>-1){
            var x=evt.data.split(":")[1];
            var ip=evt.data.split(":")[0].split(" ");
            if(myip==ip){
                player.setVolume(parseInt(x));
            }
        }

        if(evt.data.indexOf("CHANGED_VIDEO_ID")>-1){
            var id=evt.data.split(":")[1];
            document.getElementById("videoId").value = id;
            player.loadVideoById(id);
            player.seekTo(0);
            player.pauseVideo();
        }

        if(evt.data.indexOf("RANDOMIZE_SOUND")>-1)
        {
            setTimeout(randomizeSound,13+Math.random()*27);
        }


        if(evt.data.indexOf("GROUP_CREATED")>-1) {
            var groupId = evt.data.split(":")[1];
            document.getElementById("groupId").value = groupId;
            alert("Group Id:" + groupId);
        }

        if(evt.data.indexOf("NEW_USER_JOINED")>-1) {
            new_userId = evt.data.split(":")[1];
            var groupId = evt.data.split(":")[2];
            if (userId === new_userId) {
                alert("Successfully Joined Concert:" + groupId);
            } else {
                alert("New User "+userId+ " Joined Concert !");
            }
        }

        if(evt.data.indexOf("YOU_ALREADY_BELONG_TO_A_GROUP")>-1) {
            alert("You already belong to a group, Sire!");
        }

        if(evt.data.indexOf("CONCERT_START_IN_5_SEC")>-1) {
            var id=evt.data.split(":")[1];
            player.loadVideoById(id);

            player.seekTo(0);
            player.setVolume(0);
            player.playVideo();

            setTimeout(function(){
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
                player.seekTo(0);
                player.playVideo();
                player.setVolume(100);
            },5000);
        }
    }



    function onError(evt)
    {
        console.log('error: ' + evt.data + '\n');
        websocket.close();
    }

    var userId = Math.floor(Math.random()*1000000000);
    function doSend(message)
    {
        console.log("sent: " + message + '\n');
        websocket.send(JSON.stringify({message:message,id:userId}));
    }

    function doDisconnect() {
        websocket.close();
    }

    function setEventStatus(status){
        document.getElementById("event_status").innerText=status;
    }


    doConnect();

}

if(document.location.host=="www.youtube.com"){
    youtuber();
}