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

~~~sh
docker-compose build
docker-compose up
$ curl -c cookie -XPOST -d 'token=token' -d 'password=aa' 'localhost:3000/login'
Found. Redirecting to /
$ curl -b cookie -XPOST -f -F file=@pe-20191013-194645.png 'localhost:3000/photos'
{"result":"success"}
~~~

#### docker-compose with HTTPS-Portal

~~~
docker-compose build
docker-compose up
curl -c cookie -XPOST -d 'token=token' -d 'password=aa' 'https://pe.noyuno.jp/login'
curl --http1.1 -b cookie -XPOST -F file=@20190907-123228.png --digest --user "a:b" https://pe.noyuno.jp/photos
~~~

`curl --http2` (default) option not supported. without `--http1.1`, it will return error:
~~~
curl: (92) HTTP/2 stream 1 was not closed cleanly: PROTOCOL_ERROR (err 1)
~~~

`curl -L` option not supported.

`curl -T` option not supported.

### Environment Variables

- DISCORDBOT: discordbot
- DISCORDBOT_TOKEN: "${DISCORDBOT_TOKEN}"
- PE_TOKEN: "${PE_TOKEN}"
- NODE_ENV: development

## Client (Raspberry Pi Zero)

### Hardware

- Raspberry Pi Zero WH
- [Indoor Corgi RPZ-IR-Sensor Rev2.0](https://www.indoorcorgielec.com/products/rpz-ir-sensor/)
- UPS-Lite
- Pyroelectric sensor (HC-SR505)
- Buzzer

### Pi Settings

~~~
# Uncomment this to enable the lirc-rpi module
dtoverlay=lirc-rpi
dtparam=gpio_out_pin=13
dtparam=gpio_in_pin=4
~~~

### Command

~~~
docker-compose build
docker-compose up
~~~

#### Developer

~~~
docker-compose -f docker-compose-dev.yml build
~~~

### Environment Variables

- PE_TOKEN
- DEV

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

### GPIO

| GPIO     | dest | device          |
|----------|------|-----------------|
| 13       | out  | IR sender       |
| 17       | out  | LED green       |
| 18       | out  | LED yellow      |
| 22       | out  | LED blue        |
| 25       | out  | Buzzer          |
| 27       | out  | LED white       |
| 4        | in   | IR receiver     |
| 5        | in   | tact sw red     |
| 6        | in   | tact sw black   |
| 23       | in   | HC-SR505        |


### Mode

from the left

1. red: execute button
0. black: select button

| state | command            |
|-------|--------------------|
| 0000  | back               |
| 0001  | status mode        |
| 0010  | send ir            |
| 0011  | record ir          |
| 0100  | take a picture     |
| 0101  | ping               |

#### Status mode

from the left

button:

1. red: undefined
0. black: select mode

LED:

3. green
2. yellow
1. blue
0. white

| state | state               | description        |
|-------|---------------------|--------------------|
| 1000  | green 0.5s once     | environment sensor |
| 0100  | yellow 0.5s blink   | battery error      |
| 0100  | yellow 1s blink     | network error      |
| 0100  | yellow 1.5s blink   | daemon error       |
| 0010  | blue 0.5s once      | take a picture     |

#### IR send mode / record mode

from the left

1. red: execute button
0. black: select button

| state | command            |
|-------|--------------------|
| 1000  | cancel             |
| 1010  | illumination off   |
| 1011  | illumination on    |
| 1100  | air conditioner off|
| 1101  | air conditioner on |
| 1110  | reserved           |
| 1111  | reserved           |

| state | state               | description        |
|-------|---------------------|--------------------|
| any   | 1 blink x 0.5s      | sending            |
| any   | blink x 0.2s        | recording          |
| any   | 1s                  | recorded           |

In record mode

1. red: complete recording
0. black: cancel recording


#### Photograph mode / Ping mode

| state | state               | description        |
|-------|---------------------|--------------------|
| 1000  | green 1s once       | ok                 |
| 0100  | yellow 1s once      | bad                |

