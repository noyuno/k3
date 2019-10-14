import websocket from './websocket.js'
import command from './command.js'

var dataStructure = null

const init = () => {
  websocket.init({
    open: (d) => {
      websocket.send({ type: 'list' })
    },
    sensor_data: addrows,
    sensor_report: (d) => {
      console.error('sensor_report not implemented')
    },
    list: (d) => {
      dataStructure = d.data
      command.initCommand(d)
      updateMode()
      query()
    },
  })

  $('#cols').on('change', () => {
    updateMode($('#cols').val())
    query()    
  })
  $('#new').on('click', 'new', page)
  $('#old').on('click', 'old', page)
  $('#pages').on('change', changePage)
  $('#hosts').on('change', changeHost)
}

const changeHost = () => {
  command.updateCommand($('#hosts').val())
  updateMode($('#cols').val())
  query()
}

const updateMode = (active_col_name) => {
  var active_cols_data = null
  for (var host of dataStructure.hosts) {
    if (!active_col_name) {
      if (host.name == $('#hosts').val()) {
        active_col_name = host.default_col
        active_cols_data = host.cols
        break
      }
    } else {
      if (host.name == $('#hosts').val()) {
        active_cols_data = host.cols
        break
      }
    }
  }
  if (active_cols_data == null) {
    console.error('something wrong, active_cols_data==null')
  }
  // Environment / All button
  // Table head & Modes option
  $('#cols').empty()
  $('#maintable-head').empty()
  var tr = $('<tr>').appendTo($('#maintable-head'))
  for (var col of active_cols_data) {
    $('<option>').val(col.name).text(col.text).appendTo('#cols')
    if (col.name == active_col_name) {
      $('#cols').val(col.name)
      for (var n of col.data) {
        $('<td>').text(n.text).val(n.name).appendTo(tr)
      }

      // 不快指数と体感温度を追加
      var t = false
      var h = false
      for (var n of col.data) {
        if (t && h) {
          break
        }
        if (n.name == 'temperature') {
          t = true
        } else if (n.name == 'humidity') {
          h = true
        }
      }
      if (t && h) {
        $('<td>').text('(不快指数)').val('discomfort_index').appendTo(tr)
        $('<td>').text('(体感温度)').val('apparent_temperature').appendTo(tr)
      }
    }
  }
  return active_col_name
}

const addrows = (data) => {
  if (data.status == 'success') {
    // set page number
    const allpages = Math.max(Math.ceil(data.count / data.limit), 1)
    $('#pages').empty()
    for (var i = 1; i <= allpages; i++) {
      $('<option>').val(i).text(i).appendTo('#pages')
    }
    $('#allpages').val(allpages).text(allpages)

    var tr = $('<tr>').appendTo('#maintable-data')
    const appendtd = (tr, text) => {
      $('<td>').text(text).appendTo(tr)
    }
    if (data.data == {}) {
      appendtd(tr, 'empty database')
    } else {
      // append data
      for (var row of data.data) {
        $('#maintable-head').find('td').each((td) => {
          const c = td.attr('id')
          if (c == 'discomfort_index') {
            const v = 0.81 * row['temperature'] + 0.01 * row['humidity'] * (0.99 * row['temperature'] - 14.3) + 46.3
            appendtd(tr, v)
          } else if (c == 'apparent_temperature') {
            // http://www.hko.gov.hk/publica/reprint/r444.pdf
            const t = row['temperature']
            const h = row['humidity']
            const a = 1.76
            const tm = 37 - ((37-t) / (0.68-0.0014*h+1/a)) - 0.29 * t * (1-h/100)
            appendtd(tr, tm)
          } else {
            $('<td>').text(row[c]).appendTo(tr)
            appendtd(tr, row[c])
          }
        })
      }
    }
  } else if (data.status == 'error') {
    console.error('error: ', data.error)
  }
}

const query = () => {
  const d = {
    type: 'sensor_data',
    host: $('#hosts').val(),
    page: Number($('#pages').val()),
    limit: 100,
    mode: $('#cols').val()
  }
  console.log('sending query: ', d)
  websocket.send(d)
}



const page = (s) => {
  if (s == 'new') {
    const current = $('#pages').prop('selectedIndex');
    if (current > 0) {
      $('#pages').prop('selectedIndex', current - 1);
      changePage();
    }
  } else if (s == 'old') {
    const current = $('#pages').prop('selectedIndex');
    const length = $('#pages').children().length;
    if (current < length - 1) {
      $('#pages').prop('selectedIndex', current + 1);
      changePage();
    }
  }
}

const changePage = () => {
  const page = $('#pages option:selected').text();
  query();
}

window.onload = init

