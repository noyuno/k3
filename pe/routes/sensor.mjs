import 'fs';
import 'strftime'
import 'date-utils';

import express from 'express';
var _router = express.Router();

import WebSocket from 'ws'
import crypto from 'crypto'

import SensorTable, { SensorData } from "./sensordb.mjs"
import {pass} from './passport-digest.mjs';

var wss = null
_router.InitWebSocket = async (server) => {
  wss = new WebSocket.Server({ server: server, path: '/sensor/ws' })
  wss.on('connection', (ws, req) => {
    //const id = crypto.randomBytes(16).toString('base64').substring(0, 16)
    console.log('websocket: connected')
    const page = 1
    const limit = 500
    const start = (page - 1) * limit
    SensorTable.list(start, limit).then((sensordata) => {
      console.log('sensordata', sensordata)
      //ws.send(JSON.stringify({result: 'test'}))
      ws.send(JSON.stringify({
        result: 'latest',
        data: sensordata
      }))
    })
  })
}

// provide window
_router.get('/sensor',
  async (req, res, next) => {
    try {
      res.render('sensor',
        {
          colnames : ['time', 'host', 'temperature', 'pressure', 'humidity', 'illuminance', 'battery_level', 'battery_supply', 'memory_usage', 'cpu_usage', 'disk_usage', 'stopping_container', 'network_available']
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
  });

// provide data
_router.get('/sensor/data',
  async (req, res, next) => {
    try {
      const page = 1
      const limit = 500
      const start = (page - 1) * limit
      var sensordata = await SensorTable.list(start, limit)
      
      res.json({
        result: 'success',
        page: page,
        data: sensordata
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
  });

// insert data
_router.post('/sensor/data', 
  pass.authenticate('digest', {session: false}), 
  async (req, res) => {
    try {
      const sensordata = new SensorData(
        req.body.time, req.body.host, req.body.temperature, req.body.pressure, req.body.humidity, req.body.illuminance, req.body.battery_level, req.body.battery_supply, req.body.memory_usage, req.body.cpu_usage, req.body.disk_usage, req.body.stopping_container, req.body.network_available
      )
      await SensorTable.save(sensordata)
      res.json({ 'result': 'success' });
      try {
        wss.clients.forEach((client) => {
          if (client !== wss) {
            client.send({
              result: 'update',
              data: [ sensordata ]
            })
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


export const router = _router;
