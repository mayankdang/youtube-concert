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

# Request Types
R_CREATE_USER = 0
R_HANDSHAKING = 1
R_NETWORK_DELAY = 2
R_VIDEO_UPDATE = 3
R_USER_ONLINE = 4


current_milli_time = lambda: int(round(time.time() * 1000))

userIdMainMap = {}
concertTagHashMap = {}

SHARING_CODE_LENGTH = 3

class Concert(object):
    def __init__(self, userId, concertTag, videoUrl=None):
        self.concertTag = concertTag
        self.ownerId = userId
        self.users = [userId]
        self.concertSize = 0  # unused - remove after checking.
        self.videoUrl = videoUrl
        self.createdAt = current_milli_time()
        self.updatedAt = current_milli_time()
        self.videoState = None

    def concertRelay(self, responseMap):
        ownerDelay = userIdMainMap[self.ownerId].networkDelay
        responseMap[OWNER_FLAG] = False
        responseMap[OWNER_DELAY] = ownerDelay
        for tempUserId in self.users:
            if tempUserId != self.ownerId:
                try:
                    userIdMainMap[tempUserId].client.sendingWrapper(responseMap)
                except Exception, e:
                    print "Exception: ", e

class User(object):
    def __init__(self, userId, client):
        self.id = userId
        self.concertTag = None
        self.networkDelay = 15  # default
        self.recentTime = -1
        self.client = client
        self.createdAt = current_milli_time()
        self.updatedAt = current_milli_time()

    def getCurrentTime(self):
        return int(round(time.time() * 1000))

    def updateRecentTime(self):
        self.recentTime = self.getCurrentTime()

    def setNetworkDelay(self, delay):
        self.networkDelay = delay
        print "set network delay as", delay

    def createConcert(self, concertTag, videoUrl):
        if self.concertTag is None or concertTag not in concertTagHashMap:
            print "1. concertTag is None? ", self.concertTag is None
            print "2. concertTagHashMap =", concertTagHashMap
            print "3. concertTag not in concertTagHashMap", self.concertTag not in concertTagHashMap
            newConcert = Concert(self.id, concertTag, videoUrl)
            self.concertTag = newConcert.concertTag
            concertTagHashMap[newConcert.concertTag] = newConcert
            print "4. Latest concertTagHashMap =", concertTagHashMap
            return True
        else:
            print "The concert -", self.concertTag, " is already underway. Please use different concert name "
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

            elif requestType == R_VIDEO_UPDATE:

                firstTimeUsersConcert = False
                owner = False
                if ownerFlag:
                    if concertTag in concertTagHashMap:
                        if concertTagHashMap[concertTag].ownerId == userId:
                            owner = True
                        else:
                            print "chutiya bana raha hai"
                    else:
                        firstTimeUsersConcert = True
                        # TODO: naya concert banana chah ra hai launda

                user = userIdMainMap[userId]
                current_user_concert=None

                current_user_concert = userIdMainMap[userId].concertTag == concertTag

                # BROADCAST
                if owner and current_user_concert:
                    responseMap[VOFFSET] = vOffset if vOffset else None
                    responseMap[VIDEO_STATE] =videoState
                    responseMap[VIDEO_URL] = videoUrl
                    responseMap[REQUEST_TYPE] = R_VIDEO_UPDATE
                    concertTagHashMap[concertTag].concertRelay(responseMap)

                # CREATE CONCERT
                elif owner or firstTimeUsersConcert:
                    success = userIdMainMap[userId].createConcert(concertTag, videoUrl)
                    # TODO: HOW TO TELL OWNER IF CONCERT WAS SUCCESSFULLY CREATED OR NOT?
                    if not success:
                        self.sendingWrapper(u'CONCERT_ALREADY_UNDERWAY')
                    else:
                        responseMap[USER_ID] = user.id
                        responseMap[CONCERT_TAG] = concertTag
                        responseMap[VIDEO_URL] = videoUrl
                        responseMap[VIDEO_STATE] = videoState
                        responseMap[REQUEST_TYPE] = R_VIDEO_UPDATE
                        responseMap[OWNER_FLAG] = True
                        responseMap[RESPONSE_TYPE] = CONCERT_CREATED
                        self.sendingWrapper(responseMap)

                # JOIN CONCERT
                else:
                    concertToJoin = concertTagHashMap[concertTag]
                    concertToJoin.users.append(userId)
                    userIdMainMap[userId].concertTag = concertTag


                    responseMap[USER_ID] = user.id
                    responseMap[CONCERT_TAG] = concertTag
                    responseMap[VIDEO_URL] = concertToJoin.videoUrl
                    responseMap[VIDEO_STATE] = concertToJoin.videoState
                    responseMap[REQUEST_TYPE] = R_VIDEO_UPDATE
                    responseMap[RESPONSE_TYPE] = CONCERT_JOINED
                    ownerDelay = userIdMainMap[concertToJoin.ownerId].networkDelay
                    responseMap[OWNER_FLAG] = False
                    responseMap[OWNER_DELAY] = ownerDelay
                    self.sendingWrapper(responseMap)

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

def getH(hash, key):
    if key in hash:
        return hash[key]
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
