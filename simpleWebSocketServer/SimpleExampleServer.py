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
VIDEO_TIME = "videoTime"
CLIENT_TIMESTAMP = "clientTimeStamp"
REQUEST_TYPE = "requestType"
ACK = "ack"                             # status acknowledgement for request successfully received.
NETWORK_DELAY = "networkDelay"
OWNER_DELAY = "ownerDelay"
GROUP_CREATED = "groupCreated"
RESPONSE_TYPE = "responseType"

# Request Types
R_CREATE_USER = 0
R_HANDSHAKING = 1
R_NETWORK_DELAY = 2
R_VIDEO_UPDATE = 3
R_USER_ONLINE = 4

# VIDEO STATES




clients = []
userIdMainMap = {}
groupTagHashMap = {}

SHARING_CODE_LENGTH = 3

class Group(object):
    def __init__(self, userId, groupTag, videoUrl=None):
        self.groupTag = groupTag
        self.ownerId = userId
        self.users = [userId]
        self.groupSize = 0  # unused - remove after checking.
        self.videoUrl = videoUrl
        

    def groupRelay(self, responseMap):
        ownerDelay = userIdMainMap[self.ownerId].networkDelay
        responseMap[OWNER_FLAG] = False
        responseMap[OWNER_DELAY] = ownerDelay
        for tempUserId in self.users:
			if tempUserId != self.ownerId:
				userIdMainMap[tempUserId].client.sendingWrapper(responseMap)

