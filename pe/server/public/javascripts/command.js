import websocket from './websocket.js'

var dataStructure = null

const initCommand = (data) => {
  dataStructure = data.data
  websocket.receive('command', receiveCommand)
  updateCommand(dataStructure.default_host)
}

const updateCommand = (activeHost) => {
  $('#hosts').empty()
  for (var host of dataStructure.hosts) {
    $('<option>').val(host.name).text(host.text).appendTo($('#hosts'))
    if (host.name == activeHost) {
      // Active default host
      $('#hosts').val(host.name)
      // Command button
      $('#command_button').empty()
      for (var c of host.commands) {
        $('<input>').attr('id', c.name)
                    .attr('class', 'button')
                    .attr('type', 'button')
                    .click(c.name, runCommand)
                    .val(c.text)
                    .appendTo('#command_button')
      }
    }
  }
  return activeHost
}


const runCommand = (e) => {
    websocket.send({
      type: 'command',
      host: $('#hosts').val(),
      name: e.data,
      data: {}
    })
}

const receiveCommand = (data) => {
    console.error('receiveCommand not implemented')
}

export default {
  initCommand: initCommand,
  updateCommand: updateCommand,
  runCommand: runCommand,
  receiveCommand: receiveCommand
}