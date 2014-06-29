#The Data Directory

Place any .sql files here and they will be imported the next time the project is provisioned. If your project has been configured for it, then prior to importing a find and replace will be performed on your database to migrate to your domain.

After importing, your .sql file will be renamed with a .imported extension. This will prevent it from being re-imported next time you run `vagrant provision` or `grunt provision`. If you would like to re-import, simply remove the .imported extension. To import a new data set, just drop the new .sql file into this folder. Note that the new data will completely replace the old data.