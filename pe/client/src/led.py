
import os
if not os.environ.get('DEV'):
  import RPi.GPIO as GPIO
import time

class Led():
  def __init__(self):
    pass

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





