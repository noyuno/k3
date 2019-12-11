
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
import sys
from ir import *
from camera import *

class Mode(enum.Enum):
  select = 0b0001
  status = 0b0001
  send_ir = 0b0010
  record_ir = 0b0011
  photograph = 0b0100
  ping = 0b0101

class StatusModeLed():
  def __init__(self, led_interval, interface_interval, max=0):
    self.value = False
    self.toggle = led_interval / interface_interval
    self.count = 0
    self.max = self.toggle * max

  def set(self, v=True):
    if self.max != 0 and v == False:
      raise ValueError('cannot be v=False when max is specified')
    self.value = v

class StatusMode():
  def __init__(self, interval):
    self.running_sensor = StatusModeLed(0.5, interval, 1)
    self.battery_error = StatusModeLed(0.5, interval, 0)
    self.network_error = StatusModeLed(1.0, interval, 0)
    self.daemon_error = StatusModeLed(1.5, interval, 0)
    self.photograph = StatusModeLed(0.5, interval, 1)


class Interface(threading.Thread):
  def __init__(self, ir, interval=0.05, name='interface'):
    threading.Thread.__init__(self)
    self.name = str(name)
    self.interval = interval
    self.ir = ir

    self.led_pin = {
      3: 17,
      2: 18,
      1: 22,
      0: 27
    }
    
    self.sw_pin = {
      1: 5,
      0: 6
    }

    self.mode = Mode.status
    self.select_active = Mode.select
    self.status = StatusMode(self.interval)
    
    if os.environ.get('DEV'):
      pygame.init()
      self.screen = pygame.display.set_mode((400, 200))
      pygame.display.set_caption('Raspberry Pi Simulator')
      self.dev_led = [False, False, False, False]
    else:
      GPIO.setmode(GPIO.BCM)
      for _,v in self.sw_pin:
        GPIO.setup(v, GPIO.IN, pull_up_down=GPIO.PUD_UP)
      
      for _,v in self.led_pin:
        GPIO.setup(v, GPIO.OUT)

  def led(self, p, v):
    if os.environ.get('DEV'):
      GPIO.output(self.led_pin[p], v)
    else:
      self.dev_led[p] = v

  def next_active(self, T, v, a, ok, select):
    ret = False
    mode = v
    active = a
    if ok and not(select):
      m = a
      ret = True
    elif select and not(ok):
      if len(T) <= int(v) + 1:
        active = T(0)
      else:
        active = T(int(v) + 1)
    elif select and ok:
      # 同時押し
      pass

    return (ret, mode, active)

  def select_led(self, v):
    for p in range(3):
      self.led(p, int(v) & 0b1 << p)

  def select_mode(self, ok, select):
    (r, self.mode, self.select_active) = self.next_active(Mode, self.mode, self.select_active, ok, select)
    if r:
      return
    else:
      self.select_led(self.mode)

  def status_mode_led(self, p, v):
    if v.value:
      if v.max == 0:
        self.led(p, True)
      elif v.max != 0 and v.max < v.count:
        v.value = False
        v.count = 0
        self.led(p, False)
      else:
        if v.toggle == 0 or math.floor(v.count / v.toggle) % 2 == 0:
          self.led(p, True)
        else:
          self.led(p, False)
        v.count += 1
    else:
      pass
      #self.led(p, False)

  def status_mode(self, ok, select):
    if not(ok) and select:
      self.mode = Mode.select
      return
    for p in range(4):
      self.led(p, False)
    self.status_mode_led(3, self.status.running_sensor)
    self.status_mode_led(2, self.status.daemon_error)
    self.status_mode_led(2, self.status.network_error)
    self.status_mode_led(2, self.status.battery_error)
    self.status_mode_led(1, self.status.photograph)

  def ir_mode(self, ok, select):
    if self.recording:
      if ok and not(select):
        self.ir.end_record()
        self.select_led(self.ir_mode)
        time.sleep(1.0)
        self.select_led(0b0000)
        time.sleep(1.0)
      elif not(ok) and select:
        self.mode = Mode.select
        return
      elif not(ok) and not(select):
        if math.floor(self.record_count / 0.2 / self.interval) % 2 == 0:
          self.select_led(self.ir_mode)
        else:
          self.select_led(0b0000)
        self.record_count += 1
      else:
        self.logger.error('ir_mode(): simultaneous pressing is not supported')
    else:
      (r, self.ir_mode, self.ir_mode_active) = self.next_active(IRMode, self.ir_mode, self.ir_mode_active, ok, select)
      if r:
        if self.ir_mode == IRMode.cancel:
          self.mode = Mode.select
          return
        elif self.ir_mode != IRMode.cancel:
          if self.mode == Mode.send_ir:
            self.ir.send(self.ir_mode)
            self.select_led(0b0000)
            time.sleep(0.5)
            self.select_led(self.ir_mode)
            time.sleep(0.5)
          elif self.mode == Mode.record_ir:
            self.ir.record(self.ir_mode)
            # blink x 0.2sec
            self.record_count = 0
          else:
            self.logger.error('unknown ir mode : {}'.format(self.mode))
      else:
        self.select_led(self.ir_mode)

  def photograph_mode(self, ok, select):
    self.camera.send()
    time.sleep()

  def dev_draw(self, last_ok, last_select):
    self.screen.fill((0, 0, 0))
    if self.dev_led[3]:
      pygame.draw.rect(self.screen, (0, 255, 0), Rect(50, 50, 50, 50))
    else:
      pygame.draw.rect(self.screen, (0, 255, 0), Rect(50, 50, 50, 50), 5)
    if self.dev_led[2]:
      pygame.draw.rect(self.screen, (255, 255, 0), Rect(150, 50, 50, 50))
    else:
      pygame.draw.rect(self.screen, (255, 255, 0), Rect(150, 50, 50, 50), 5)
    if self.dev_led[1]:
      pygame.draw.rect(self.screen, (0, 0, 255), Rect(250, 50, 50, 50))
    else:
      pygame.draw.rect(self.screen, (0, 0, 255), Rect(250, 50, 50, 50), 5)
    if self.dev_led[0]:
      pygame.draw.rect(self.screen, (255, 255, 255), Rect(350, 50, 50, 50))
    else:
      pygame.draw.rect(self.screen, (255, 255, 255), Rect(350, 50, 50, 50), 5)
    
    if last_ok:
      pygame.draw.ellipse(self.screen, (255, 0, 0), Rect(50, 250, 50, 50))
    else:
      pygame.draw.ellipse(self.screen, (255, 0, 0), Rect(50, 250, 50, 50), 5)
    if last_select:
      pygame.draw.ellipse(self.screen, (255, 255, 255), Rect(50, 250, 50, 50))
    else:
      pygame.draw.ellipse(self.screen, (255, 255, 255), Rect(150, 250, 50, 50), 5)

  def run(self):
    last_ok = False
    last_select = False
    while True:
      try:
        if os.environ.get('DEV'):
          key = pygame.key.get_pressed()
          ok = last_ok and not(key[K_A])
          last_ok = key[K_A]
          select = last_select and not(key[K_S])
          last_select = key[K_S]
          for event in pygame.event.get():
            if event.type == QUIT:
              pygame.quit()
              sys.exit()
              
        else:
          ok = last_ok and not(GPIO.input(self.sw_pin[1]))
          last_ok = GPIO.input(self.sw_pin[1])
          select = last_select and not(GPIO.input(self.sw_pin[0]))
          last_select = GPIO.input(self.sw_pin[0])

        if self.mode == Mode.select:
          self.select_mode(ok, select)
        elif self.mode == Mode.status:
          self.status_mode(ok, select)
        elif self.mode == Mode.send_ir or self.mode == Mode.record_ir:
          self.ir_mode(ok, select)
        elif self.mode == Mode.photograph:
          self.photograph_mode(ok, select)
        elif self.mode == Mode.ping:
          self.ping_mode(ok, select)
        else:
          self.logger.error('unknown mode {}'.format(self.mode))
        

        if os.environ.get('DEV'):
          self.dev_draw(last_ok, last_select)
          
        # for k,v in self.led_current:
        #   GPIO.output(self.led_pin[k], v)
        # for k,v in self.sw_callback:
        #   if v is not None:
        #     if GPIO.input(self.sw_pin[k]) == 0:
        #       # pressing
        #       self.sw_current[k] += 1
        #     else:
        #       if self.sw_current[k] != 0:
        #         self.sw_current[k] = 0
        #         threading.Thread(target=self.sw_callback, name="sw_callback_{}".format(k)).start()
        time.sleep(self.interval)
      except:
        pass


  def close(self):
    if os.environ.get('DEV'):
      pass
    else:
      GPIO.cleanup(5)
      GPIO.cleanup(6)
      GPIO.cleanup(17)
      GPIO.cleanup(18)
      GPIO.cleanup(22)
      GPIO.cleanup(27)

  def demo(self):
    # GPIOの準備
    GPIO.setmode(GPIO.BCM)

    # SW1, SW2ピン入力設定
    GPIO.setup(5, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(6, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    # LED1, 2, 3, 4ピン出力設定
    GPIO.setup(17, GPIO.OUT)
    GPIO.setup(18, GPIO.OUT)
    GPIO.setup(22, GPIO.OUT)
    GPIO.setup(27, GPIO.OUT)

    try:
      while True:
        # SW1かSW2が押された場合
        if 0==GPIO.input(5) or 0==GPIO.input(6):
          # LED1, 2, 3, 4 点灯
          GPIO.output(17, 1)
          GPIO.output(18, 1)
          GPIO.output(22, 1)
          GPIO.output(27, 1)
        #SW1, SW2どちらも押されていない場合
        else:
          # LED1, 2, 3, 4 消灯
          GPIO.output(17, 0)
          GPIO.output(18, 0)
          GPIO.output(22, 0)
          GPIO.output(27, 0)
          time.sleep(0.01)

    # Ctrl+Cが押されたらGPIOを解放
    except KeyboardInterrupt:
      GPIO.cleanup(5)
      GPIO.cleanup(6)
      GPIO.cleanup(17)
      GPIO.cleanup(18)
      GPIO.cleanup(22)
      GPIO.cleanup(27)





