FROM python:3-alpine

ENV READTHEDOCS True
COPY . /opt/pec
WORKDIR /opt/pec
RUN apk add --no-cache --virtual deps musl-dev make gcc linux-headers && \
    pip install -r requirements.txt && \
    apk del deps
CMD [ "python", "./src/main.py" ]
