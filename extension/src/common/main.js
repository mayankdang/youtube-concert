var IP = "192.168.0.104";
var PORT = "8000";
var websocket;
var videoChecking=false;
var concertTabId=-1;

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
var GROUP_CREATED = "groupCreated"
var RESPONSE_TYPE = "responseType"

// Request Types
var R_CREATE_USER = 0;
var R_HANDSHAKING = 1;
var R_NETWORK_DELAY = 2;
var R_VIDEO_UPDATE = 3;
var R_USER_ONLINE = 4;

var sentNetworkDelay=false;
var delayArray = [];

function doConnect() {
    websocket = new WebSocket( "ws://"+IP+":"+PORT+"/" );
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };

    function onClose(evt) {
        console.log("Disconnected.\n");
    }

    function onError(evt)
    {
        console.log('Error: ' + evt.data + '\n');
        websocket.close();
    }

    function onOpen(evt) {
        if (getParameterFromStorage(USER_ID)) {
            var userId = getParameterFromStorage(USER_ID);
            var messageToSend = new Object();
            messageToSend[USER_ID] = userId;
            messageToSend[REQUEST_TYPE] = R_USER_ONLINE;
            initiateHandshaking();
            doSend(messageToSend);
        } else {
            var messageToSend = new Object();
            messageToSend[REQUEST_TYPE] = R_CREATE_USER;
            doSend(messageToSend);
        }
    }

    function initiateHandshaking() {
        delayArray = [];
        var messageToSend = new Object();
        messageToSend[REQUEST_TYPE] = R_HANDSHAKING;
        for (var i=0;i<5;i++) {
            setTimeout(function() {
                messageToSend[CLIENT_TIMESTAMP] = new Date().getTime();
                doSend(messageToSend);
            }, 200*i);
        }
    }

    function saveNetworkDelay(delay) {
        console.log("delay is - " + delay);
        if (!sentNetworkDelay) {
            if (delayArray.length>=3) {
                computeDelayMedianAndSend();
                sentNetworkDelay = true;
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

        var networkDelay = parseInt(delayArray[1]);
        var messageToSend = new Object();
        messageToSend[REQUEST_TYPE] = R_NETWORK_DELAY;
        messageToSend[NETWORK_DELAY] = networkDelay;
        messageToSend[USER_ID] = getParameterFromStorage(USER_ID);
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
        var videoTime = response[VIDEO_TIME];
        var clientTimeStamp = response[CLIENT_TIMESTAMP];
        var requestType = response[REQUEST_TYPE];
        var ack = response[ACK];
        var networkDelay = response[NETWORK_DELAY];
        var responseType=response[RESPONSE_TYPE];

        if (requestType == R_CREATE_USER) {
            setParameterInStorage(USER_ID, userId);
            initiateHandshaking();
        }

        if (requestType == R_HANDSHAKING) {
            console.log("Handshaking ki request aayi hai.");
            var diff = new Date().getTime()-parseInt(clientTimeStamp);
            saveNetworkDelay(diff);
        }

        if (requestType == R_NETWORK_DELAY) {
            console.log("******* Network Delay is: " + networkDelay + " *******");
            setParameterInStorage(NETWORK_DELAY, networkDelay);
        }

        if (requestType == R_VIDEO_UPDATE){
            var concertTagPrev = getParameterFromStorage(CONCERT_TAG);
            var videoUrlPrev = getParameterFromStorage(VIDEO_URL);
            var ownerFlagPrev = getParameterFromStorage(OWNER_FLAG);

            try {
                if(ownerFlag==null){}
                else{
                    if(!ownerFlag)
                    {
                        concertYoutubeTab.dispatchMessage("mainToContent",{
                            response:response
                        });
                    }
                }
            } catch (error) {
                console.log(error);
            }


            if(ownerFlag==null){
                //can be null

            }else{
                setParameterInStorage(OWNER_FLAG,ownerFlag);
                if(ownerFlag){
                    //video owner
                    if(responseType==GROUP_CREATED){
                        //forward it to content js
                        if(videoUrl!=null&&videoUrlPrev!=videoUrl){
                            setParameterInStorage(VIDEO_URL,videoUrl);
                        }

                        if(concertTag!=null&&concertTagPrev!=concertTag){
                            setParameterInStorage(CONCERT_TAG,concertTag);
                        }
                    }
                }
                else{
                    //video joinee
                    if(vOffset!=null){
                        //forward it to content js
                    }

                    if(videoState!=null){
                        //forward it to content js
                    }

                    if(videoUrl!=null&&videoUrlPrev!=videoUrl){
                        setParameterInStorage(VIDEO_URL,videoUrl);
                    }

                    if(concertTag!=null&&concertTagPrev!=concertTag){
                        setParameterInStorage(CONCERT_TAG,concertTag);
                    }
                }
            }
        }
    }


    function doDisconnect() {
        websocket.close();
    }


}
doConnect();

function doSend(requestMap)
{
    console.log("sent: " + JSON.stringify(requestMap) + '\n');
    websocket.send(JSON.stringify(requestMap));
}

function concert_parser(url){
    try{
        if(url.indexOf("youtube.com")>-1){
            if(url.lastIndexOf("#")==url.length-1){
                var turl=url.substring(0,url.length-1);
                var arr=turl.split("#");
                if(arr.length>=1){
                    return arr[arr.length-1].replace(/[^a-zA-Z0-9]/g, "");
                }
            }
            else if(url.lastIndexOf("#")>-1){
                var turl=url.substring(url.lastIndexOf("#")+1,url.length);
                var arr=turl.split("#");
                if(arr.length>=1){
                    return arr[arr.length-1].replace(/[^a-zA-Z0-9]/g, "");
                }
            }
        }
    }catch (err){
    }
    return null;
}

function getParameterFromStorage(parameter) {
    return kango.storage.getItem(parameter);
}

function setParameterInStorage(parameter, value) {
    kango.storage.setItem(parameter, value);
}


var concertLink="";
var concertYoutubeTab;
setInterval(function(){
    if(concertTabId!=-1){
        var success=false;
        kango.browser.tabs.getAll(function(tabs) {
            // tabs is Array of KangoBrowserTab
            for(var i = 0; i < tabs.length; i++){
                if(tabs[i].getId()==concertTabId){
                    success=true;
                    if(tabs[i].getUrl()!=concertLink){
                        concertLink=tabs[i].getUrl();
                        var concertTag=concert_parser(concertLink)||getParameterFromStorage(CONCERT_TAG);
                        var newVideoId=youtube_parser(concertLink);

                        if(concert_parser(CONCERT_TAG)){

                        }else{
                            tabs[i].dispatchMessage("mainToContent","UPDATE_HASH");
                        }

                        if(newVideoId!=null){
                            var messageToSend=new Object();
                            messageToSend[USER_ID]=getParameterFromStorage(USER_ID);
                            messageToSend[VIDEO_URL]=newVideoId;
                            messageToSend[VIDEO_STATE] = 0;//0 buffering 1 play  2 pause  3 end
                            messageToSend[CONCERT_TAG] = concertTag;
                            messageToSend[REQUEST_TYPE] = R_VIDEO_UPDATE;
                            doSend(messageToSend);
                        }
                    }
                }
                //console.log(tabs[i].getUrl());
            }
            if(!success){
                concertTabId=-1;
                concertYoutubeTab=null;
            }
        });


    }else{
        kango.browser.tabs.getAll(function(tabs) {
            // tabs is Array of KangoBrowserTab
            for(var i = 0; i < tabs.length; i++){
                try{
                    var url=tabs[i].getUrl();
                    var success=false;
                    var cname=null;
                    var videoTag=youtube_parser(url);
                    var concertTag=concert_parser(url);
                    var newVideoId=youtube_parser(url);

                    //if(newVideoId!=youtube_parser(getParameterFromStorage(VIDEO_URL))){
                    if(videoTag&&concertTag){
                        if(tabs[i].getUrl()!=concertLink){
                            concertLink=tabs[i].getUrl();
                            var messageToSend=new Object();
                            messageToSend[USER_ID]=getParameterFromStorage(USER_ID);
                            messageToSend[VIDEO_URL]=videoTag;
                            messageToSend[VIDEO_STATE] = 0;//0 buffering 1 play  2 pause  3 end
                            messageToSend[CONCERT_TAG] = concertTag;
                            messageToSend[REQUEST_TYPE] = R_VIDEO_UPDATE;
                            doSend(messageToSend);
                            concertTabId=tabs[i].getId();
                            concertYoutubeTab=tabs[i];
                            break;
                        }
                    }
                }catch (er){
                }
            }
        });


    }


},1000);


function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        return null;
    }
}





