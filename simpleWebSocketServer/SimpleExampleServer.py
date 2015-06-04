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

clients = []
userIdMainMap = {}
groupIdHashMap = {}

class Group(object):
    def __init__(self, userId, videoUrl=None):
        self.groupId = self.id_generator(10)
        self.ownerId = userId
        self.users = [userId]
        self.groupSize = 0
        self.maxNetworkDelayOfUsers = 100
        self.videoUrl = videoUrl

    def setMaxNetworkDelayOfUsers(self):
        maxDelay = 0
        for key, value in self.users.iteritems():
            maxDelay = max(maxDelay, value.networkDelay)
        self.maxNetworkDelayOfUsers = maxDelay

    def id_generator(self, size=6, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in xrange(size))

class User(object):
    def __init__(self, userId, client):
        self.userId = userId
        self.networkDelay = 15      # default
        self.recentTime = -1
        self.client = client
        self.isConnected = True
        self.groupId = None
    def getCurrentTime(self):
        return int(round(time.time() * 1000))
    def updateRecentTime(self):
        self.recentTime = self.getCurrentTime()
    def setNetworkDelay(self, delay):
        self.networkDelay = delay
        print "set network delay as", delay
    def createConcert(self, videoUrl):
        if self.groupId is None or self.groupId not in groupIdHashMap:
            newGroup = Group(self.userId, videoUrl)
            self.groupId = newGroup.groupId
            groupIdHashMap[newGroup.groupId] = newGroup
            return True
        else:
            print "The user", self.userId, "is already in group -", self.groupId
        return False

    def joinToGroup(self, groupId):
        if groupIdHashMap.get(groupId) is None:
            self.groupId = groupId

class SimpleChat(WebSocket):

    def handleMessage(self):
        try:
            message=json.loads(self.data)
            msg = message["message"]
            userId = message["id"]

            if msg.startswith("HELLO_BUDDY"):
                self.sendMessage('HEY_BUDDY:'+msg.split(":")[1])

            elif msg.startswith("NETWORK_DELAY"):
                delay = msg.split(":")[1]
                print "Handshaking done", delay, "Sending confirmation to client."
                self.sendMessage(u"HANDSHAKING_DONE:"+msg.split(":")[1])
                if userIdMainMap.get(userId) is None:
                    userIdMainMap[userId] = User(userId, self)
                    # print "putting in map"
                userIdMainMap[userId].setNetworkDelay(delay)
                # userIdMainMap[userId].client.sendMessage(u'client wala send message')

            elif msg.startswith("CHANGE_VIDEO_ID"):
                video_url = msg.split(":")[1]
                if userIdMainMap[userId].groupId is not None:
                    group = groupIdHashMap.get(userIdMainMap[userId].groupId)
                    group.videoUrl = video_url
                    for userId in group.users:
                        userIdMainMap[userId].client.sendMessage(u'CHANGED_VIDEO_ID:'+video_url)
                        print "changed videoId for user", userId

            elif msg.startswith("CREATE_CONCERT"):
                success = userIdMainMap[userId].createConcert(msg.split(":")[1])
                if not success:
                    self.sendMessage(u'YOU_ALREADY_BELONG_TO_A_GROUP')
                else:
                    self.sendMessage(u'GROUP_CREATED:'+userIdMainMap[userId].groupId)
                pass

            elif msg.startswith("END_CONCERT"):
                pass

            elif msg.startswith("JOIN_CONCERT"):
                groupId = msg.split(":")[1]
                group = groupIdHashMap.get(groupId)
                group.users.append(userId)
                userIdMainMap[userId].groupId = groupId
                userIdMainMap[userId].client.sendMessage(u'CHANGED_VIDEO_ID:'+group.videoUrl)
                for x in group.users:
                    userIdMainMap[x].client.sendMessage(u'NEW_USER_JOINED:'+userId+u':'+groupId)
                    print "added new user"+ userId

            elif msg.startswith("LEAVE_CONCERT"):
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
    parser.add_option("--cert", default='./cert.pem', type='string', action="store", dest="cert", help="cert (./cert.pem)")
    parser.add_option("--ver", default=ssl.PROTOCOL_TLSv1, type=int, action="store", dest="ver", help="ssl version")

    (options, args) = parser.parse_args()

    cls = SimpleEcho
    if options.example == 'chat':
        cls = SimpleChat

    if options.ssl == 1:
        server = SimpleSSLWebSocketServer(options.host, options.port, cls, options.cert, options.cert, version=options.ver)
    else:
        server = SimpleWebSocketServer(options.host, options.port, cls)

    def close_sig_handler(signal, frame):
        server.close()
        sys.exit()

    signal.signal(signal.SIGINT, close_sig_handler)

    server.serveforever()
