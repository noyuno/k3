FROM sgtwilko/rpi-raspbian-opencv:stretch-4

COPY . /opt/pec
WORKDIR /opt/pec
RUN apt update && \
    apt install lirc && \
    pip3 install -r requirements.txt
CMD [ "python3", "./src/main.py" ]
