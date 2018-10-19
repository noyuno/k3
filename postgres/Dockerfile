FROM postgres:11-alpine

COPY conf/init.sh /docker-entrypoint-initdb.d
RUN chmod +x /docker-entrypoint-initdb.d/init.sh

