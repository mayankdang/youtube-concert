import json
import signal, sys, ssl
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer, SimpleSSLWebSocketServer
from optparse import OptionParser
import string, time, random
import re


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
SERVER_TIMESTAMP = "serverTimeStamp"
CLOCK_DIFF = "clockDiff"
REQUEST_TYPE = "requestType"
ACK = "ack"                             # status acknowledgement for request successfully received.
CONCERT_CREATED = "concertCreated"
CONCERT_JOINED = "concertJoined"
RESPONSE_TYPE = "responseType"
CONCERT_TAKEN = "concertTaken"
NO_CONCERT = "noConcert"
I_AM_ALREADY_OWNER = "iAmAlreadyOwner"
TAB_ID = "tab_id"
CLIENT_VERSION = "clientVersion"
PATCH_MAIN = "patchMain"
PATCH_CONTENT = "patchContent"
ADMIN_TOKEN = "adminToken"

# Request Types
R_CREATE_USER = 0
R_HANDSHAKING = 1
R_CLOCK_DIFF = 2
R_VIDEO_UPDATE = 3
R_USER_ONLINE = 4
R_PAGE_LOADED = 5
R_ADMIN_PATCH = 6
R_ADMIN_VERSION_UPDATE = 7
R_LEAVE_CONCERT = 8

current_milli_time = lambda: int(round(time.time() * 1000))

userIdMainMap = {}
concertTagHashMap = {}

versionFilePath = "extension/src/common/version.txt"

# Patches, saved.
globalMainPatchScript = None
globalContentPatchScript = None
globalCurrentClientVersion = None
try:
    globalCurrentClientVersion = open(versionFilePath).read().strip()
except Exception, e:
    print "Exception:", e


class Concert(object):
    def __init__(self, userId, concertTag, videoUrl=None):
        self.concertTag = concertTag
        self.ownerId = userId
        self.users = {userId}
        self.concertSize = 0  # unused - remove after checking.
        self.videoUrl = videoUrl
        self._updatedVOffsetTime = current_milli_time()
        self._vOffset = 0
        self._videoState = 2

    def concertRelay(self, responseMap):
        responseMap[OWNER_FLAG] = False
        for tempUserId in self.users:
            responseMap[USER_ID] = tempUserId
            if tempUserId != self.ownerId:
                try:
                    if userIdMainMap[tempUserId].getConcertTag() == self.concertTag:
                        responseMap[CLIENT_TIMESTAMP] = self._updatedVOffsetTime + userIdMainMap[tempUserId].clockDiff
                        responseMap[TAB_ID] = userIdMainMap[tempUserId].getTabId()
                        userIdMainMap[tempUserId].client.sendingWrapper(responseMap)
                except Exception, err:
                    print "Exception: ", err

    def syncVideoAttributes(self, vOffset, videoState, clientTimeStamp, videoUrl):
        self._vOffset = vOffset
        self._updatedVOffsetTime = clientTimeStamp - userIdMainMap[self.ownerId].clockDiff
        self._videoState = videoState
        self.videoUrl = videoUrl
        print "VOFFSET set in concert: ",
        print "_vOffset = ", vOffset,
        print "_updatedVOffsetTime = ", self._updatedVOffsetTime,
        print "_videoState = ", self._videoState
        print "videoUrl = ", self.videoUrl

    def getVideoState(self):
        return self._videoState

    def getVideoOffset(self):
        return self._vOffset

    def getUpdatedVOffsetTime(self):
        return self._updatedVOffsetTime


