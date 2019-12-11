#!/bin/sh -e

apk add -q --no-cache --virtual deps musl-dev make gcc linux-headers
if [ "$DEV" ]; then
  pip install -qr requirements-dev.txt
else
  pip install -qr requirements.txt
fi
apk del -q deps
