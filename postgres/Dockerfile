FROM postgres:11-alpine

COPY conf /docker-entrypoint-initdb.d
RUN chmod +x /docker-entrypoint-initdb.d/*

