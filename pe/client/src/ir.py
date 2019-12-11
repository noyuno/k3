import os
if os.environ.get('DEV'):
  import pygame
  from pygame.locals import *
else:
  import RPi.GPIO as GPIO
import time
import threading
import queue
import enum
import math

    
class IRMode(enum.Enum):
  cancel = 0b1000
  illumination_off = 0b1010
  illumination_on = 0b1011
  air_conditioner_off = 0b1100
  air_conditioner_on = 0b1101

  def __init__(self, record):
    self.record = record

class IR(threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
  

  def send(self):
    pass

  def record(self):
    pass

  def run(self):
    while True:
      time.sleep(1)
