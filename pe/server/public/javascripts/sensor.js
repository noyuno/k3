
    var ws = null
    var data_structure = null

    const init = () => {
      const u = location.host + '/sensor/ws'
      const url = (location.protocol == 'http:') ? ('ws://' + u) : ('wss://' + u)
      ws = new WebSocket(url)
      ws.addEventListener('open', (e) => {
        console.log('websocket: open')
        ws.send(JSON.stringify({ status: 'list' }))
      })
      ws.addEventListener('message', (e) => {
        console.log('received message: ', e.data)
        //addrows(JSON.parse(e.data))
        var d = JSON.parse(e.data)
        if (d.status == 'success') {
          addrows(d)
        } else if (d.status == 'list') {
          data_structure = d.data
          setMode()
        } else if (d.status == 'command') {
          receiveCommand(d)
        }
        
      })
      ws.addEventListener('close', (e) => {
        console.log('websocket: close')
      })
      ws.addEventListener('error', (e) => {
        console.log('websocket: error: ', e.data)
      })
    }

    const changeHost = () => {
      setMode($('#hosts').val())
    }

    const changeCol = () => {
      setMode($('#hosts').val(), $('#cols').val())
    }

    const setMode = (active_host, active_col) => {
      if (!active_host) {
        active_host = data_structure.default_host
      }
      if (!active_col) {
        for (var host of data_structure.hosts) {
          if (host.name == active_host) {
            active_col = host.default_col
            break
          }
        }
      }
      $('#hosts').empty()
      for (var host of data_structure.hosts) {
        $('<option>').val(host.name).text(host.text).appendTo($('#hosts'))
        if (host.name == active_host) {
          // Active default host
          $('#hosts').val(host.name)
          // Command button
          $('#command_button').empty()
          for (var c of host.commands) {
            $('<input>').attr('id', c.name)
                        .attr('class', 'button')
                        .attr('type', 'button')
                        .attr('onclick', 'command("' + c.name + '")')
                        .val(c.text)
                        .appendTo('#command_button')
          }
          // Environment / All button
          // Table head & Modes option
          $('#cols').empty()
          $('#maintable-head').empty()
          var tr = $('<tr>').appendTo($('#maintable-head'))
          for (var col of host.cols) {
            $('<option>').val(col.name).text(col.text).appendTo('#cols')
            if (col.name == active_col) {
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
                $('<td>').text('不快指数').val('discomfort_index').appendTo(tr)
                $('<td>').text('体感温度').val('apparent_temperature').appendTo(tr)
              }
            }
          }
          query()
        }
      }
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
      const d = JSON.stringify({
        status: 'request',
        host: $('#hosts').val(),
        page: Number($('#pages').val()),
        limit: 100,
        mode: $('#cols option:selected').val()
      })
      console.log('sending query: ', d)
      ws.send(d)
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
      window.location.hash = page;
      query();
    }

    const command = (name) => {
      ws.send(JSON.stringify({
        status: 'command',
        host: $('#hosts').val(),
        name: name,
        data: {}
      }))
    }

    window.onload = init

