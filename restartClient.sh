#!/bin/bash
(cd $1; git reset --hard)
(cd $1; git pull origin stage)
(cd $1; git checkout origin/stage)
(cd $1;sudo python kango-framework-latest/kango.py build extension)
