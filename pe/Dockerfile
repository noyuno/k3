from node:alpine

run mkdir -p /data/photos
copy . /opt/pe
workdir /opt/pe
run npm install -g gulp && npm install && gulp sass

cmd [ "npm", "start" ]
