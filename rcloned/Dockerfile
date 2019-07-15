FROM alpine:latest
MAINTAINER Thomas Spicer <thomas@openbridge.com>

ARG RCLONE_VERSION="current"
ENV RCLONE_TYPE="amd64"
ENV BUILD_DEPS \
      wget \
      linux-headers \
      unzip \
      fuse
env BASEDIR="/opt/rcloned"

COPY build.sh /build.sh
RUN /build.sh

ENTRYPOINT ["/opt/rcloned/docker-entrypoint.sh"]
CMD [""]
