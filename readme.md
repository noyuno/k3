# k2

## Overview

![k2](https://raw.githubusercontent.com/noyuno/k2/master/k2.png)

## Install

1. Get [CoreOS ISO](https://coreos.com/os/docs/latest/booting-with-iso.html)
2. Create instance. Note IP address, gateway
3. Boot instance
4. `ip a`. Note interface name
5. `sudo vi /etc/systemd/network/static.network`

~~~
[Match]
Name=eth0
[Network]
Address=xxx.xxx.xxx.xxx
Gateway=xxx.xxx.xxx.xxx
DNS=8.8.8.8
~~~

6. `sudo systemctl restart systemd-networkd`
7. `wget "https://raw.githubusercontent.com/noyuno/k2/master/cloud-config.yml"`
8. `sudo gdisk /dev/vda`, `p`
8. `sudo coreos-install -d /dev/vda -C stable -c cloud-config.yml`


## Operations

- `./bin/install-compose`: install docker-compose
- `./bin/update`: update all
- `./bin/restart`: restart all containers
- `./bin/remote-upgrade`: upgrade remote (`-i` to pull images)

## Attention

- When change sub domain, must remove `nginx` container

## Tools

draw dependency of docker container: `docker run --rm -it --name dcv -v $(pwd):/input pmsipilot/docker-compose-viz render -m image docker-compose.yml --force -o depends.png`

## Backup policy

| type         | num | span   | expires | store      | services                      |
|--------------|-----|--------|---------|------------|-------------------------------|
| large        | 1   | 3/week | -       | directory  | gitbucket,minio,owncloud      |
| backup       | 26  | 3/week | 2 month | tar.gz     | animed,(config)               |


## Restore

### VPS instance

1. Create new VPS instance
2. Install CoreOS to new instance
3. Login
4. 

### Google data

In Arch Linux client,

1. Go to [AWS Security Credentials / User](https://console.aws.amazon.com/iam/home?region=us-east-1#/users), "append user" (access type: by program, policy group: AmazonS3FullAccess), and get AWS access key and secret key
2. In terminal, type below commands to set up environment.

~~~sh
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
EMAIL=
mkdir -p out/{drive,photos}
sudo mv /usr/lib/python3.7/site-packages/dateutil /usr/lib/python3.7/site-packages/dateutil.old
yay -Syu s3cmd
~~~

3. Restore items from Glacier.

~~~sh
s3cmd --access_key=$AWS_ACCESS_KEY --secret_key=$AWS_SECRET_KEY -r --region=ap-northeast-1 -D 3 --restore-priority=standard restore s3://k2b/google
~~~

4. Wait 5 hours.

5. Download Google Drive files

~~~sh
s3cmd --access_key=$AWS_ACCESS_KEY --secret_key=$AWS_SECRET_KEY -r --region=ap-northeast-1 sync s3://k2b/google/drive out/drive
~~~

6. Download Google Photos files

~~~sh
docker run --rm -it \
    -v $(pwd)/out/photos:/data/photod \
    -v /tmp/photod:/opt/photod:ro \
    -v /tmp/logs:/logs/photod \
    -e AWS_ACCESS_KEY=$AWS_ACCESS_KEY \
    -e AWS_SECRET_KEY=$AWS_SECRET_KEY \
    -e AWS_REGION=ap-northeast-1 \
    -e S3_BUCKET=k2b \
    -e S3_PREFIX=google/photos \
    -e EMAIL=$EMAIL noyuno/photod /opt/photod/download.sh
~~~
