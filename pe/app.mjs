import fs from 'fs'
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import url from 'url'
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import {router as photosRouter} from './routes/photos.mjs'
import {router as sensorRouter} from './routes/sensor.mjs'
import removeold from './removeold.js';

var _app = express();


// var passport = require('passport');
// var Strategy = require('passport-http').DigestStrategy;

// passport.use(new Strategy({ qop: 'auth' },
//   function(username, done) {
//     if (!!username && username == process.env.PE_USERNAME) {
//       return done(null, process.env.PE_USERNAME, process.env.PE_PASSWORD)
//     } else {
//       return done(null, false);
//     }
//   },
//   function(params, done) {
//     done(null, true)
//   }
// ));
// app.use(passport.initialize());


// view engine setup
_app.set('views', path.join(__dirname, 'views'));
_app.set('view engine', 'jade');

_app.use(logger('dev'));
_app.use(express.json());
_app.use(express.urlencoded({ extended: false }));
_app.use(cookieParser());
_app.use(express.static(path.join(__dirname, 'public')));

_app.use('/', photosRouter);
_app.use('/', sensorRouter);
//app.use('/users', usersRouter);

// app.post('/',
//   passport.authenticate('digest', { session: false })
// );
// catch 404 and forward to error handler
_app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
_app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

removeold.run_schedule(7);

// initialize data dir
try { fs.mkdirSync('/data/photos') } catch (e) { console.log(e) }

import SensorTable, {DBCommon} from "./routes/sensordb.mjs"
DBCommon.init()
SensorTable.createTableIfNotExists()

export const app = _app;
