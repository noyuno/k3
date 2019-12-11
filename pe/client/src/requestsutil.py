import requests
import os
import json
import threading
import time

class RequestsUtil(threading.Thread):
  def __init__(self, logger, name="RequestsUtil"):
    threading.Thread.__init__(self)
    self.name = str(name)
    
    self.logger = logger
    if os.getenv('PEHTTPS') != "":
      self.peHost = 'https://'
    else:
      self.peHost = 'http://'
    self.peHost += os.getenv('PEHOST', 'pe.noyuno.jp')
    self.cookies = None

  def get(self, url):
    r = requests.get(self.peHost + url, cookies=self.cookies, allow_redirects=False)
    if r.status_code == 403:
      # re-authentication
      r = requests.post(self.peHost + '/login', data={
          'token': os.getenv('PE_TOKEN'),
          'password': 'a'
        }, allow_redirects=False)
      self.cookies = r.cookies
      self.logger.debug('got cookies: {}'.format(self.cookies))
      if r.status_code == 302 and r.text != 'Found. Redirecting to /':
        raise ConnectionError('failed to login the PE Host:code={}, text={}'.format(r.status_code, r.text))
      r = requests.get(self.peHost + url, cookies=self.cookies, allow_redirects=False)
      if r.status_code == 403:
        raise ConnectionError('failed to login server:code={}, text={}'.format(r.status_code, r.text))
      elif r.status_code == 200 and json.loads(r.text)['status'] == 'ok':
        # ok
        return json.loads(r.text)
      else:
        raise RuntimeError('returned error by server:code={}, text={}'.format(r.status_code, r.text))
    elif r.status_code == 200 and json.loads(r.text)['status'] == 'ok':
      # ok
      return json.loads(r.text)
    else:
      raise RuntimeError('returned error by server: code={}, text={}'.format(r.status_code, r.text))

  def post(self, url, data):
    r = requests.post(self.peHost + url, data=data, cookies=self.cookies, allow_redirects=False)
    if r.status_code == 403:
      # re-authentication
      r = requests.post(self.peHost + '/login', data={
          'token': os.getenv('PE_TOKEN'),
          'password': 'a'
        }, cookies=self.cookies, allow_redirects=False)
      if r.status_code == 302 and r.text != 'Found. Redirecting to /':
        raise ConnectionError('failed to login the PE Host:code={}, text={}'.format(r.status_code, r.text))
      r = requests.post(self.peHost + url, data=data, cookies=self.cookies, allow_redirects=False)
      if r.status_code == 403:
        raise ConnectionError('failed to login server:code={}, text={}'.format(r.status_code, r.text))
      elif r.status_code == 200 and json.loads(r.text)['status'] == 'ok':
        # ok
        return
      else:
        raise RuntimeError('returned error by server:code={}, text={}'.format(r.status_code, r.text))
