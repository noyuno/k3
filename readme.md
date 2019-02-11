# k2

install docker-compose: go `https://github.com/docker/compose/releases/latest`

update all: `./bin/update`

update submodules: `git submodule foreach git pull origin master`

recreate images: `dc stop && dc up -d --build`

