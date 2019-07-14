FROM alpine:latest
MAINTAINER Ilya Stepanov <dev@ilyastepanov.com>

env BASEDIR /opt/backupd
env LOGDIR /logs/backupd

run apk add bash python3 curl && \
    pip3 install awscli python-magic

ENTRYPOINT ["/opt/backupd/start.sh"]
CMD [""]

