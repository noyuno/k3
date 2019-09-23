

### test

~~~
docker build . -t pe
docker run -it --rm -v C:\Users\noyuno\Desktop\tmp:/data/photos -v ${PWD}:/opt/pe -p "3000:3000" -e PE_USERNAME=a -e PE_PASSWORD=b pe
curl -XPOST  -F file=@20190907-123228.png --digest --user "a:b" http://localhost:3000/photos
~~~
