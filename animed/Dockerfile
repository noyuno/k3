FROM python:3.6-alpine

ENV ANIMED_OUTPUT /data
COPY . /opt/animed
RUN pip install icalendar argparse && \
    mkdir -p $ANIMED_OUTPUT
CMD /opt/animed/bin/animed

