import fs from 'fs'
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import url from 'url'
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import nanoid from 'nanoid'
import connectFlash from 'connect-flash'

import {router as indexRouter} from '../routes/index.mjs'
import {router as photosRouter} from '../routes/photos.mjs'
import {router as sensorRouter} from '../routes/sensor.mjs'
import SensorTable, {DBCommon} from "../routes/sensordb.mjs"
import {router as loginRouter} from '../routes/login.mjs'
import removeold from './removeold.js';

export const app = express();



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
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
//app.use(connectFlash)

app.use('/', indexRouter);
app.use('/', photosRouter);
app.use('/', sensorRouter);
app.use('/', loginRouter)
//app.use('/users', usersRouter);

// app.post('/',
//   passport.authenticate('digest', { session: false })
// );
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

removeold.run_schedule(7);

// initialize data dir
try { fs.mkdirSync('/data/photos') } catch (e) { if (e.code != 'EEXIST') console.log(e) }

DBCommon.init()
SensorTable.createTableIfNotExists()

// websocket
app.InitWebSocket = (server) => {
  sensorRouter.InitWebSocket(server)
}