//
//        console.log("response: " + evt.data + '\n');
//
//        setTimeout(function() {
//            if (
//                (evt.data.indexOf("START_VIDEO")>-1)
//                    || (evt.data.indexOf("PAUSE_VIDEO")>-1)
//                    || (evt.data.indexOf("RESET_VIDEO")>-1)
//                    || (evt.data.indexOf("VOLUME")>-1)
//                    || (evt.data.indexOf("GROUP_CREATED")>-1)
//                    || (evt.data.indexOf("CHANGED_VIDEO_ID")>-1)
//                    || (evt.data.indexOf("CONCERT_START_IN_5_SEC")>-1)
//                )
//            {
//                if (evt.data.indexOf("CHANGED_VIDEO_ID")>-1) {
//                    console.log("videoId:" + evt.data.split(":")[1]);
//                    console.log("groupTag:" + evt.data.split(":")[2]);
//                    kango.storage.setItem("videoId", evt.data.split(":")[1]);
//                    kango.storage.setItem("groupTag", evt.data.split(":")[2]);
//                }
//                kango.browser.tabs.getAll(function(tabs){
//                    for(var i=0;i<tabs.length;i++){
//                        try {
//                            tabs[i].dispatchMessage("mainToContent", evt.data);
//                            console.log("Sent to Tab:"+ evt.data);
//                        } catch (error) {
//                            console.log(error);
//                        }
//                    }
//                });
//            }
//
//            if (evt.data.indexOf("HeyYo! ty")>-1) {
//                alert("omg");
//            }
//
//            if (evt.data.indexOf("HANDSHAKING_DONE")>-1){
//                console.log("Handshaking done.");
//            }
//
//            if(evt.data.indexOf("HEY_BUDDY")>-1) {
//                var diff = new Date().getTime()-parseInt(evt.data.split(':')[1]);
//                saveNetworkDelay(diff);
//            }
//
//            if(evt.data.indexOf("GROUP_CREATED")>-1) {
//                groupTag = evt.data.split(":")[1];
//                kango.storage.setItem("groupTag",groupTag);
//            }
//
//            if(evt.data.indexOf("PRINT_TIME")>-1) {
//                console.log(evt.data + " "+ new Date().getTime());
//            }

            //        TODO
            //        if(evt.data.indexOf("CHANGED_VIDEO_ID")>-1){
            //            var id=evt.data.split(":")[1];
            //            document.getElementById("videoId").value = id;
            //            player.loadVideoById(id);
            //            player.seekTo(0);
            //            player.pauseVideo();
            //        }