class User(object):
    def __init__(self, userId, client):
        self.id = userId
        self.concertTag = None
        self.networkDelay = 15  # default
        self.recentTime = -1
        self.client = client
        self.groupTag = None

    def getCurrentTime(self):
        return int(round(time.time() * 1000))

    def updateRecentTime(self):
        self.recentTime = self.getCurrentTime()

    def setNetworkDelay(self, delay):
        self.networkDelay = delay
        print "set network delay as", delay

    def createConcert(self, groupTag, videoUrl):
        if self.groupTag is None or groupTag not in groupTagHashMap:
            print "1. groupTag is None? ", self.groupTag is None
            print "2. groupTagHashMap =", groupTagHashMap
            print "3. groupTag not in groupTagHashMap", self.groupTag not in groupTagHashMap
            newGroup = Group(self.id, groupTag, videoUrl)
            self.groupTag = newGroup.groupTag
            groupTagHashMap[newGroup.groupTag] = newGroup
            print "4. Latest groupTagHashMap =", groupTagHashMap
            return True
        else:
            print "The concert -", self.groupTag, " is already underway. Please use different concert name "
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
            VIDEO_TIME: None,           # represents the time video started on owner acc to Server.
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
            videoTime = getH(message, VIDEO_TIME)
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
                owner = False
                user = userIdMainMap[userId]
                current_user_group=None
                
                if user.groupTag:
					current_user_group = groupTagHashMap[user.groupTag]
                if current_user_group:
                    if current_user_group.ownerId == userId:
                        if videoUrl != current_user_group.videoUrl:
                            current_user_group.videoUrl = videoId
                            # TODO: CREATE RESPONSE MAP
                            # TODO: owner's shit
                            current_user_group.groupRelay(responseMap)
                        else:
                            pass
                            # TODO: HANDLE Cases for same video actions by owner.
                            # TODO: TIMING SYNCS, BUFFERING SYNCS etc.

                    else:
                        pass
                        # JOINEE ko machane do, hum kuchh ni kar re, katwa lia usne apna.
                else:
                    success = userIdMainMap[userId].createConcert(concertTag, videoUrl)
                    # TODO: HOW TO TELL OWNER IF GROUP WAS SUCCESSFULLY CREATED OR NOT?
                    if not success:
                        self.sendingWrapper(u'CONCERT_ALREADY_UNDERWAY')
                    else:
						responseMap[USER_ID] = user.id
						responseMap[CONCERT_TAG] = concertTag
						responseMap[VIDEO_URL] = videoUrl
						responseMap[VIDEO_STATE] = videoState		
						responseMap[REQUEST_TYPE] = R_VIDEO_UPDATE						
						responseMap[OWNER_FLAG] = True
						responseMap[RESPONSE_TYPE] = GROUP_CREATED
						self.sendingWrapper(responseMap)
						

        #     msg = ""
        #     if msg.startswith("HELLO_BUDDY"):
        #         self.sendMessage('HEY_BUDDY:' + msg.split(":")[1])
        #
        #     elif msg.startswith("NETWORK_DELAY"):
        #         delay = msg.split(":")[1]
        #         print "Handshaking done", delay, "Sending confirmation to client."
        #         self.sendMessage(u"HANDSHAKING_DONE:" + msg.split(":")[1])
        #         if userIdMainMap.get(userId) is None:
        #             userIdMainMap[userId] = User(userId, self)
        #             # print "putting in map"
        #         userIdMainMap[userId].setNetworkDelay(delay)
        #         # userIdMainMap[userId].client.sendMessage(u'client wala send message')
        #
        #     elif msg.startswith("CHANGE_VIDEO_ID"):
        #         video_url = msg.split(":")[1]
        #         print "video_url change request:", video_url
        #         groupTempTag = userIdMainMap[userId].groupTag
        #         if groupTempTag is not None and groupTagHashMap[groupTempTag].ownerId == userId:
        #             group = groupTagHashMap.get(groupTempTag)
        #             group.videoUrl = video_url
        #             for userId in group.users:
        #                 userIdMainMap[userId].client.sendMessage(u'CHANGED_VIDEO_ID:' + video_url + ":" + groupTempTag)
        #                 print "changed videoId for user", userId
        #
        #     elif msg.startswith("CREATE_CONCERT"):
        #         videoId = msg.split(":")[1]
        #         print "videoId:", videoId
        #         groupTag = msg.split(":")[2]
        #         print "groupTag:", groupTag
        #
        #         if groupTag is not None and userIdMainMap[userId].groupTag == groupTag and groupTagHashMap[groupTag].ownerId == userId:
        #             group = groupTagHashMap.get(groupTag)
        #             group.videoUrl = videoId
        #             for tempUserId in group.users:
        #                 userIdMainMap[tempUserId].client.sendMessage(u'CHANGED_VIDEO_ID:' + videoId + ":" + groupTag)
        #                 print "changed videoId for user", tempUserId
        #         else:
        #             success = userIdMainMap[userId].createConcert(groupTag, videoId)
        #             if not success:
        #                 self.sendMessage(u'CONCERT_ALREADY_UNDERWAY')
        #             else:
        #                 self.sendMessage(u'GROUP_CREATED:' + userIdMainMap[userId].groupTag)
        #         pass
        #
        #     elif msg.startswith("END_CONCERT"):
        #         pass
        #
        #     elif msg.startswith("JOIN_CONCERT"):
        #         groupTag = msg.split(":")[1]
        #         group = groupTagHashMap.get(groupTag)
        #         # if userId in groupTagHashMap[userIdMainMap[userId].groupTag].users:
        #         # groupTagHashMap[userIdMainMap[userId].groupTag].users.remove(userId)
        #         group.users.append(userId)
        #         userIdMainMap[userId].client.sendMessage(u'CHANGED_VIDEO_ID:' + group.videoUrl + ":" + groupTag)
        #         # for group_user_id in group.users:
        #         #     print "group.users", group.users
        #         #     userIdMainMap[group_user_id].client.sendMessage(u'NEW_USER_JOINED:'+str(userId)+':'+groupTag)
        #         #     print "added new user" + userId, "--------------"
        #         print ".............."
        #
        #
        #     elif msg.startswith("LEAVE_CONCERT"):
        #         pass
        #
        #     elif msg.startswith("EVENT_START_IN_5_SEC"):
        #         try:
        #             print "----------in try of event_start_in_5_sec------"
        #             group = groupTagHashMap.get(userIdMainMap[userId].groupTag)
        #             print "group:", group
        #             for userId in group.users:
        #                 print "userId:", userId
        #                 try:
        #                     userIdMainMap[userId].client.sendMessage(u'CONCERT_START_IN_5_SEC:' + group.videoUrl)
        #                 except Exception, esss:
        #                     print esss
        #
        #         except Exception, essss:
        #             print essss
        #         pass
        #
        #     elif msg.startswith("REGISTER_USER"):
        #         userId = idGenerator(20)
        #         self.sendMessage(u"USER_REGISTERED:" + userId)
        #         print "New user registered:", userId
        #         pass
        #
        #     elif msg.startswith("USER_ONLINE"):
        #         pass
        #
        #     else:
        #         for client in list(clients):
        #             if client != self:
        #                 client.sendMessage(self.address[0] + ' - ' + msg)
        #
        except Exception, e:
            print e

    def sendingWrapper(self, responseMap):
		print "responseMap",responseMap
		self.sendMessage(u"" + json.dumps(responseMap))

    def handleConnected(self):
        print self.address, 'connected'
        for client in list(clients):
            client.sendMessage(self.address[0] + u' - connected')
        clients.append(self)

    def handleClose(self):
        clients.remove(self)
        print self.address, 'closed'
        for client in list(clients):
            client.sendMessage(self.address[0] + u' - disconnected')

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
