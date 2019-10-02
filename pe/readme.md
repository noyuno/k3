# pe

Raspberry Pi Zero Environment sensor

## Server (Docker on CoreOS)

### Install

~~~
npm install -g gulp-cli
npm install
~~~

### Launch

#### developing on the localhost

~~~
docker build . -t pe
docker run -it --rm -v C:\Users\noyuno\Desktop\tmp:/data  -v public:/opt/pe/public -v views:/opt/pe/views -p "3000:3000" -e PE_USERNAME=a -e PE_PASSWORD=b pe
curl --http1.1 -XPOST -F file=@20190907-123228.png --digest --user "a:b" http://localhost:3000/photos
~~~

#### docker-compose with HTTPS-Portal

~~~
dc build pe
dc up pe
curl --http1.1 -XPOST -F file=@20190907-123228.png --digest --user "a:b" https://pe.noyuno.jp/photos
~~~

`curl --http2` (default) option not supported. without `--http1.1`, it will return error:
~~~
curl: (92) HTTP/2 stream 1 was not closed cleanly: PROTOCOL_ERROR (err 1)
~~~

`curl -L` option not supported.

`curl -T` option not supported.

## Client (Raspberry Pi Zero)

### Command

~~~
python3 main.py
~~~

### Systemd

~~~
sudo ./bin/systemd-install
sudo systemctl start pe
~~~

### Environment Variables

- `DISCORDBOT_TOKEN`
- `PE_USERNAME`
- `PE_PASSWORD`

### i2c

| address  | device          |
|----------|-----------------|
|0x76      | external BME280 |
|0x77      | internal BME280 |
|0x39      | TSL2572         |
|0x02-0x03 | UPS VCELL       |
|0x04-0x05 | UPS SOC         |
|0x06-0x07 | UPS RRT_ALRT    |
|0x08      | UPS CONFIG      |
|0x0A      | UPS MODE        |

### LED

from the left

1. green
2. yellow
3. blue
4. white

| state               | description        |
|---------------------|--------------------|
| green 0.5s once     | environment sensor |
| yellow 0.5s blink   | battery error      |
| yellow 1s blink     | network error      |
| yellow 1.5s blink   | daemon error       |
| blue 0.5s once      | take a picture     |
| white 0.5s once     | send IR            |
| white 0.2s twice    | record IR          |

### button

from the left

1. red
2. black

