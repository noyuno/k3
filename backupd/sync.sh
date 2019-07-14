#!/bin/bash

message () {
    echo "$1"
    curl -XPOST -sd '{"message": "'$NAME': '"$1"'"}' http://discordbot >/dev/null
    if [ $? -ne 0 ]; then
        echo "$NAME: failed to send message to discordbot"
    fi
}

d=$(date +'%Y%m%d-%H%M')
echo "Job started: $d"
OLDIFS=$IFS
IFS=,
for e in "${EXCLUDES}" ; do
    echo "$e" >> /tmp/excludes     
done
IFS=$OLDIFS
echo "Excludes list:"
cat /tmp/excludes

pushd $(dirname $DATA_PATH) >/dev/null
f=$d.tar.gz
tar -X /tmp/excludes -cpzf $f "$(basename $DATA_PATH)"
ret=$?
if [ $ret -ne 0 ]; then
    message ":red_circle: error, tar returned $ret"
    exit $ret
fi
ls -alhF $f
aws s3 cp $PARAMS $f "$S3_PATH"
ret=$?
if [ $ret -ne 0 ]; then
    message ":red_circle: error, aws returned $ret"
    exit $ret
fi
rm -f $f
popd >/dev/null
message ":white_check_mark: finished at $(date +'%Y%m%d-%H%M')"
