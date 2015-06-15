import json
import signal, sys, ssl
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer, SimpleSSLWebSocketServer
from optparse import OptionParser
import string, time, random


class SimpleEcho(WebSocket):
    def handleMessage(self):
        self.sendMessage(self.data)

    def handleConnected(self):
        pass

    def handleClose(self):
        pass

# Response Macros
USER_ID = "userId"
CONCERT_TAG = "concertTag"
VIDEO_URL = "videoUrl"
VOFFSET = "vOffset"
VIDEO_STATE = "videoState"
OWNER_FLAG = "ownerFlag"
CLIENT_TIMESTAMP = "clientTimeStamp"
REQUEST_TYPE = "requestType"
ACK = "ack"                             # status acknowledgement for request successfully received.
NETWORK_DELAY = "networkDelay"
OWNER_DELAY = "ownerDelay"
CONCERT_CREATED = "concertCreated"
CONCERT_JOINED = "concertJoined"
RESPONSE_TYPE = "responseType"
CHUTIYA_KATA = "chutiyaKata"
NO_CONCERT = "noConcert"
I_AM_ALREADY_OWNER = "iAmAlreadyOwner"


# Request Types
R_CREATE_USER = 0
R_HANDSHAKING = 1
R_NETWORK_DELAY = 2
R_VIDEO_UPDATE = 3
R_USER_ONLINE = 4
R_PAGE_LOADED = 5


current_milli_time = lambda: int(round(time.time() * 1000))

userIdMainMap = {}
concertTagHashMap = {}

SHARING_CODE_LENGTH = 3


class Concert(object):
    def __init__(self, userId, concertTag, videoUrl=None):
        self.concertTag = concertTag
        self.ownerId = userId
        self.users = {userId}
        self.concertSize = 0  # unused - remove after checking.
        self.videoUrl = videoUrl
        self._updatedVOffsetTime = None
        self._vOffset = 0
        self._videoState = 2
        self.createdAt = current_milli_time()
        self.updatedAt = current_milli_time()

    def concertRelay(self, responseMap):
        ownerDelay = userIdMainMap[self.ownerId].networkDelay
        responseMap[OWNER_FLAG] = False
        responseMap[OWNER_DELAY] = ownerDelay
        for tempUserId in self.users:
            responseMap[USER_ID] = tempUserId
            if tempUserId != self.ownerId:
                try:
                    if userIdMainMap[tempUserId].getConcertTag() == self.concertTag:
                        userIdMainMap[tempUserId].client.sendingWrapper(responseMap)
                except Exception, e:
                    print "Exception: ", e

    def getCurrentTime(self):
        return int(round(time.time() * 1000))

    def getCurrentPlayTime(self):
        if self._updatedVOffsetTime is not None and self._vOffset is not None:
            return self._vOffset + self.getCurrentTime() - self._updatedVOffsetTime
        return 0

    def syncVideoAttributes(self, vOffset, videoState):
        self._vOffset = vOffset
        self._updatedVOffsetTime = self.getCurrentTime()
        self._videoState = videoState
        print "VOFFSET set in concert: ",
        print "_vOffset = ", vOffset,
        print "updatedVOffsetTime = ", self._updatedVOffsetTime,
        print "_videoState = ", self._videoState

    def getVideoState(self):
        return self._videoState


class User(object):
    def __init__(self, userId, client):
        self.id = userId
        self._concertTag = None
        self.networkDelay = 15  # default
        self.recentTime = -1
        self.client = client
        self.createdAt = current_milli_time()
        self.updatedAt = current_milli_time()

    def setClient(self, client):
        self.client = client

    def updateConcertTag(self, newConcertTag):
        try:
            if self._concertTag is not None \
                    and self._concertTag != newConcertTag \
                    and self._concertTag in concertTagHashMap \
                    and self.id in concertTagHashMap[self._concertTag].users:
                concertTagHashMap[self._concertTag].users.remove(self.id)
        except Exception, err:
            print "Exception in updateConcertTag: ", err
        self._concertTag = newConcertTag

    def getConcertTag(self):
        return self._concertTag

    def getCurrentTime(self):
        return int(round(time.time() * 1000))

    def updateRecentTime(self):
        self.recentTime = self.getCurrentTime()

    def setNetworkDelay(self, delay):
        self.networkDelay = delay
        print "set network delay as", delay

    def createConcert(self, concertTag, videoUrl):
        if concertTag not in concertTagHashMap:
            print "1. concertTag is None? ", self.getConcertTag() is None
            print "2. concertTagHashMap =", concertTagHashMap
            print "3. concertTag not in concertTagHashMap", self.getConcertTag() not in concertTagHashMap
            newConcert = Concert(self.id, concertTag, videoUrl)
            self.updateConcertTag(newConcert.concertTag)
            concertTagHashMap[newConcert.concertTag] = newConcert
            print "4. Latest concertTagHashMap =", concertTagHashMap
            return True
        elif concertTagHashMap[concertTag].ownerId == self.id:
            print "I am owner. I can change the video, bitch."
            self.updateConcertTag(concertTag)
            concertTagHashMap[concertTag].videoUrl = videoUrl
            return True
        else:
            print "The concert -", self.getConcertTag(), " is already underway. Please use different concert name "
        return False


