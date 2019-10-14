var ws = null
var callbacks = {}
export default { 
  init: (messageCallbacks) => {
    callbacks = messageCallbacks
    const u = location.host + '/ws'
    const url = (location.protocol == 'http:') ? ('ws://' + u) : ('wss://' + u)
    ws = new WebSocket(url)
    ws.addEventListener('open', (e) => {
      console.log('websocket: open')
      if (callbacks['open']) {
        callbacks['open']()
      }
    })
    ws.addEventListener('close', (e) => {
      console.log('websocket: close')
      if (callbacks['close']) {
        callbacks['close']()
      }
    })
    ws.addEventListener('error', (e) => {
      console.error('websocket: error: ', e)
      if (callbacks['error']) {
        callbacks['error'](JSON.parse(e.data))
      }
    })
    ws.addEventListener('message', (e) => {
      var d = JSON.parse(e.data)
      console.log('received message: ', d)
      if (d.status != 'ok') {
        console.error('error: websocket returned: ', d)
      } else if (callbacks[d.type]) {
        callbacks[d.type](d)
      } else {
        console.error('websocket error: not implemented: ', d.type)
      }
    })
  },
  send: (json) => {
    ws.send(JSON.stringify(json))
  },
  receive: (type, callback) => {
    callbacks[type] = callback
  }
}
