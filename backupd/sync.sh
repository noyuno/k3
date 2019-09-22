#!/bin/bash

message () {
    echo "$1"
    curl -XPOST -sd '{"message": "'$NAME': '"$1"'"}' http://$DISCORDBOT >/dev/null
    if [ $? -ne 0 ]; then
        echo "$NAME: failed to send message to discordbot"
    fi
}

run () {
    d=$(date +'%Y%m%d-%H%M')
    echo "Job started: $d"
    echo "Excludes list:"
    echo "$EXCLUDES" | tr "," "\n" | tee /tmp/excludes

    pushd $(dirname $DATA_PATH) >/dev/null
    f=$NAME.tar.gz
    if [ "$DATETIME" ]; then
        f=$NAME-$d.tar.gz
    fi
    if [ "$COMPRESS" ]; then
        tar -X /tmp/excludes -cpzf $f "$(basename $DATA_PATH)"
        ret=$?
        if [ $ret -ne 0 ]; then
            message ":red_circle: error, tar returned $ret"
            exit $ret
        fi
        ls -alhF $f
        aws s3 cp $PARAMS $f "$S3_PATH"
        ret=$?
    else
        excludes_list=""
        while read line; do
            excludes_list="$excludes_list --exclude $line"
        done < /tmp/excludes
        aws s3 sync --delete $excludes_list "$DATA_PATH" "$S3_PATH"
        ret=$?
    fi
    if [ $ret -ne 0 ]; then
        message ":red_circle: error, aws returned $ret"
        exit $ret
    fi
    rm -f $f
    popd >/dev/null
    message ":white_check_mark: finished at $(date +'%Y%m%d-%H%M')"
}

run