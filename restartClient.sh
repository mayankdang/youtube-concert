#!/bin/bash
(cd $1; git reset --hard)
(cd $1; git pull origin Production)
(cd $1; git checkout origin/Production)
(cd $1; python kango-framework-latest/kango.py build extension)
