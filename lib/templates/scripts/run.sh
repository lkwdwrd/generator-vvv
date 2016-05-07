#!/bin/bash

#resolve script dirs
resolve_path(){
  local SOURCE="$1"
  local DIR=""
  while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    # if $SOURCE was a relative symlink, we need to resolve it relative to the path
    # where the symlink file was located
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

#Set up the environment for this site.
source $( resolve_path ${BASH_SOURCE[0]} )/gv-env.sh

#Run a function in context of this site
$1
