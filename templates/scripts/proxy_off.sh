#!/bin/bash

if [[ ! -f config/proxy.conf.disabled ]]
	then
	mv config/proxy.conf config/proxy.conf.disabled
	touch config/proxy.conf
	sudo service nginx restart
else
	echo "Appears to be off already!"
fi
