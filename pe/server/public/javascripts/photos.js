import command from './command.js'
import websocket from './websocket.js';

const getPhotos = () => {
  if ($('#dates') == "none") {
    return
  }
  websocket.send({
    'type': 'photos',
    'host': $('#hosts').val(),
    'date': $('#dates').val()
  })
};

const newDate = () => {
  const current = $('#dates').prop('selectedIndex');
  if (current > 0) {
    $('#dates').prop('selectedIndex', current - 1);
    getPhotos();
  }
};

var ws = null

const oldDate = () => {
  const current = $('#dates').prop('selectedIndex');
  const length = $('#dates').children().length;
  if (current < length - 1) {
    $('#dates').prop('selectedIndex', current + 1);
    getPhotos();
  }
};

const initializeGallery = () => {
  document.querySelectorAll('.galleryitem').forEach((f)=>{
      new Luminous(f, { arrowNavigation: true });
    });
};


const changeHost = () => {
  command.updateCommand($('#hosts').val())
  getPhotos()
}


const setDates = (d) => {
  $('#dates').empty()
  if (d.data == undefined) {
    $('<option>').attr('value', 'none').text('none').appendTo('#dates')
    return null
  } else {
    for (var i of d.data) {
      $('<option>').attr('value', i).text(i).appendTo('#dates')
    }
    return d.data[0]
  }
}

const setPhotos = (d) => {
  $('#list').empty()
  for (var f of d.data) {
    const src = '/photos/' + d.host + '/' + d.date + '/' + f;
    var img = $('<img>').attr({
      src: src,
      class: 'list-img'});
    var a = $('<a>').attr({
      href: src,
      target: '_blank',
      class: 'galleryitem' }).append(img);
    var caption = $('<div>').attr({ class: 'list-caption'}).text(f.match(/(.*)(?:\.([^.]+$))/)[1].split('-')[2]);
    var item = $('<div>').attr({class: 'item'}).append(caption).append(a);
    $('#list').append(item);
  }
  initializeGallery()
}

window.onload = () => {  
  // command & photo upload event
  websocket.init({
    open: (d) => {
      websocket.send({ type: 'list' })
    },
    list: (d) => {
      const active_host = command.initCommand(d)
      websocket.send({ type: 'photos_dates', host: $('#hosts').val() })
    },
    photo_upload: (d) => {
      const s = d.file.split('-')
      if ($('#hosts').val() == s[0] && $('#dates').val() == s[1]) {
        getPhotos()
      }
    },
    photos_dates: (d) => {
      const latest = setDates(d)
      websocket.send({
        type: 'photos',
        host: $('#hosts').val(),
        date: latest
      })
    },
    photos: setPhotos
  })

  $('#new-date').on('click', newDate)
  $('#old-date').on('click', oldDate)
  $('#dates').on('change', getPhotos)
  $('#hosts').on('click', changeHost)
}
