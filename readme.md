# k3

## Overview

![k3](https://raw.githubusercontent.com/noyuno/k3/master/k3.png)

## Install


In Windows,

~~~powershell
scp -i .\.ssh\kagoya-ログイン用認証キー_20200429200002.key .\.ssh\id_rsa.pub root@k3.noyuno.jp:
ssh -i .\.ssh\kagoya-ログイン用認証キー_20200429200002.key root@k3.noyuno.jp
~~~

root
~~~sh
dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
dnf -y install python3-pip tmux git zsh tree htop podman-docker nano
pip3 install podman-compose

useradd noyuno -Gnoyuno,wheel -s /bin/zsh -p xxxxxxxx
mkdir /home/noyuno/.ssh
cp id_rsa.pub /home/noyuno/.ssh/authorized_keys
chown -R noyuno.noyuno /home/noyuno/.ssh
chmod 700 /home/noyuno/.ssh
chmod 600 /home/noyuno/.ssh/*
ls -al /home/noyuno/.ssh
cat /home/noyuno/.ssh/authorized_keys

exit
~~~

noyuno
~~~sh
git clone https://github.com/noyuno/k3
~~~



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
7. `curl -sL "https://raw.githubusercontent.com/noyuno/k3/master/cloud-config.yml" >cloud-config.yml`
8. Change IP address by `vi cloud-config.yml`
9. `sudo gdisk /dev/vda`, `p`
10. `sudo coreos-install -d /dev/vda -C stable -c cloud-config.yml`

If forget changing IP address, edit `/var/lib/coreos-install/user_data`

11. `reboot`

In Linux client,

12. `ssh xxx.xxx.xxx.xxx` (If refused connection, type `sudo systemctl start sshd` in VNC)
13. Set up `docker-compose`

~~~sh
git clone https://github.com/noyuno/k3
cd k3
# install docker-compose
./bin/install
cp .env.example .env
vi .env
~~~

14. Run services

~~~sh
dc up -d
~~~

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

| instance name       | target       | software           | generation | span   | time  | expires | path                   |
|---------------------|--------------|--------------------|------------|--------|-------|---------|------------------------|
| gitbucket-db-backup | gitbucket-db | postgres-backup-s3 | 1+3        | 2/week | 02:48 | latest:-, other:2 week | s3://k3b/large/db/gitbucket |
| owncloud-db-backup  | gitbucket-db | postgres-backup-s3 | 1+3        | 2/week | 03:16 | latest:-, other:2 week | s3://k3b/large/db/owncloud  |
| backupd             | all files    | backupd            | 1+3        | 2/week | 02:46 | latest:-, other:2 week | s3://k3b/backup/files       |
| photod              | Google Photos | photod            | 1          | 2/week | 02:51 | -       | s3://k3b/google/photos      |
| rclone-drive-local  | Google Drive | rcloned            | 1          | 2/week | 03:02 | -       | ./tmp/rclone-drive |
| rclone-drive-s3     | ./tmp/rclone-drive | rcloned            | 1          | 2/week | 09:02 | -       | s3://k3b/google/drive       |

## Restore

### General

In Arch Linux client,

1. Go to [AWS Security Credentials / User](https://console.aws.amazon.com/iam/home?region=us-east-1#/users), "append user" (access type: by program, policy group: AmazonS3FullAccess), and get AWS access key and secret key
2. Set up DNS

    1. Edit `/etc/systemd/resolved.conf`

    ~~~sh
    DNS=8.8.8.8
    ~~~

    2. `sudo systemctl restart systemd-resolved.service`

3. Set up `awscli`

~~~sh

sudo pip3 install awscli
aws configure
# Enter AWS Access Key ID, AWS Secret Access Key, Default region name (ap-northeast-1)
~~~

### k3

In installed CoreOS instance,

1. Set up `awscli`

~~~sh
# install awscli
toolbox
toolbox > yum install -y awscli

# check state
toolbox aws configure # input AWS Access Key ID, Access Key Secret, Region(ap-northeast-1)
~~~

2. Download items. If error occured, check state and try again.

~~~sh
mkdir -p s3/{large,db}

# download
toolbox aws s3 sync s3://k3b/backup /media/root/home/noyuno/s3

# extract
cd s3
tar -xf backupd.tar.gz
mv data ~/k3
gunzip -c gitbucket.sql.gz > gitbucket.sql
gunzip -c owncloud.sql.gz > owncloud.sql
~~~

3. Import database

~~~sh
cd ~/k3
# install docker-compose
./bin/install
# import database
dc up -d gitbucket-db owncloud-db
dc exec -T gitbucket-db psql -U gitbucket -d gitbucket < ~/s3/gitbucket.sql
dc exec -T owncloud-db psql -U owncloud -d owncloud < ~/s3/owncloud.sql
dc down
~~~

4. Start services

~~~sh
dc up -d
~~~

### Google data

1. Set up

~~~sh
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
EMAIL=
mkdir -p out/{drive,photos}
~~~

2. Restore items from Glacier.

~~~sh
aws s3api list-objects-v2 --bucket k3b --prefix google --query "Contents[?StorageClass=='GLACIER']" --output text | \
    awk -F\\t '{print $2}' | \
    xargs -t -L 1 aws s3api restore-object --restore-request Days=5 --bucket k3b --key
~~~

3. Wait 5 hours.

4. Download Google Drive files. If error occured, check state and try again.

~~~sh
# check state
aws s3api head-object --bucket k3b --key (key)

# download
aws s3 sync --force-glacier-transfer s3://k3b/google/drive out/drive
~~~

`--force-glacier-transfer` only tries download and doesn't try restore.

5. Download Google Photos files

    1. Download photod source code

    ~~~
    git clone https://github.com/noyuno/photod /tmp/photod
    ~~~

    2. Run
        
    ~~~sh
    docker run --rm -it \
        -v $(pwd)/out/photos:/data/photod \
        -v /tmp/photod:/opt/photod:ro \
        -v /tmp/photod/logs:/logs/photod \
        -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
        -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
        -e AWS_REGION=ap-northeast-1 \
        -e S3_BUCKET=k3b \
        -e S3_PREFIX=google/photos \
        -e EMAIL=$EMAIL noyuno/photod /opt/photod/download.sh
    ~~~
