#!/bin/bash
git pull
git checkout origin/Production
python kango-framework-latest/kango.py build extension
