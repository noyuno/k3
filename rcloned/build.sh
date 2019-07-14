#!/bin/sh
set -ex
apk update
apk add --no-cache --virtual .persistent-deps bash curl monit ca-certificates
apk add --no-cache --virtual .build-deps $BUILD_DEPS
cd /tmp 
name=rclone-v${RCLONE_VERSION}-linux-${RCLONE_TYPE}.zip
if [ "$RCLONE_VERSION" = "current" ]; then
    name=rclone-${RCLONE_VERSION}-linux-${RCLONE_TYPE}.zip
fi
wget -q "http://downloads.rclone.org/$name"
unzip "/tmp/$name"
mv /tmp/rclone-*-linux-${RCLONE_TYPE}/rclone /usr/bin
addgroup -g 1000 rclone
adduser -SDH -u 1000 -s /bin/false rclone -G rclone
sed -i 's/#user_allow_other/user_allow_other/' /etc/fuse.conf
mkdir -p /config /defaults /data
rm -Rf /tmp/*
rm -rf /var/cache/apk/*
apk del .build-deps

