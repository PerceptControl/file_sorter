#!/bin/bash

if [ -z $1 ]
then
  CONFIG_PATH=$PWD/config
else
  CONFIG_PATH=$1;
fi

if [ -z $2 ]
then
  OUTPUT=$PWD/out
else
  OUTPUT=$2;
fi

docker run -m=500m -e "DEBUG=true" -v $CONFIG_PATH:/config -v $OUTPUT:/dst perceptioncontrol/sorter