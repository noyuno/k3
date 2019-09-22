var fs = require('fs');
var strftime = require('strftime');
require('date-utils');

var express = require('express');
var router = express.Router();

const imagespath = '/data/photos'
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = imagespath + "/" + file.originalname.split("-")[0];
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })


var passport = require('passport');
var Strategy = require('passport-http').DigestStrategy;

passport.use(new Strategy({ qop: 'auth' },
  function(username, done) {
    if (!!username && username == process.env.CAMERA_USERNAME) {
      return done(null, process.env.CAMERA_USERNAME, process.env.CAMERA_PASSWORD)
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
      console.log('return directories and today files')
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
      res.render('index', {
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
router.get('/images/:directory',
  passport.authenticate('digest', {session: false}), 
  function(req, res, next) {
    console.log('return files');
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
router.get('/images/:directory/:name',
  passport.authenticate('digest', {session: false}), 
  function(req, res, next) {
    try {
      console.log('show a image');
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
router.post('/', 
  passport.authenticate('digest', {session: false}), 
  upload.single('file'), function(req, res) {
    console.log(req.file.path, req.file.originalname);
    try {
      res.json({ 'result': 'success' });
      uploadtimeout = setTimeout(() => {
        const t = 'Could not receive photos from A in the last hour';
        console.error(t);
        
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
});
// 


module.exports = router;
