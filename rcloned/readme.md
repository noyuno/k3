# rcloned

## Backup operation

### Configure credential

Type below commands in server:
~~~sh
docker run --rm -it -v $(pwd)/data/rclone:/root/.config/rclone noyuno/rcloned rclone config
# Google Drive: n s3 4 1 <enter> <key> <secret> 11 <enter> 11 <enter> <enter> <enter> <enter> n y
# Amazon S3: n drive 12 <id> <secret> 2 <enter> <enter> n n <paste> n y
# q
~~~

`docker-compose.yml` example:
~~~yml
version: "3"
services:
    # Google Drive to Server
    rclone-drive:
        image: noyuno/rcloned
        links:
            - discordbot
        environment:
            RCLONE_CROND_SCHEDULE: "02 18 * * *" # 03:02
            RCLONE_CROND_SOURCE_PATH: "drive:"
            RCLONE_CROND_DESTINATION_PATH: "/data"
            RCLONE_CROND_OPTIONS: "--transfers 1 --buffer-size 1M --use-mmap -v"
            CONTAINER_NAME: "rclone-drive"
        cap_add:
            - MKNOD
            - SYS_ADMIN
        restart: always
        # oneshot
        #command: /opt/rclone/rclone.sh run sync
        security_opt:
            - apparmor:unconfined
        tty: true
        ulimits:
            nproc: 65535
            nofile:
                soft: 49999
                hard: 99999
        volumes:
            - ./data/rclone:/root/.config/rclone
            - ./tmp/rclone:/data
            - ./rclone:/opt/rclone
            - ./logs/rclone:/logs
            - ./rclone/monit.d:/etc/monit.d
        # docker run --rm -it -v $(pwd)/data/rclone:/root/.config/rclone noyuno/rcloned rclone config
        # n s3 4 1 <enter> <key> <secret> 11 <enter> 11 <enter> <enter> <enter> <enter> n y
        # n drive 12 <id> <secret> 2 <enter> <enter> n n <paste> n y
        # q

    # Server to Amazon S3
    # When I try to move directly from Google Drive to Amazon S3,
    # there is not enough memory, so temporarily save it on the server.
    rclone-s3:
        image: noyuno/rcloned
        links:
            - discordbot
        environment:
            RCLONE_CROND_SCHEDULE: "02 00 * * *" # 09:02
            RCLONE_CROND_SOURCE_PATH: "/data"
            RCLONE_CROND_DESTINATION_PATH: "s3:k2b/mirror/drive"
            RCLONE_CROND_OPTIONS: "--transfers 1 --buffer-size 1M --use-mmap -v"
            CONTAINER_NAME: "rclone-s3"
        cap_add:
            - MKNOD
            - SYS_ADMIN
        restart: always
        # oneshot
        #command: /opt/rclone/rclone.sh run sync
        security_opt:
            - apparmor:unconfined
        tty: true
        ulimits:
            nproc: 65535
            nofile:
                soft: 49999
                hard: 99999
        volumes:
            - ./data/rclone:/root/.config/rclone
            - ./tmp/rclone:/data
            - ./rclone:/opt/rclone
            - ./logs/rclone:/logs
            - ./rclone/monit.d:/etc/monit.d
~~~

`docker-compose up -d rclone-drive rclone-s3`

## Download operation

~~~sh
mkdir -p out/drive
aws s3api list-objects-v2 --bucket k2b --prefix google --query "Contents[?StorageClass=='GLACIER']" --output text | \
    awk -F\\t '{print $2}' | \
    xargs -t -L 1 aws s3api restore-object --restore-request Days=5 --bucket k2b --key
aws s3 sync --force-glacier-transfer s3://k2b/google/drive out/drive
~~~