class SimpleChat(WebSocket):
    def handleMessage(self):
        responseMap = {
            USER_ID: None,
            CONCERT_TAG: None,
            VIDEO_URL: None,
            VOFFSET: None,
            VIDEO_STATE: None,
            OWNER_FLAG: None,
            CLIENT_TIMESTAMP: None,
            REQUEST_TYPE: None,
            ACK: True,
            NETWORK_DELAY: None
        }

        try:
            message = json.loads(self.data)

            userId = getH(message, USER_ID)
            concertTag = getH(message, CONCERT_TAG)
            videoUrl = getH(message, VIDEO_URL)
            vOffset = getH(message, VOFFSET)
            videoState = getH(message, VIDEO_STATE)
            ownerFlag = getH(message, OWNER_FLAG)
            clientTimeStamp = getH(message, CLIENT_TIMESTAMP)
            requestType = getH(message, REQUEST_TYPE)
            networkDelay = getH(message, NETWORK_DELAY)

            if requestType == R_CREATE_USER:
                responseMap[USER_ID] = idGenerator(16)
                responseMap[REQUEST_TYPE] = R_CREATE_USER
                self.sendingWrapper(responseMap)

            elif requestType == R_HANDSHAKING:
                responseMap[CLIENT_TIMESTAMP] = clientTimeStamp
                responseMap[REQUEST_TYPE] = R_HANDSHAKING
                print "Sending handshaking to user.."
                self.sendingWrapper(responseMap)

            elif requestType == R_NETWORK_DELAY:
                user = None
                if userId in userIdMainMap:
                    user = userIdMainMap[userId]
                    user.setClient(self)
                else:
                    user = User(userId, self)
                    userIdMainMap[userId] = user
                user.networkDelay = networkDelay
                print "Network delay set as:", networkDelay, "for userId:", userId
                responseMap[USER_ID] = user.id
                responseMap[REQUEST_TYPE] = R_NETWORK_DELAY
                responseMap[NETWORK_DELAY] = networkDelay
                self.sendingWrapper(responseMap)

            elif requestType == R_USER_ONLINE:
                pass

            elif requestType == R_PAGE_LOADED:
                user = userIdMainMap[userId]
                user.setClient(self)

                # CREATE CONCERT
                if ownerFlag:

                    success = user.createConcert(concertTag, videoUrl)

                    if not success:
                        responseMap[RESPONSE_TYPE] = CHUTIYA_KATA
                        responseMap[USER_ID] = user.id
                        responseMap[CONCERT_TAG] = concertTag
                        responseMap[VIDEO_URL] = concertTagHashMap[concertTag].videoUrl
                        responseMap[VIDEO_STATE] = videoState
                        responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                        responseMap[OWNER_FLAG] = False
                        self.sendingWrapper(responseMap)
                    else:
                        # Either he was successful in creating the group or he was the master himself (cool cool).

                        user.updateConcertTag(concertTag)
                        responseMap[RESPONSE_TYPE] = CONCERT_CREATED
                        responseMap[USER_ID] = user.id
                        responseMap[CONCERT_TAG] = concertTag
                        responseMap[VIDEO_URL] = videoUrl
                        responseMap[VIDEO_STATE] = videoState
                        responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                        responseMap[OWNER_FLAG] = True
                        self.sendingWrapper(responseMap)

                # JOIN CONCERT
                else:
                    concertToJoin = concertTagHashMap.get(concertTag)

                    if concertToJoin is not None:
                        user.updateConcertTag(concertTag)
                        if concertToJoin.ownerId == userId:
                            # owner asked to join as non - owner. Owner bakchodi kar raha hai ab!
                            responseMap[USER_ID] = user.id
                            responseMap[CONCERT_TAG] = concertTag
                            responseMap[VIDEO_URL] = concertToJoin.videoUrl
                            responseMap[VIDEO_STATE] = concertToJoin.getVideoState()
                            responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                            responseMap[RESPONSE_TYPE] = I_AM_ALREADY_OWNER
                            responseMap[OWNER_FLAG] = True
                            responseMap[OWNER_DELAY] = user.networkDelay
                            self.sendingWrapper(responseMap)
                        else:
                            # ideal case - concert join.
                            concertToJoin.users.add(userId)
                            userIdMainMap[userId].updateConcertTag(concertTag)

                            responseMap[USER_ID] = user.id
                            responseMap[CONCERT_TAG] = concertTag
                            responseMap[VIDEO_URL] = concertToJoin.videoUrl
                            responseMap[VIDEO_STATE] = concertToJoin.getVideoState()
                            responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                            responseMap[RESPONSE_TYPE] = CONCERT_JOINED
                            responseMap[VOFFSET] = concertToJoin.getCurrentPlayTime()
                            ownerDelay = userIdMainMap[concertToJoin.ownerId].networkDelay
                            responseMap[OWNER_FLAG] = False
                            responseMap[OWNER_DELAY] = ownerDelay
                            self.sendingWrapper(responseMap)
                    else:
                        # no concert found.
                        responseMap[USER_ID] = user.id
                        responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                        responseMap[RESPONSE_TYPE] = NO_CONCERT
                        responseMap[OWNER_FLAG] = False
                        self.sendingWrapper(responseMap)

            elif requestType == R_VIDEO_UPDATE:
                user = userIdMainMap[userId]
                user.setClient(self)

                if ownerFlag:
                    if concertTag in concertTagHashMap and videoUrl is not None:
                        if concertTagHashMap[concertTag].ownerId == userId:
                            user.updateConcertTag(concertTag)
                            # BROADCAST
                            print "vOffset:", vOffset
                            print "videoState:", videoState
                            if vOffset is not None and videoState is not None:
                                concertTagHashMap[concertTag].syncVideoAttributes(vOffset, videoState)

                            responseMap[VOFFSET] = vOffset if vOffset is not None else None
                            responseMap[CONCERT_TAG] = concertTag
                            responseMap[VIDEO_STATE] = videoState
                            responseMap[VIDEO_URL] = videoUrl
                            responseMap[REQUEST_TYPE] = R_VIDEO_UPDATE
                            concertTagHashMap[concertTag].concertRelay(responseMap)
                        else:
                            print "chutiya bana raha hai"

        except Exception, e:
            print e

    def sendingWrapper(self, responseMap):
        try:
            print "Sending responseMap from sendingWrapper: ", json.dumps(responseMap)
            self.sendMessage(u"" + json.dumps(responseMap))
        except Exception, e:
            print "Exception while sending responseMap:", e

    def handleConnected(self):
        print self.address, 'connected'

    def handleClose(self):
        print self.address, 'closed'


