#!/bin/bash

# ShellCheck test script — intentionally contains common shell script issues

# Issue 1: Unquoted variables — word splitting and globbing
DEPLOY_DIR=/var/www/$APP_NAME
echo "Deploying to $DEPLOY_DIR"
cd $DEPLOY_DIR
rm -rf $DEPLOY_DIR/old/*

# Issue 2: Using backticks instead of $()
CURRENT_DATE=`date +%Y-%m-%d`
GIT_HASH=`git rev-parse HEAD`

# Issue 3: Not checking command exit status
cp -r dist/* $DEPLOY_DIR/
chmod -R 755 $DEPLOY_DIR

# Issue 4: Unsafe pipe — pipefail not set
cat /var/log/app.log | grep ERROR | wc -l

# Issue 5: Using [ ] instead of [[ ]] for string comparison
if [ $ENV = "production" ]; then
    echo "Production deployment"
fi

# Issue 6: Unused variables
BACKUP_DIR="/var/backups"
MAX_RETRIES=3
TIMEOUT=30

# Issue 7: Using echo with user-controlled input (potential injection)
echo "Deploying version: $1"
eval "echo $1"

# Issue 8: Not using set -e or set -u
for file in $DEPLOY_DIR/*.js
do
    echo Processing $file
    # Issue 9: Cat piped into while read
    cat $file | while read line
    do
        echo $line >> /tmp/output.log
    done
done

# Issue 10: Using ls in scripts
COUNT=$(ls $DEPLOY_DIR | wc -l)
echo "Total files: $COUNT"

# Issue 11: Double-quoting issues
if [ "$?" -ne "0" ]; then
    echo Deployment failed!
    exit 1
fi

echo "Deploy complete at $CURRENT_DATE with hash $GIT_HASH"
