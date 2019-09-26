

### test

~~~
docker build . -t pe
docker run -it --rm -v C:\Users\noyuno\Desktop\tmp:/data -v ${PWD}:/opt/pe -p "3000:3000" -e PE_USERNAME=a -e PE_PASSWORD=b pe
curl --http1.1 -L -XPOST  -F file=@20190907-123228.png --digest --user "a:b" http://localhost:3000/photos
~~~

without `--http1.1`, it will return
~~~
curl: (92) HTTP/2 stream 1 was not closed cleanly: PROTOCOL_ERROR (err 1)
~~~
