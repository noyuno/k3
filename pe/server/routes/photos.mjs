import fs from 'fs';
import strftime from 'strftime'
import date_utils from 'date-utils';

import express from 'express';
export const router = express.Router();

const imagespath = '/data/photos'

import multer from 'multer'
import {photoStorage} from './photoStorage.mjs';
import {pass} from './passport-local.mjs';

// return directories and today files
router.get('/photos',
  pass.authenticate('local'), 
  (req, res, next) => {
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
router.get('/photos/:directory',
  pass.authenticate('local'), 
  (req, res, next) => {
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
router.get('/photos/:directory/:name',
  pass.authenticate('local'), 
  (req, res, next) => {
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
router.post('/photos', 
  pass.authenticate('local'), 
  multer({ storage: photoStorage }).single('file'), 
  (req, res) => {
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
