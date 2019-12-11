import requests
from bme280i2c import BME280I2C
from tsl2572 import TSL2572
from datetime import datetime
import threading
import time

class Report(threading.Thread):
  def __init__(self, logger, ws):
    threading.Thread.__init__(self)
    self.logger = logger
    self.ws = ws
          
  def report(self):
    server = 'https://pe.noyuno.jp/sensor'
    bme280 = BME280I2C(0x76)
    if not bme280.meas():
      print('error reading BME280')
      exit(1)
    tsl2572 = TSL2572(0x39)
    if tsl2572.id_read():
      tsl2572.meas_single()
    else:
      print('ID Read Failed')
      exit(1)
    
    r = requests.post(server, {
      'time': datetime.now().timestamp(),
      'temperature': bme280.T,
      'pressure': bme280.P,
      'humidity': bme280.H,
      'illuminance': tsl2572.lux
      })
    if r.status_code == 200:
      #ok
      pass
    else:
      #bad
      pass

  def run(self):
    while True:
      time.sleep(1)
      