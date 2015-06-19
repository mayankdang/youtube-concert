#!/bin/bash

process_pid() {
        echo `ps ax | grep example | grep python | cut -d' ' -f1`
}
pid=$(process_pid)
sudo kill -9 $pid

nohup `sudo python ~/echo/simpleWebSocketServer/SimpleExampleServer.py --example chat` &