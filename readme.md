# k2

## Overview

![k2](https://raw.githubusercontent.com/noyuno/k2/master/k2.png)

## Operations

install docker-compose: go `https://github.com/docker/compose/releases/latest`

update all: `./bin/update` == `git pull origin master && git submodule foreach git pull origin master`

restart all containers: `./bin/restart` == `dc stop && dc up -d --build`

## Tools

draw dependency of docker container: `docker run --rm -it --name dcv -v $(pwd):/input pmsipilot/docker-compose-viz render -m image docker-compose.yml --force -o depends.png`