//            if(evt.data.indexOf("RANDOMIZE_SOUND")>-1)
//            {
//                setTimeout(randomizeSound,13+Math.random()*27);
//            }
//
//            if(evt.data.indexOf("NEW_USER_JOINED")>-1) {
//                new_userId = evt.data.split(":")[1];
//                var groupTag = evt.data.split(":")[2];
//                if (userId === new_userId) {
//                    alert("Successfully Joined Concert:" + groupTag);
//                } else {
//                    alert("New User "+userId+ " Joined Concert !");
//                }
//            }
//
//            if(evt.data.indexOf("YOU_ALREADY_BELONG_TO_A_GROUP")>-1) {
//                alert("You already belong to a group, Sire!");
//            }
//
//            if(evt.data.indexOf("USER_REGISTERED")>-1) {
//                userId = evt.data.split(":")[1];
//                kango.storage.setItem("userId",userId);
//                sendHelloBuddy();
//            }
//},networkDelay);











////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////var IP = "192.168.0.109";
//var IP = "localhost";
//var PORT = "8000";
//
//var flag=0;
//var volume=100;
//var MYID=0;
//
//
//var sent = false;
////var concertActiveTabId = null;
//
//function youtube_parser(url){
//    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
//    var match = url.match(regExp);
//    if (match&&match[7].length==11){
//        return match[7];
//    }else{
//        return null;
//    }
//}
//
////kango.browser.addEventListener(kango.browser.event.BEFORE_NAVIGATE, function(event) {
////    alert(event.url);
////})
//
////kango.browser.addEventListener(kango.browser.event.BEFORE_NAVIGATE, function(event) {
////    // event = {string tabId, KangoBrowserTab target, string url, string title};
////    kango.console.log('Tab was changed to ' + event.url);
////
////    var newVideoId = youtube_parser(event.url);
////
////    if (!newVideoId){
////        return;
////    }
////
////    var videoId=kango.storage.getItem("videoId");
////    var groupTag=kango.storage.getItem("groupTag");
////
////    alert("concertActiveTabId:" + concertActiveTabId);
////    alert("event.target.getId():" + event.target.getId());
////    alert("event.target.getUrl():" + event.target.getUrl());
////    alert("event.browser.tabs.getCurrentTab().getUrl():" + event.browser.tabs.getCurrentTab().getUrl());
////    if (
////       (concertActiveTabId)
////    && (event.target.getId()==concertActiveTabId)
////    && (event.target.getUrl().indexOf("youtube.com")>-1)
////    && (event.browser.tabs.getCurrentTab().getUrl().indexOf("#"+groupTag+"#")>-1)
////        ) {
////        kango.storage.setItem("videoId", newVideoId);
////        event.target.navigate(event.url + "#" + groupTag + "#");
////    }
////
//////    var concertFound=false;
////
//////    kango.browser.tabs.getAll(function(tabs){
//////        for(var i=0;i<tabs.length;i++){
//////            if(tabs[i].getId()==concertActiveTabId) {
//////                if(tabs[i].getUrl().indexOf("youtube.com")>-1&&tabs[i].getUrl().indexOf(videoId + "#" + groupTag)>-1){
//////                    concertFound=true;
//////                }
//////            }
//////        }
//////    });
//////
//////    if (!concertFound&&videoId&&groupTag) {
//////        if( event.target.getUrl().indexOf("youtube.com")>-1){
//////            kango.storage.setItem("videoId", newVideoId);
//////            event.target.navigate(event.url.split("youtube.com")[0]+"youtube.com/watch?v="+newVideoId + "#" + groupTag + "#");
//////        }
//////    }
////
////});
//
////kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function(event) {
////
////})
//
//var myip;
//var groupTag;
//
//
//
//
//
//
//
//
//
//
//
//
//kango.addMessageListener("contentToMain", function(contentEvt) {
//    console.log("contentToMain:" + contentEvt.data.message);
//    if (contentEvt.data.message.indexOf("MY_TIMESTAMP")>-1) {
//        var latestWindowTimestamp = contentEvt.data.message.split(":")[1];
//        kango.browser.tabs.getAll(function(tabs){
//            for(var i=0;i<tabs.length;i++){
//                tabs[i].dispatchMessage("mainToContent", "d:"+latestWindowTimestamp);
//                console.log("Sent to Tab:"+ "DIE_MOTHERFUCKER_DIE:" + latestWindowTimestamp);
//            }
//        });
////    } else if (contentEvt.data.message.indexOf("OWNER_ACTIVE_LATEST")>-1) {
////        concertActiveTabId = contentEvt.data.message.split(":")[1];
//    } else {
//        doSend(contentEvt.data.message);
//    }
//});
//
//kango.addMessageListener("optionsToMain", function(optionEvt) {
//    console.log("optionToMain:" + optionEvt.data.message);
//    doSend(optionEvt.data.message);
//});
//
//doConnect();
