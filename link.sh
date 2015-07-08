#!/bin/bash

path=`pwd`
if [ -a /usr/local/lib/node_modules/prototypo.js ]
  then
    echo "link already exists deleting"
    rm /usr/local/lib/node_modules/prototypo.js
fi
ln -s $path /usr/local/lib/node_modules/prototypo.js
file /usr/local/lib/node_modules/prototypo.js
