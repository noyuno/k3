var fs = require('fs');
var strftime = require('strftime');
require('date-utils');

// remove scheduler
const imagespath = '/data/photos'

exports.run = (day) => {
  // get 7 day ago datetime
  console.log('removing old photos')
  var d7 = Number(strftime('%Y%m%d', new Date((new Date()).getTime() - 1000 * 60 * 60 * 24 * day)));
  var dirs = fs.readdirSync(imagespath);
  dirs = dirs.filter(function(dir){
    return fs.statSync(imagespath + "/" + dir).isDirectory();
  });
  for (var d of dirs.sort()) {
    if (Number(d) < d7) {
      // delete
      for (var file of fs.readdirSync(imagespath + "/" + d)) {
        fs.unlinkSync(imagespath + "/" + d + "/" + file);
      }
      fs.rmdirSync(imagespath + "/" + d);
    } else {
      break;
    }
  }
  console.log('finished removing old photos')
};

exports.run_schedule = (day) => {
  const cron = require('node-cron');
  cron.schedule('42 43 14 * * *', () => { exports.run(day); });
};
