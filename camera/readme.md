

### test

~~~
docker build . -t camera
docker run -it --rm -v C:\Users\noyuno\Desktop\tmp:/data/photos -v ${PWD}:/opt/camera -p "3000:3000" -e CAMERA_USERNAME=a -e CAMERA_PASSWORD=b camera
curl -XPOST  -F file=@20190907-123228.png --digest --user "a:b" http://localhost:3000/
~~~
