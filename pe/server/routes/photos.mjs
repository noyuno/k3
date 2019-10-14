import fs from 'fs';
import strftime from 'strftime'
import date_utils from 'date-utils';

import express from 'express';
export const router = express.Router();

const imagespath = '/data/photos'

import multer from 'multer'
import {photoStorage} from './photoStorage.mjs';
import passport from '../src/passport-local.mjs';
import { wss, callbacks } from './wsapi.mjs';

// return directories and today files
router.get('/photos',
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error', 'not logged in')
    res.redirect('/login?redirect=/photos')
  }, 
  (req, res, next) => {
    res.render('photos')
    // try {
    //   var dirs = fs.readdirSync(imagespath);
    //   dirs = dirs.filter(function(dir){
    //     return fs.statSync(imagespath + "/" + dir).isDirectory(); /* && /.*\.csv$/.test(file);*/ //絞り込み
    //   })
    //   dirs = dirs.reverse()
    //   var latestdir = "";

    //   res.render('photos', {
    //     directories: dirs,
    //   });
    // } catch (err) {
    //   console.error(err);
    //   res.status(500).json({
    //     'result': 'error',
    //     'error': err
    //   });
    // }
  });

// return files list
// router.get('/photos/:host/:date',
//   (req, res, next) => {
//     if (req.isAuthenticated()) {
//       return next()
//     }
//     req.flash('error', 'not logged in')
//     res.redirect('/login?redirect=/photos')
//   }, 
//   (req, res, next) => {
//     try {
//       var files = fs.readdirSync(imagespath + "/" + req.params.host + '/' + req.params.date);
//       var filelist = files.filter(function(file){
//           return fs.statSync(imagespath + "/" + req.params.host + "/" + req.params.date + '/' + file).isFile(); /* && /.*\.csv$/.test(file);*/ //絞り込み
//       });
//       filelist = filelist.reverse()
//       res.json({
//         'result': 'success',
//         'directory': req.params.host + '/' + req.params.date,
//         'files': filelist
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({
//         'result': 'error',
//         'error': err
//       });
//     }
//   });

// return a image
router.get('/photos/:host/:date/:name',
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error', 'not logged in')
    res.redirect('/login?redirect=/photos')
  }, 
  (req, res, next) => {
    try {
      var options = {
        root: imagespath + "/" + req.params.host + '/' + req.params.date,
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
router.post('/photos', 
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.status(403).send('403 forbidden')
  }, 
  multer({
    storage: photoStorage,
    onError: (err, next) => {
      console.error('upload photo error: ', err)
      next(err)
    }
    }).single('file'), 
  (req, res) => {
    try {
      res.json({ 'result': 'success' });
      try {
        wss.clients.forEach((client) => {
          if (client !== wss) {
            client.send(JSON.stringify({
              status: 'ok',
              type: 'photo_upload',
              file: req.params.filename
            }))
          }
        })
      } catch (err) {
        // websocket error
        console.error('websocket error: ', err)
      }        
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
});


callbacks.photos_dates = (ws, data) => {
  try {
    if (!data.host) {
      throw 'host not set'
    }
    var dirs = fs.readdirSync(imagespath + '/' + data.host);
    dirs = dirs.filter(function(dir){
      return fs.statSync(imagespath + "/" + data.host + '/' + dir).isDirectory(); /* && /.*\.csv$/.test(file);*/ //絞り込み
    })
    dirs = dirs.reverse()

    ws.send(JSON.stringify({
      status: 'ok',
      type: 'photos_dates',
      data: dirs
    }))
  } catch (err) {
    console.error(err);
    ws.send(JSON.stringify({
      'type': 'photos_dates',
      'status': 'error',
      'error': err
    }))
  }
}

callbacks.photos = (ws, data) => {
  try {
    if (!data.host || !data.date) {
      throw 'host nor date not set'
    }
    var files = fs.readdirSync(imagespath + "/" + data.host + '/' + data.date);
    var filelist = files.filter(function(file){
        return fs.statSync(imagespath + "/" + data.host + "/" + data.date + '/' + file).isFile(); /* && /.*\.csv$/.test(file);*/ //絞り込み
    });
    filelist = filelist.reverse()
    ws.send(JSON.stringify({
      'status': 'ok',
      'type': 'photos',
      'host': data.host,
      'date': data.date,
      'data': filelist
    }))
  } catch (err) {
    console.error(err);
    ws.send({
      'status': 'error',
      'type': 'photos',
      'error': err
    });
  }
}
