#!/bin/bash
(cd $1; git reset --hard)
(cd $1; git pull origin live)
(cd $1; git checkout origin/live)
process_pid() {
        echo `ps ax | grep example | grep python | cut -d' ' -f1`
}
pid=$(process_pid)
sudo kill -9 $pid
echo $pid
(cd $1; nohup `sudo python simpleWebSocketServer/SimpleExampleServer.py --example chat` &)