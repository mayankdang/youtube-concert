#!/bin/bash
git pull
git checkout origin/Production
process_pid() {
        echo `ps ax | grep example | grep python | cut -d' ' -f1`
}
pid=$(process_pid)
sudo kill -9 $pid

nohup `sudo python simpleWebSocketServer/SimpleExampleServer.py --example chat` &