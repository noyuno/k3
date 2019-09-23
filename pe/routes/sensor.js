var fs = require('fs');
var strftime = require('strftime');
require('date-utils');

var express = require('express');
var router = express.Router();

var passport = require('passport');
var Strategy = require('passport-http').DigestStrategy;

passport.use(new Strategy({ qop: 'auth' },
  function(username, done) {
    if (!!username && username == process.env.PE_USERNAME) {
      return done(null, process.env.PE_USERNAME, process.env.PE_PASSWORD)
    } else {
      return done(null, false);
    }
  },
  function(params, done) {
    done(null, true)
  }
));


// return directories and today files
router.get('/',
  passport.authenticate('digest', {session: false}), 
  function(req, res, next) {
    try {
      var dirs = fs.readdirSync(imagespath);
      dirs = dirs.filter(function(dir){
        return fs.statSync(imagespath + "/" + dir).isDirectory(); /* && /.*\.csv$/.test(file);*/ //絞り込み
      })
      dirs = dirs.reverse()
      var latestdir = "";

      var files = [];
      if (dirs.length > 0) {
        latestdir = imagespath + "/" + dirs[0];
        try {
          files = fs.readdirSync(latestdir)
          files = files.filter(function(file) {
            console.log("file:" , file)
            return fs.statSync(latestdir + "/" + file).isFile();
            });
          files = files.reverse();
        } catch (err) {
          console.log(err);
        }
      }
      res.render('photos', {
        title: 'Camera photos',
        directories: dirs,
        directory: dirs[0],
        files: files
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
  });

// return files
router.get('/:directory',
  passport.authenticate('digest', {session: false}), 
  function(req, res, next) {
    try {
      var files = fs.readdirSync(imagespath + "/" + req.params.directory);
      var filelist = files.filter(function(file){
          return fs.statSync(imagespath + "/" + req.params.directory + "/" + file).isFile(); /* && /.*\.csv$/.test(file);*/ //絞り込み
      });
      filelist = filelist.reverse()
      res.json({
        'result': 'success',
        'directory': req.params.directory,
        'files': filelist
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
  });

// show a image
router.get('/:directory/:name',
  passport.authenticate('digest', {session: false}), 
  function(req, res, next) {
    try {
      var options = {
        root: imagespath + "/" + req.params.directory,
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      }
      const filename = req.params.name;
      res.sendFile(filename, options, function (err) {
        if (err) {
          next(err);
        }
      })
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
  });

// upload a image
router.post('/sensor', 
  passport.authenticate('digest', {session: false}), 
  upload.single('file'), function(req, res) {
    try {
      res.json({ 'result': 'success' });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
});


module.exports = router;
