import json
import pickle

datDumpFile = "userJsonDump.dat"
jsonDumpFile = "userJsonDump.json"

########################################################################################################################


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

########################################################################################################################


dataStructure = {}

try:
    dataStructure = pickle.load(open(datDumpFile, "rb"))
except Exception, err:
    print "Exception in reading:", err

# try:
#     json.dump(dataStructure, open(jsonDumpFile, "w"))
# except Exception, err:
#     print "Exception in writing:", err

print dataStructure.keys()
for key in dataStructure.keys():
    print key, len(dataStructure.get(key).users)


########################################################################################################################