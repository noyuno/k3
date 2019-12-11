import os
import json
import websocket
import time
import threading

class WebSocketUtil(threading.Thread):
  def __init__(self, logger, req):
    threading.Thread.__init__(self)
    self.logger = logger
    self.req = req
    self.callbacks = {}
    if os.getenv('PEHTTPS') != '':
      self.peWSHost = 'wss://'
    else:
      self.peWSHost = 'ws://'
    self.peWSHost += os.getenv('PEHOST', 'pe.noyuno.jp')

    # cookie
    cookies = req.cookies

    self.ws = websocket.WebSocketApp(self.peWSHost,
      on_open=self.on_open,
      on_message=self.on_message,
      on_error=self.on_error,
      on_close=self.on_close,
      header = [cookies])
    self.ws.run_forever()

    
  def on_message(self, ws, message):
    print(message)

  def on_error(self, ws, error):
    print(error)

  def on_close(self, ws):
    print('closed')

  def on_open(self, ws):
    print('open')

  def send(self, data):
    self.ws.send(json.dumps(data))
  
  def callback(self, name, cb):
    self.callbacks['name'] = cb

  def run():
    while True:
      time.sleep(1)
      