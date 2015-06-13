var IP = "192.168.0.104";
var PORT = "8000";
var websocket;
var videoChecking=false;

// response macros
var USER_ID = "userId";
var CONCERT_TAG = "concertTag";
var VIDEO_URL = "videoUrl";
var VOFFSET = "vOffset";
var VIDEO_STATE = "videoState";
var OWNER_FLAG = "ownerFlag";
var CLIENT_TIMESTAMP = "clientTimeStamp";
var REQUEST_TYPE = "requestType";
var ACK = "ack";
var NETWORK_DELAY = "networkDelay";
var OWNER_DELAY = "ownerDelay";
var CONCERT_CREATED = "concertCreated";
var CONCERT_JOINED = "concertJoined";
var RESPONSE_TYPE = "responseType";
var CHUTIYA_KATA = "chutiyaKata";
var NO_CONCERT = "noConcert";
var I_AM_ALREADY_OWNER = "iAmAlreadyOwner";

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
        if (kango.storage.getItem(USER_ID)) {
            var userId = kango.storage.getItem(USER_ID);
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
        messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
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
            if (responseType==CONCERT_CREATED) {

            } else if (responseType==CHUTIYA_KATA) {

            } else if (responseType==CONCERT_JOINED) {

            } else if (responseType==NO_CONCERT) {

            } else if (responseType==I_AM_ALREADY_OWNER) {

            }
            try {
                concertYoutubeTab.dispatchMessage("mainToContent",{response:response});
            } catch (exception) {}
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

kango.browser.addEventListener(kango.browser.event.TAB_CREATED, function(event) {
    // event = {string tabId, KangoBrowserTab target, string url, string title};
    kango.console.log('Tab was changed to ' + event.url);

    try {
        var tab = event.target;
        var url = tab.getUrl();
        var success=false;
        var cname=null;
        var videoTag=youtube_parser(url);
        var concertTag=concert_parser(url);

        if(videoTag && concertTag) {
            var ownerBannaChahtaHai = false;
            if(url.lastIndexOf("#")==url.length-1) {
                ownerBannaChahtaHai = true;
            }

            if (ownerBannaChahtaHai) {
                var messageToSend=new Object();
                //todo: Video play/pause update offset
                messageToSend[USER_ID]=kango.storage.getItem(USER_ID);
                messageToSend[VIDEO_URL]=videoTag;
                messageToSend[VOFFSET]=0;
                messageToSend[VIDEO_STATE] = 0;//0 buffering 1 play  2 pause  3 end
                messageToSend[CONCERT_TAG] = concertTag;
                messageToSend[OWNER_FLAG] = createRequest;
                messageToSend[REQUEST_TYPE] = R_VIDEO_UPDATE;
                doSend(messageToSend);
            }
        }
    } catch (err) {

    }
});



var concertLink="";
var concertYoutubeTab;
var concertTabId=-1;
setInterval ( function() {
    kango.browser.tabs.getAll(function(tabs) {
            console.log("concertTabId :"+concertTabId);
            if(concertTabId!=-1) {
                var success = true;
                if (concertYoutubeTab.getId()==concertTabId) {
                    success=true;
                    if (concertYoutubeTab.getUrl()!=concertLink) {
                        concertLink=concertYoutubeTab.getUrl();
                        // hat jaega.
                        var concertTag=concert_parser(concertLink)||getParameterFromStorage(CONCERT_TAG);
                        var newVideoId=youtube_parser(concertLink);

                        if (concert_parser(CONCERT_TAG)) {

                        } else {
                            concertYoutubeTab.dispatchMessage("mainToContent","UPDATE_HASH");
                        }

                        var createRequest=false;
                        var url=concertYoutubeTab.getUrl();
                        if(url.lastIndexOf("#")==url.length-1){
                            createRequest=true;
                        }

                        if(newVideoId!=null) {
                            var messageToSend=new Object();
                            messageToSend[USER_ID]=kango.storage.getItem(USER_ID);
                            messageToSend[VIDEO_URL]=newVideoId;
                            messageToSend[VIDEO_STATE] = 0;//0 buffering 1 play  2 pause  3 end
                            messageToSend[VOFFSET] = 0;
                            messageToSend[CONCERT_TAG] = concertTag;
                            messageToSend[OWNER_FLAG] = (createRequest);
                            messageToSend[REQUEST_TYPE] = R_VIDEO_UPDATE;
                            doSend(messageToSend);
                        }
                    }

                }

            } else {
                kango.browser.tabs.getAll(function(tabs) {
                    // tabs is Array of KangoBrowserTab
                    for(var i = 0; i <tabs.length; i++){
                        try {
                            var url=tabs[i].getUrl();
                            var success=false;
                            var cname=null;
                            var videoTag=youtube_parser(url);
                            var concertTag=concert_parser(url);
                            var newVideoId=youtube_parser(url);

                            if(videoTag && concertTag) {
                                if(tabs[i].getUrl()!=concertLink){
                                    concertLink=tabs[i].getUrl();
                                    var messageToSend=new Object();
                                    var url=tabs[i].getUrl();
                                    var createRequest=false;

                                    if(url.lastIndexOf("#")==url.length-1){
                                        createRequest=true;
                                    }

                                    //todo: Video play/pause update offset
                                    messageToSend[USER_ID]=kango.storage.getItem(USER_ID);
                                    messageToSend[VIDEO_URL]=videoTag;
                                    messageToSend[VOFFSET]=0;
                                    messageToSend[VIDEO_STATE] = 0;//0 buffering 1 play  2 pause  3 end
                                    messageToSend[CONCERT_TAG] = concertTag;
                                    messageToSend[OWNER_FLAG] = createRequest;
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
    },
        1000)
});

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        return null;
    }
}

kango.addMessageListener("contentToMain", function(contentEvt) {

    console.log("contentToMain:" + contentEvt.data);

    //todo - contentEvt.data has owner_flag as an attribute.
    if (getParameterFromStorage(OWNER_FLAG) == false) {
        var concertTag = contentEvt.data.c;

        var messageToSend = new Object();
        messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
        messageToSend[CONCERT_TAG] = concertTag;
        messageToSend[OWNER_FLAG] = false;
        messageToSend[REQUEST_TYPE] = R_VIDEO_UPDATE;
        doSend(messageToSend);
    } else {
        var videoId = contentEvt.data.v;
        var concertTag = contentEvt.data.c;
        var correctVideoOffset = contentEvt.data.o;
        var videoState = contentEvt.data.vs;

        var messageToSend = new Object();
        messageToSend[USER_ID] = kango.storage.getItem(USER_ID);
        messageToSend[VIDEO_URL] = videoId;
        messageToSend[CONCERT_TAG] = concertTag;
        messageToSend[VIDEO_STATE] = videoState;
        messageToSend[VOFFSET] = correctVideoOffset;
        messageToSend[OWNER_FLAG] = true;
        messageToSend[REQUEST_TYPE] = R_VIDEO_UPDATE;
        doSend(messageToSend);
    }
});

//
//kango.addMessageListener("optionsToMain", function(optionEvt) {
//    console.log("optionToMain:" + optionEvt.data.message);
//    doSend(optionEvt.data.message);
//});
//
//doConnect();
