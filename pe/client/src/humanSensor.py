import os
if not os.environ.get('DEV'):
  import RPi.GPIO as GPIO
import threading
import asyncio

class HumanSensor(threading.Thread):
  def __init__(self, logger, req, ws, ir, usb, name='HumanSensor'):
    threading.Thread.__init__(self)
    self.name = str(name)
    self.logger = logger
    self.requests = req
    self.websocket = ws
    self.ir = ir
    self.usb = usb
    self.pin = 23
    if not os.environ.get('DEV'):
      GPIO.setup(pin, GPIO.IN)
    self.visible_callbacks = []
    self.invisible_callbacks = []

  def run(self):
    self.logger.debug('sensor.run')
    while True:
      state = False
      if not os.environ.get('DEV'):
        if GPIO.input(self.pin):
          if state == False:
            state = True
            self.logger.debug('HumanSensor: GPIO=1')
            asyncio.create_task(self.report_visible())
        else:
          if state == True:
            state = False
            self.logger.debug('HumanSensor: GPIO=0')
            asyncio.create_task(self.report_invisible())
  
  async def report_visible(self):
    for c in self.visible_callbacks:
      await c()

  async def report_invisible(self):
    for c in self.invisible_callbacks:
      await c()
