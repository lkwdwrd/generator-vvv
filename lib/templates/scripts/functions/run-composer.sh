#!/bin/bash
run_composer(){
  #Run Composer
  if [ -f "composer.lock" ]
    then
    composer update
  elif [ -f "composer.json" ]
    then
    composer install
  else
    echo "No composer file in the directory $WD"
  fi
}