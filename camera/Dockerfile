from node:alpine

run mkdir -p /data/photos
copy . /opt/camera
workdir /opt/camera
run npm install

cmd [ "npm", "start" ]
