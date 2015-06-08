var IP = "192.168.0.109";
//var IP = "localhost";
var PORT = "8000";
var userId =-1;
var flag=0;
var volume=100;
var MYID=0;
var networkDelay=15;
var delayArray = [];
var sent = false;
//var concertActiveTabId = null;

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        return null;
    }
}

//kango.browser.addEventListener(kango.browser.event.BEFORE_NAVIGATE, function(event) {
//    alert(event.url);
//})

//kango.browser.addEventListener(kango.browser.event.BEFORE_NAVIGATE, function(event) {
//    // event = {string tabId, KangoBrowserTab target, string url, string title};
//    kango.console.log('Tab was changed to ' + event.url);
//
//    var newVideoId = youtube_parser(event.url);
//
//    if (!newVideoId){
//        return;
//    }
//
//    var videoId=kango.storage.getItem("videoId");
//    var groupTag=kango.storage.getItem("groupTag");
//
//    alert("concertActiveTabId:" + concertActiveTabId);
//    alert("event.target.getId():" + event.target.getId());
//    alert("event.target.getUrl():" + event.target.getUrl());
//    alert("event.browser.tabs.getCurrentTab().getUrl():" + event.browser.tabs.getCurrentTab().getUrl());
//    if (
//       (concertActiveTabId)
//    && (event.target.getId()==concertActiveTabId)
//    && (event.target.getUrl().indexOf("youtube.com")>-1)
//    && (event.browser.tabs.getCurrentTab().getUrl().indexOf("#"+groupTag+"#")>-1)
//        ) {
//        kango.storage.setItem("videoId", newVideoId);
//        event.target.navigate(event.url + "#" + groupTag + "#");
//    }
//
////    var concertFound=false;
//
////    kango.browser.tabs.getAll(function(tabs){
////        for(var i=0;i<tabs.length;i++){
////            if(tabs[i].getId()==concertActiveTabId) {
////                if(tabs[i].getUrl().indexOf("youtube.com")>-1&&tabs[i].getUrl().indexOf(videoId + "#" + groupTag)>-1){
////                    concertFound=true;
////                }
////            }
////        }
////    });
////
////    if (!concertFound&&videoId&&groupTag) {
////        if( event.target.getUrl().indexOf("youtube.com")>-1){
////            kango.storage.setItem("videoId", newVideoId);
////            event.target.navigate(event.url.split("youtube.com")[0]+"youtube.com/watch?v="+newVideoId + "#" + groupTag + "#");
////        }
////    }
//
//});

//kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function(event) {
//
//})

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
    networkDelay=parseInt((parseInt(delayArray[5]) + parseInt(delayArray[4])) / 4);
}

function doConnect() {
    websocket = new WebSocket( "ws://"+IP+":"+PORT+"/" );
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

var myip;
var groupTag;
function onOpen(evt) {
    if (kango.storage.getItem("userId")) {
        userId = kango.storage.getItem("userId");
        doSend("USER_ONLINE:" + userId+":"+groupTag);
        sendHelloBuddy();
    } else {
        doSend("REGISTER_USER");
    }
}

function sendHelloBuddy() {
    doSend("HELLO_BUDDY:" + new Date().getTime());
    for (var i=0;i<20;i++) {
        setTimeout(function() {
            doSend("HELLO_BUDDY:" + new Date().getTime());
        }, 80);
    }
}

function onClose(evt) {
    console.log("disconnected\n");
}

function onMessage(evt) {
    console.log("response: " + evt.data + '\n');

    setTimeout(function() {
        if (
            (evt.data.indexOf("START_VIDEO")>-1)
                || (evt.data.indexOf("PAUSE_VIDEO")>-1)
                || (evt.data.indexOf("RESET_VIDEO")>-1)
                || (evt.data.indexOf("VOLUME")>-1)
                || (evt.data.indexOf("GROUP_CREATED")>-1)
                || (evt.data.indexOf("CHANGED_VIDEO_ID")>-1)
                || (evt.data.indexOf("CONCERT_START_IN_5_SEC")>-1)
            )
        {
            if (evt.data.indexOf("CHANGED_VIDEO_ID")>-1) {
                console.log("videoId:" + evt.data.split(":")[1]);
                console.log("groupTag:" + evt.data.split(":")[2]);
                kango.storage.setItem("videoId", evt.data.split(":")[1]);
                kango.storage.setItem("groupTag", evt.data.split(":")[2]);
            }
            kango.browser.tabs.getAll(function(tabs){
                for(var i=0;i<tabs.length;i++){
                    try {
                        tabs[i].dispatchMessage("mainToContent", evt.data);
                        console.log("Sent to Tab:"+ evt.data);
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
        }

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

        if(evt.data.indexOf("GROUP_CREATED")>-1) {
            groupId = evt.data.split(":")[1];
            kango.storage.setItem("groupId",groupId);
        }

        if(evt.data.indexOf("PRINT_TIME")>-1) {
            console.log(evt.data + " "+ new Date().getTime());
        }

        //        TODO
        //        if(evt.data.indexOf("CHANGED_VIDEO_ID")>-1){
        //            var id=evt.data.split(":")[1];
        //            document.getElementById("videoId").value = id;
        //            player.loadVideoById(id);
        //            player.seekTo(0);
        //            player.pauseVideo();
        //        }

        if(evt.data.indexOf("RANDOMIZE_SOUND")>-1)
        {
            setTimeout(randomizeSound,13+Math.random()*27);
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

        if(evt.data.indexOf("USER_REGISTERED")>-1) {
            userId = evt.data.split(":")[1];
            kango.storage.setItem("userId",userId);
            sendHelloBuddy();
        }
    },networkDelay);
}
function onError(evt)
{
    console.log('error: ' + evt.data + '\n');
    websocket.close();
}

function doDisconnect() {
    websocket.close();
}

function doSend(message)
{
    console.log("sent: " + message + '\n');
    websocket.send(JSON.stringify({message:message,id:userId}));
}

kango.addMessageListener("contentToMain", function(contentEvt) {
    console.log("contentToMain:" + contentEvt.data.message);
    if (contentEvt.data.message.indexOf("MY_TIMESTAMP")>-1) {
        var latestWindowTimestamp = contentEvt.data.message.split(":")[1];
        kango.browser.tabs.getAll(function(tabs){
            for(var i=0;i<tabs.length;i++){
                tabs[i].dispatchMessage("mainToContent", "d:"+latestWindowTimestamp);
                console.log("Sent to Tab:"+ "DIE_MOTHERFUCKER_DIE:" + latestWindowTimestamp);
            }
        });
//    } else if (contentEvt.data.message.indexOf("OWNER_ACTIVE_LATEST")>-1) {
//        concertActiveTabId = contentEvt.data.message.split(":")[1];
    } else {
        doSend(contentEvt.data.message);
    }
});

kango.addMessageListener("optionsToMain", function(optionEvt) {
    console.log("optionToMain:" + optionEvt.data.message);
    doSend(optionEvt.data.message);
});

doConnect();