class User(object):
    def __init__(self, userId, client):
        self.id = userId
        self._concertTag = None
        self._tabId = None
        self.clockDiff = 0  # default
        self.client = client

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

    def setClockDiff(self, clockDiff):
        self.clockDiff = clockDiff
        print "set Clock Diff as", clockDiff

    def updateTabId(self, newTabId):
        if newTabId is not None:
            self._tabId = newTabId

    def getTabId(self):
        return self._tabId

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
            CLOCK_DIFF: None
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
            clockDiff = getH(message, CLOCK_DIFF)
            tabId = getH(message, TAB_ID)
            adminToken = getH(message, ADMIN_TOKEN)
            mainPatchScript = getH(message, PATCH_MAIN)
            contentPatchScript = getH(message, PATCH_CONTENT)

            if concertTag is not None:
                if not re.match('^[a-zA-Z0-9]+$', concertTag):
                    print "Concert tag not alphanumeric!!!! --->", concertTag
                    return None

            if requestType == R_ADMIN_PATCH:
                print "Patch call... checking salt."
                if adminToken is not None and adminToken == "concert2015shadows":
                    print "Salt verified."
                    global globalMainPatchScript
                    global globalContentPatchScript
                    globalMainPatchScript = mainPatchScript
                    globalContentPatchScript = contentPatchScript
                    print "MainPatchScript:" + globalMainPatchScript
                    print "ContentPatchScript:" + globalContentPatchScript

                    responseMap[PATCH_MAIN] = globalMainPatchScript
                    responseMap[PATCH_CONTENT] = globalContentPatchScript
                    responseMap[REQUEST_TYPE] = R_ADMIN_PATCH

                    print "Passing patches to everyone..."
                    count = 0
                    for userIdTemp in userIdMainMap:
                        try:
                            userIdMainMap[userIdTemp].client.sendingWrapper(responseMap)
                            count += 1
                        except Exception, err:
                            print "Exception:", err
                    print "Sent to", count, "users."

            elif requestType == R_ADMIN_VERSION_UPDATE:
                print "Version Update call... checking salt."
                if adminToken is not None and adminToken == "concert2015shadows":
                    print "Salt verified."
                    global globalCurrentClientVersion
                    try:
                        globalCurrentClientVersion = open(versionFilePath).read().strip()
                        print "New Version: ", globalCurrentClientVersion
                    except Exception, err:
                        print "Exception:", err

            elif requestType == R_LEAVE_CONCERT:
                if userId is not None:
                    if userId in userIdMainMap:
                        user = userIdMainMap[userId]
                        user.setClient(self)
                        print "User:", userId, "wants to leave the concert. TO EACH HIS OWN, I say! :/"
                        # Setting user concertTag as None
                        user.updateConcertTag(None)

            elif requestType == R_CREATE_USER:
                responseMap[USER_ID] = idGenerator(16)
                responseMap[REQUEST_TYPE] = R_CREATE_USER
                self.sendingWrapper(responseMap)

            elif requestType == R_HANDSHAKING:
                responseMap[CLIENT_TIMESTAMP] = clientTimeStamp
                responseMap[SERVER_TIMESTAMP] = current_milli_time()
                responseMap[REQUEST_TYPE] = R_HANDSHAKING
                print "Sending handshaking to user.."
                self.sendingWrapper(responseMap)

            elif requestType == R_CLOCK_DIFF:
                user = None
                if userId in userIdMainMap:
                    user = userIdMainMap[userId]
                    user.setClient(self)
                else:
                    user = User(userId, self)
                    userIdMainMap[userId] = user
                user.clockDiff = clockDiff
                print "Clock Difference set as:", clockDiff, "for userId:", userId
                responseMap[USER_ID] = user.id
                responseMap[REQUEST_TYPE] = R_CLOCK_DIFF
                responseMap[CLOCK_DIFF] = clockDiff
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
                        responseMap[RESPONSE_TYPE] = CONCERT_TAKEN
                        responseMap[USER_ID] = user.id
                        responseMap[CONCERT_TAG] = concertTag
                        responseMap[VIDEO_URL] = concertTagHashMap[concertTag].videoUrl
                        responseMap[VIDEO_STATE] = videoState
                        responseMap[TAB_ID] = tabId
                        responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                        responseMap[OWNER_FLAG] = False
                        self.sendingWrapper(responseMap)
                    else:
                        # Either he was successful in creating the group or he was the master himself (cool cool).

                        user.updateConcertTag(concertTag)
                        user.updateTabId(tabId)

                        responseMap[USER_ID] = userId
                        responseMap[CONCERT_TAG] = concertTag
                        responseMap[TAB_ID] = user.getTabId()
                        responseMap[OWNER_FLAG] = True
                        responseMap[VIDEO_STATE] = concertTagHashMap[concertTag].getVideoState()
                        responseMap[VOFFSET] = concertTagHashMap[concertTag].getVideoOffset()
                        responseMap[VIDEO_URL] = concertTagHashMap[concertTag].videoUrl
                        responseMap[RESPONSE_TYPE] = CONCERT_CREATED
                        responseMap[REQUEST_TYPE] = R_PAGE_LOADED
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
                            responseMap[TAB_ID] = tabId
                            responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                            responseMap[RESPONSE_TYPE] = I_AM_ALREADY_OWNER
                            responseMap[OWNER_FLAG] = True
                            self.sendingWrapper(responseMap)
                        else:
                            # ideal case - concert join.
                            concertToJoin.users.add(userId)
                            user.updateConcertTag(concertTag)
                            user.updateTabId(tabId)

                            responseMap[USER_ID] = user.id
                            responseMap[CONCERT_TAG] = concertTag
                            responseMap[VIDEO_URL] = concertToJoin.videoUrl
                            responseMap[TAB_ID] = user.getTabId()
                            responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                            responseMap[RESPONSE_TYPE] = CONCERT_JOINED
                            responseMap[VIDEO_STATE] = concertToJoin.getVideoState()
                            responseMap[VOFFSET] = concertToJoin.getVideoOffset()
                            responseMap[CLIENT_TIMESTAMP] = concertToJoin.getUpdatedVOffsetTime() + user.clockDiff
                            responseMap[OWNER_FLAG] = False
                            self.sendingWrapper(responseMap)
                    else:
                        # no concert found.
                        responseMap[USER_ID] = user.id
                        responseMap[TAB_ID] = tabId
                        responseMap[REQUEST_TYPE] = R_PAGE_LOADED
                        responseMap[RESPONSE_TYPE] = NO_CONCERT
                        responseMap[OWNER_FLAG] = False
                        self.sendingWrapper(responseMap)

            elif requestType == R_VIDEO_UPDATE:
                user = userIdMainMap[userId]
                user.setClient(self)
                if globalCurrentClientVersion is not None:
                    responseMap[CLIENT_VERSION] = globalCurrentClientVersion

                if ownerFlag:
                    if concertTag in concertTagHashMap and videoUrl is not None:
                        if concertTagHashMap[concertTag].ownerId == userId:
                            # BROADCAST
                            print "vOffset:", vOffset
                            print "videoState:", videoState
                            if vOffset is not None and videoState is not None and clientTimeStamp is not None:
                                concertTagHashMap[concertTag].syncVideoAttributes(vOffset, videoState, clientTimeStamp, videoUrl)

                            responseMap[VOFFSET] = vOffset if vOffset is not None else None
                            responseMap[CONCERT_TAG] = concertTag
                            responseMap[VIDEO_STATE] = videoState
                            responseMap[VIDEO_URL] = videoUrl
                            responseMap[REQUEST_TYPE] = R_VIDEO_UPDATE
                            concertTagHashMap[concertTag].concertRelay(responseMap)
                        else:
                            print "Sender is not owner"
                else:
                    # Joinee asks for explicit syncing (video info update)
                    if concertTag in concertTagHashMap:

                        concertToJoin = concertTagHashMap.get(concertTag)

                        responseMap[USER_ID] = user.id
                        responseMap[CONCERT_TAG] = concertTag
                        responseMap[VIDEO_URL] = concertToJoin.videoUrl
                        responseMap[TAB_ID] = tabId
                        responseMap[REQUEST_TYPE] = R_VIDEO_UPDATE
                        responseMap[VIDEO_STATE] = concertToJoin.getVideoState()
                        responseMap[VOFFSET] = concertToJoin.getVideoOffset()
                        responseMap[CLIENT_TIMESTAMP] = concertToJoin.getUpdatedVOffsetTime() + user.clockDiff
                        responseMap[OWNER_FLAG] = False
                        self.sendingWrapper(responseMap)
        except Exception, err:
            print err

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
