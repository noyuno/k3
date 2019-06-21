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

