#!/bin/bash
(cd $1; git pull)
(cd $1; git checkout origin/Production)
(cd $1; python kango-framework-latest/kango.py build extension)
