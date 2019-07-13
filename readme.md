# k2

## Overview

![k2](https://raw.githubusercontent.com/noyuno/k2/master/k2.png)

## Operations

- `./bin/install-compose`: install docker-compose
- `./bin/update`: update all
- `./bin/restart`: restart all containers
- `./bin/remote-upgrade`: upgrade remote (`-i` to pull images)

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
mkdir -p out/{drive,photos}
sudo mv /usr/lib/python3.7/site-packages/dateutil /usr/lib/python3.7/site-packages/dateutil.old
yay -Syu s3cmd
~~~

3. Restore items from Glacier

~~~sh
s3cmd --access_key=$AWS_ACCESS_KEY --secret_key=$AWS_SECRET_KEY -r --region=ap-northeast-1 -D 3 --restore-priority=standard restore s3://k2b/google
~~~

4. Wait 3-5 hours, type below commands to check status

~~~sh
s3cmd --access_key=$AWS_ACCESS_KEY --secret_key=$AWS_SECRET_KEY -r --region=ap-northeast-1 ls s3://k2b/google | awk '{for(i=4;i<NF;++i){printf("%s ",$i)}print $NF}' > out/ls
while read i; do s3cmd --access_key=$AWS_ACCESS_KEY --secret_key=$AWS_SECRET_KEY --region=ap-northeast-1 info "$i" | grep "Storage:.*GLACIER" >/dev/null ; if [ $? -eq 0 ]; then echo "Glacier object: $i"; else echo -n . ; fi ; done < out/ls
~~~

5. Download items

~~~sh
s3cmd --access_key=$AWS_ACCESS_KEY --secret_key=$AWS_SECRET_KEY -r --region=ap-northeast-1 get s3://k2b/google/drive out/drive
~~~

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
