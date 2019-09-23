from node:alpine

run mkdir -p /data/photos
copy . /opt/pe
workdir /opt/pe
run npm install

cmd [ "npm", "start" ]
