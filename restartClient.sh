#!/bin/bash
cd $1
echo $1
git pull
git checkout origin/Production
python kango-framework-latest/kango.py build extension
