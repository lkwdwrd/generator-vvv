#!/bin/bash

# Add hosts entries to the internal VMs hosts file for this site.
vhosts(){
  echo "Adding entry to the virtual machine's /etc/hosts file..."
  find $1 -maxdepth 5 -name 'vvv-hosts' | head -1 | \
  while read hostfile; do
    while IFS='' read -r line || [ -n "$line" ]; do
      if [[ "#" != ${line:0:1} ]]; then
        if [[ -z "$(grep -q "^127.0.0.1 $line$" /etc/hosts)" ]]; then
          echo "127.0.0.1 $line # vvv-auto" >> "/etc/hosts"
          echo " * Added $line from $hostfile"
        fi
      fi
    done < "$hostfile"
  done
}

# Remove a hosts entries to the internal VMs hosts file for this site.
rm_vhosts(){
  echo "Cleaning entry from the virtual machine's /etc/hosts file..."
  find $1 -maxdepth 5 -name 'vvv-hosts' | head -1 | \
  while read hostfile; do
    while IFS='' read -r line || [ -n "$line" ]; do
      if [[ "#" != ${line:0:1} ]]; then
        sed -n "/127\.0\.0\.1 $line # vvv-auto/!p" /etc/hosts > /tmp/hosts
        mv /tmp/hosts /etc/hosts
      fi
    done < "$hostfile"
  done
}
