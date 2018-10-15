#!/bin/bash

# Manually run the twitter bot and log output.
nohup node bot.js >> tweets.log 2>&1 &
exit 0

