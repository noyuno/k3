from node:alpine

copy . /opt/pe
#copy package.json /opt/pe/package.json
#copy gulpfile.js /opt/pe/gulpfile.js
#copy sass /opt/pe/sass
workdir /opt/pe
run npm install -g gulp && \
    npm install && \
    #npm install passport-local && \
    npm rebuild --update-binary node-sass sqlite3 && \
    gulp sass && \
    mkdir -p /data/photos

#cmd [ "ls", "-l", "/opt/pe/node_modules/sqlite3/lib/binding" ]
cmd [ "npm", "start" ]
