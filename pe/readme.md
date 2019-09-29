

### localhost

~~~
docker build . -t pe
docker run -it --rm -v C:\Users\noyuno\Desktop\tmp:/data -v ${PWD}:/opt/pe -p "3000:3000" -e PE_USERNAME=a -e PE_PASSWORD=b pe
curl --http1.1 -XPOST -F file=@20190907-123228.png --digest --user "a:b" http://localhost:3000/photos
~~~

### docker-compose with HTTPS-Portal

~~~
dc build pe
dc up pe
curl --http1.1 -XPOST -F file=@20190907-123228.png --digest --user "a:b" https://pe.noyuno.jp/photos
~~~

without `--http1.1`, it will return
~~~
curl: (92) HTTP/2 stream 1 was not closed cleanly: PROTOCOL_ERROR (err 1)
~~~

`curl -L` option not supported.

`curl -T` option not supported.
