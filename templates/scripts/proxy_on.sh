#!/bin/bash

if [[ -f config/proxy.conf.disabled ]]
	then
	rm config/proxy.conf
	mv config/proxy.conf.disabled config/proxy.conf
	sudo service nginx restart
else
	echo "Appears to be on already!"
fi
