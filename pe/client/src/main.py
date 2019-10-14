import asyncio
import threading
import os
import sys
import queue
import schedule
import time
import logging
from datetime import datetime

import report
import util
import camera
import led
import sensor

class Scheduler():
    def __init__(self, report, camera, led, sensor, logger, loop):
        self.report = report
        self.camera = camera
        self.led = led
        self.sensor = sensor
        self.logger = logger
        self.loop = loop

    def run(self):
        asyncio.set_event_loop(self.loop)
        self.logger.debug('launch scheduler')
        schedule.every(10).minutes.do(self.report.run, show_all=False)
        schedule.every(10).minutes.do(self.camera.run, show_all=False)
        schedule.every(3).seconds.do(self.sensor.run, show_all=False)

        while True:
            schedule.run_pending()
            time.sleep(1)

def initlogger():
    logdir = '/logs/pe'
    os.makedirs(logdir, exist_ok=True)
    starttime = datetime.now().strftime('%Y%m%d-%H%M')
    logging.getLogger().setLevel(logging.WARNING)
    logger = logging.getLogger('pe')
    if os.environ.get('DEBUG'):
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)
    logFormatter = logging.Formatter(fmt='%(asctime)s %(levelname)s: %(message)s',
                                     datefmt='%Y%m%d-%H%S')
    fileHandler = logging.FileHandler('/{}/{}'.format(logdir, starttime))
    fileHandler.setFormatter(logFormatter)
    logger.addHandler(fileHandler)
    consoleHandler = logging.StreamHandler()
    consoleHandler.setFormatter(logFormatter)
    logger.addHandler(consoleHandler)
    return logger, starttime

def main(logger):
    envse = ['PE_TOKEN']
    envsc = []

    f = util.environ(envse, 'error')
    util.environ(envsc, 'warning')
    if f:
        logger.error('error: some environment variables are not set. exiting.')
        sys.exit(1)

    if os.environ.get('DEV'):
        logger.info('running on DEV mode')

    rep = report.Report()
    cam = camera.Camera()
    le = led.Led()
    sen = sensor.Sensor()
    scheduleloop = asyncio.new_event_loop()
    sched = Scheduler(rep, cam, le, sen, logger, scheduleloop)
    threading.Thread(target=sched.run, name='scheduler').start()

if __name__ == "__main__":
    logger, starttime = initlogger()
    logger.info('started discordbot at {0}'.format(starttime))
    main(logger)

