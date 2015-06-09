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
VIDEO_ID = "videoId"
VOFFSET = "vOffset"
VIDEO_STATE = "videoState"
OWNER_FLAG = "ownerFlag"
VIDEO_TIME = "videoTime"
CLIENT_TIMESTAMP = "clientTimeStamp"
REQUEST_TYPE = "requestType"

# Request Types
CREATE_USER = 0
HANDSHAKING = 1
VIDEO_UPDATE = 2



clients = []
userIdMainMap = {}
groupTagHashMap = {}

SHARING_CODE_LENGTH = 3

def idGenerator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in xrange(size))

class Group(object):
    def __init__(self, userId, groupTag, videoUrl=None):
        self.groupTag = groupTag
        self.ownerId = userId
        self.users = [userId]
        self.groupSize = 0  # unused - remove after checking.
        self.maxNetworkDelayOfUsers = 100
        self.videoUrl = videoUrl

    def setMaxNetworkDelayOfUsers(self):
        maxDelay = 0
        for key, value in self.users.iteritems():
            maxDelay = max(maxDelay, value.networkDelay)
        self.maxNetworkDelayOfUsers = maxDelay

class User(object):
    def __init__(self, userId, client):
        self.userId = userId
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
            print "1", self.groupTag is None
            print "2", groupTagHashMap
            print "3", self.groupTag not in groupTagHashMap
            newGroup = Group(self.userId, groupTag, videoUrl)
            groupTagHashMap[groupTag] = None
            self.groupTag = newGroup.groupTag
            groupTagHashMap[newGroup.groupTag] = newGroup
            print groupTagHashMap
            return True
        else:
            print "The concert -", self.groupTag, " is already underway. Please use different concert name "
        return False


class SimpleChat(WebSocket):
    def handleMessage(self):

        responseMap = {
        USER_ID:None,
        CONCERT_TAG:None,
        VIDEO_ID:None,
        VOFFSET:None,
        VIDEO_STATE:None,
        OWNER_FLAG:None,
        VIDEO_TIME:None # represents the time video started on owner acc to Server.
          }

        try:
            message = json.loads(self.data)

            userId = message[USER_ID] 
            concertTag = message[CONCERT_TAG]
            videoId = message[VIDEO_ID]
            vOffset = message[VOFFSET]
            videoState = message[VIDEO_STATE]
            ownerFlag = message[OWNER_FLAG]
            videoTime = message[VIDEO_TIME]
            clientTimeStamp = message[CLIENT_TIMESTAMP]
            requestType = message[REQUEST_TYPE]


            if msg.startswith("HELLO_BUDDY"):
                self.sendMessage('HEY_BUDDY:' + msg.split(":")[1])

            elif msg.startswith("NETWORK_DELAY"):
                delay = msg.split(":")[1]
                print "Handshaking done", delay, "Sending confirmation to client."
                self.sendMessage(u"HANDSHAKING_DONE:" + msg.split(":")[1])
                if userIdMainMap.get(userId) is None:
                    userIdMainMap[userId] = User(userId, self)
                    # print "putting in map"
                userIdMainMap[userId].setNetworkDelay(delay)
                # userIdMainMap[userId].client.sendMessage(u'client wala send message')

            elif msg.startswith("CHANGE_VIDEO_ID"):
                video_url = msg.split(":")[1]
                print "video_url change request:", video_url
                groupTempTag = userIdMainMap[userId].groupTag
                if groupTempTag is not None and groupTagHashMap[groupTempTag].ownerId == userId:
                    group = groupTagHashMap.get(groupTempTag)
                    group.videoUrl = video_url
                    for userId in group.users:
                        userIdMainMap[userId].client.sendMessage(u'CHANGED_VIDEO_ID:' + video_url + ":" + groupTempTag)
                        print "changed videoId for user", userId

            elif msg.startswith("CREATE_CONCERT"):
                videoId = msg.split(":")[1]
                print "videoId:", videoId
                groupTag = msg.split(":")[2]
                print "groupTag:", groupTag

                if groupTag is not None and userIdMainMap[userId].groupTag == groupTag and groupTagHashMap[groupTag].ownerId == userId:
                    group = groupTagHashMap.get(groupTag)
                    group.videoUrl = videoId
                    for tempUserId in group.users:
                        userIdMainMap[tempUserId].client.sendMessage(u'CHANGED_VIDEO_ID:' + videoId + ":" + groupTag)
                        print "changed videoId for user", tempUserId
                else:
					success = userIdMainMap[userId].createConcert(groupTag, videoId)
					if not success:
						self.sendMessage(u'CONCERT_ALREADY_UNDERWAY')
					else:
						self.sendMessage(u'GROUP_CREATED:' + userIdMainMap[userId].groupTag)
                pass

            elif msg.startswith("END_CONCERT"):
                pass

            elif msg.startswith("JOIN_CONCERT"):
                groupTag = msg.split(":")[1]
                group = groupTagHashMap.get(groupTag)
                # if userId in groupTagHashMap[userIdMainMap[userId].groupTag].users:
                # groupTagHashMap[userIdMainMap[userId].groupTag].users.remove(userId)
                group.users.append(userId)
                userIdMainMap[userId].client.sendMessage(u'CHANGED_VIDEO_ID:' + group.videoUrl + ":" + groupTag)
                # for group_user_id in group.users:
                #     print "group.users", group.users
                #     userIdMainMap[group_user_id].client.sendMessage(u'NEW_USER_JOINED:'+str(userId)+':'+groupTag)
                #     print "added new user" + userId, "--------------"
                print ".............."


            elif msg.startswith("LEAVE_CONCERT"):
                pass

            elif msg.startswith("EVENT_START_IN_5_SEC"):
                try:
                    print "----------in try of event_start_in_5_sec------"
                    group = groupTagHashMap.get(userIdMainMap[userId].groupTag)
                    print "group:", group
                    for userId in group.users:
                        print "userId:", userId
                        try:
                            userIdMainMap[userId].client.sendMessage(u'CONCERT_START_IN_5_SEC:' + group.videoUrl)
                        except Exception, esss:
                            print esss

                except Exception, essss:
                    print essss
                pass

            elif msg.startswith("REGISTER_USER"):
                userId = idGenerator(20)
                self.sendMessage(u"USER_REGISTERED:" + userId)
                print "New user registered:", userId
                pass

            elif msg.startswith("USER_ONLINE"):
                pass

            else:
                for client in list(clients):
                    if client != self:
                        client.sendMessage(self.address[0] + ' - ' + msg)

        except Exception, e:
            print e


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
