import json
import signal, sys, ssl
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer, SimpleSSLWebSocketServer
from optparse import OptionParser
import string


class SimpleEcho(WebSocket):

    def handleMessage(self):
        self.sendMessage(self.data)

    def handleConnected(self):
        pass

    def handleClose(self):
        pass

clients = []

userIdMainMap = {}

class Group(object):
    def __init__(self):
        self.groupId = self.id_generator(10)
        self.users = {}
        self.maxNetworkDelayOfUsers = 100

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
        self.concertId = 0
        self.client = client
    def getCurrentTime(self):
        return int(round(time.time() * 1000))
    def updateRecentTime(self):
        self.recentTime = self.getCurrentTime()
    def setNetworkDelay(self, delay):
        self.networkDelay = delay
        print "set network delay as", delay

class SimpleChat(WebSocket):

    def handleMessage(self):
        message=json.loads(self.data)
        msg = message["message"]
        userId = message["id"]

        if msg.startswith("HELLO_BUDDY"):
            self.sendMessage('HEY_BUDDY:'+msg.split(":")[1])

        if msg.startswith("NETWORK_DELAY"):
            delay = msg.split(":")[1]
            print "Handshaking done", delay, "Sending confirmation to client."
            self.sendMessage("HANDSHAKING_DONE:"+msg.split(":")[1])
            if userIdMainMap.get(userId, -1) == (-1):
                userIdMainMap[userId] = User(userId, self)
                # print "putting in map"
            userIdMainMap[userId].setNetworkDelay(delay)
            # userIdMainMap[userId].client.sendMessage(u'client wala send message')

        else:
            for client in list(clients):
                if client != self:
                    client.sendMessage(self.address[0] + ' - ' + message)

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
