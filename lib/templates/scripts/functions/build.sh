#!/bin/bash
build(){
  #Change directories
  local CURRENT=$PWD
  local BD=$GVDIR/$BUILD_DIR
  
  cd $BD

  if [ ! -z $BUILD_COMMAND ]
    then
    $BUILD_COMMAND
  else
    run_composer
  fi

  cd $CURRENT
}