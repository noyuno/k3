#!/bin/bash

set -e

export DATA_PATH=${DATA_PATH:-/data/}
CRON_SCHEDULE=${CRON_SCHEDULE:-0 1 * * *}

if [ ! "$AWS_ACCESS_KEY_ID" -o ! "$AWS_SECRET_ACCESS_KEY" -o ! "$AWS_REGION" -o ! "${S3_PATH}" ]; then
    echo "Required environment variable not set. It requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_PATH" >&2
    exit 1
fi

mkdir -p ~/.aws
cat << EOF >~/.aws/credentials
[default]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
EOF

cat << EOF >~/.aws/config
[default]
region=$AWS_REGION
EOF

if [[ "$1" == 'no-cron' ]]; then
    exec $BASEDIR/sync.sh
elif [[ "$1" == 'get' ]]; then
    exec $BASEDIR/get.sh
elif [[ "$1" == 'delete' ]]; then
    exec /usr/local/bin/s3cmd del -r "$S3_PATH"
else
    LOGFIFO='/var/log/cron.fifo'
    if [[ ! -e "$LOGFIFO" ]]; then
        mkfifo "$LOGFIFO"
    fi
    CRON_ENV="PARAMS='$PARAMS'"
    CRON_ENV="$CRON_ENV\nDATA_PATH='$DATA_PATH'"
    CRON_ENV="$CRON_ENV\nS3_PATH='$S3_PATH'"
    echo -e "$CRON_ENV\n$CRON_SCHEDULE $BASEDIR/sync.sh > $LOGFIFO 2>&1" | crontab -
    crontab -l
    crond
    tail -f "$LOGFIFO" | tee $LOGDIR/$(date +'%Y%m%d-%H%M')
fi