def getH(hashMap, key):
    if key in hashMap:
        return hashMap[key]
    return None


def idGenerator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in xrange(size))


if __name__ == "__main__":

    parser = OptionParser(usage="usage: %prog [options]", version="%prog 1.0")
    parser.add_option("--host", default='', type='string', action="store", dest="host", help="hostname (localhost)")
    parser.add_option("--port", default=8000, type='int', action="store", dest="port", help="port (8000)")
    parser.add_option("--example", default='echo', type='string', action="store", dest="example", help="echo, chat")
    parser.add_option("--ssl", default=0, type='int', action="store", dest="ssl", help="ssl (1: on, 0: off (default))")
    parser.add_option("--cert", default='./cert.pem', type='string', action="store", dest="cert",
                      help="cert (./cert.pem)")
    parser.add_option("--ver", default=ssl.PROTOCOL_TLSv1, type=int, action="store", dest="ver", help="ssl version")

    (options, args) = parser.parse_args()

    cls = SimpleEcho
    if options.example == 'chat':
        cls = SimpleChat

    if options.ssl == 1:
        server = SimpleSSLWebSocketServer(options.host, options.port, cls, options.cert, options.cert,
                                          version=options.ver)
    else:
        server = SimpleWebSocketServer(options.host, options.port, cls)

    def close_sig_handler(signal, frame):
        server.close()
        sys.exit()

    signal.signal(signal.SIGINT, close_sig_handler)

    server.serveforever()
