# k2

## Overview

![k2](https://raw.githubusercontent.com/noyuno/k2/master/k2.png)

## Operations

install docker-compose: `./bin/install-compose`

update all: `./bin/update`

restart all containers: `./bin/restart`

## Tools

draw dependency of docker container: `docker run --rm -it --name dcv -v $(pwd):/input pmsipilot/docker-compose-viz render -m image docker-compose.yml --force -o depends.png`

