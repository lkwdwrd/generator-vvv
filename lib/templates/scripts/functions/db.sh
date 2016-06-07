#!/bin/bash

# Create a database.
db_create(){
  mysql -u root --password=root -e "CREATE DATABASE IF NOT EXISTS $WPCONST_DB_NAME"
  mysql -u root --password=root -e "GRANT ALL PRIVILEGES ON $WPCONST_DB_NAME.* TO $WPCONST_DB_USER@localhost IDENTIFIED BY '$WPCONST_DB_PASSWORD';"
}

# Import the first found SQL dump and update domains as needed.
db_import(){
  #Find the first available SQL file in the config/data directory.
  FIRST_SQL=$(ls $GVDIR/config/data | grep -i -E '\.sql(.gz)?$' | head -1)
  #If we didn't find an SQL file, don't do anything
  if [[ ! -z "$FIRST_SQL" ]] && [[ -f $GVDIR/config/data/$FIRST_SQL ]]
    then
    echo "Importing $FIRST_SQL for $SITE_TITLE."
    if [[ $FIRST_SQL =~ \.gz$ ]]
      then
      #Deal with gzipped sql files.
      gunzip < $GVDIR/config/data/$FIRST_SQL | wp --allow-root db import -
    else
      #Deal with normal sql files.
      wp --allow-root db import $GVDIR/config/data/$FIRST_SQL
    fi
    mv $GVDIR/config/data/$FIRST_SQL config/data/$FIRST_SQL.imported
    #Update domains if needed.
    if [ $GVREMOTEURL ] && [ $WPCONST_MULTISITE ] && [ ! "$SUPPRESS_URL_CONVERSION" == "true" ]
      then
      echo "Updating all $SITE_TITLE domains..."
      wp --allow-root --network --url="$GVREMOTEURL" search-replace "$GVREMOTEURL" "$GVLOCALURL" --skip-columns=guid
    elif [ $GVREMOTEURL ] && [ ! "$SUPPRESS_URL_CONVERSION" == "true" ]
      then
      echo "Updating $SITE_TITLE domains..."
      wp --allow-root search-replace "$GVREMOTEURL" "$GVLOCALURL" --skip-columns=guid
    fi
  fi
}

# Back up and gzip the current site's database.
db_bak(){
  local BACKUP_FILE="$GVDIR/config/data/$WPCONST_DB_NAME"
  local BACKUP_EXT=".sql.gz"
  if [[ -e "$BACKUP_FILE$BACKUP_EXT" ]] ; then
    local i=1
    while [[ -e "$BACKUP_FILE-$i$BACKUP_EXT" ]] ; do
      let i++
    done
    BACKUP_FILE="$BACKUP_FILE-$i"
  fi
  wp --allow-root db export --add-drop-table - | gzip > "$BACKUP_FILE$BACKUP_EXT"
  echo "Backup Created."
}

# Remove this site's database entirely.
rm_db(){
  echo "Removing database $WPCONST_DB_NAME."
  wp --allow-root db drop --yes
}
