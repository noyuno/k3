import 'fs';
import 'strftime'
import 'date-utils';

import express from 'express';
export const router = express.Router();

import WebSocket from 'ws'
import crypto from 'crypto'

import SensorTable, { SensorData } from "./sensordb.mjs"
//import {pass} from './passport-local.mjs';
import { wss, callbacks } from './wsapi.mjs';

// provide window
router.get('/sensor',
  (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error', 'not logged in')
    res.redirect('/login?redirect=/sensor')
  }, 
  async (req, res, next) => {
    try {
      var mode = req.params.mode

      res.render('sensor', {});
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'status': 'error',
        'error': err
      });
    }
  }
)

// insert data
router.post('/sensor', 
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.status(403).send('403 forbidden')
  }, 
  async (req, res) => {
    try {
      //if (req.body.token != process.env.get('TOKEN')) {
      //  res.status(403).json({ 'status': 'unauthorized' })
      //  return
      //}
      if (req.body.status == 'report') {
        const sensordata = new SensorData(
          req.body.time, req.body.host, req.body.temperature, req.body.pressure, req.body.humidity, req.body.illuminance, req.body.battery_level, req.body.battery_supply, req.body.memory_usage, req.body.cpu_usage, req.body.disk_usage, req.body.stopping_container, req.body.network_available
        )
        for (d of sensordata) {
          await SensorTable.save(d)
        }
        res.json({ 'status': 'success' });
        try {
          wss.clients.forEach((client) => {
            if (client !== wss) {
              client.send({
                status: 'sensor_report',
                data: sensordata
              })
            }
          })
        } catch (err) {
          // websocket error
          console.error('websocket error: ', err)
        }
      } else if (req.body.status == 'command') {
        if (!(req.body.host && req.body.time && req.body.name && req.body.data)) {
          throw 'requires host, time, name, data in json'
        }
        res.json({ 'status': 'success' });
        try {
          wss.clients.forEach((client) => {
            if (client !== wss) {
              client.send({
                status: 'command',
                time: req.body.time,
                host: req.body.host,
                data: req.body.data
              })
            }
          })
        } catch (err) {
          // websocket error
          console.error('websocket error: ', err)
        }        
      } else {
        throw 'unknown status: ' + req.body.status
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'status': 'error',
        'error': err
      });
    }
  }
)


callbacks.sensor_data = (ws, data) => {
  try {
    if (!data.page || !data.limit || !data.host) {
      const e = 'parameter must set page, limit, host';
      throw e;
    }
    const start = (data.page - 1) * data.limit;
    const sensordata = SensorTable.list(start, data.limit, data.host);
    //const sensordata = await SensorTable.list(start, data.limit, data.host);
    console.log('sensordata: ', sensordata);
    const count = (SensorTable.count(data.host))[0];
    //const count = (await SensorTable.count(data.host))[0];
    console.log('count: ', count);
    //ws.send(JSON.stringify({status: 'test'}))
    ws.send(JSON.stringify({
      status: 'ok',
      type: 'sensor_data',
      data: sensordata,
      page: data.page,
      limit: data.limit,
      host: data.host,
      count: count,
      start: start
    }));
  } catch (err) {
    ws.send(JSON.stringify({
      status: 'error',
      type: 'sensor_data',
      error: err
    }))
  }
}
