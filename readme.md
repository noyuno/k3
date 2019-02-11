# k2

install docker-compose: go `https://github.com/docker/compose/releases/latest`

update all: `./bin/update` == `git pull origin master && git submodule foreach git pull origin master`

restart all containers: `./bin/restart` == `dc stop && dc up -d --build`

