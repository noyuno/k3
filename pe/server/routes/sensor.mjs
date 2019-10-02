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
_router.InitWebSocket = (server) => {
  wss = new WebSocket.Server({ server: server, path: '/sensor/ws' })
  wss.on('connection', (ws, req) => {
    console.log('websocket: connected')

    ws.on('message', async (data) => {
      try {
        //const id = crypto.randomBytes(16).toString('base64').substring(0, 16)
        data = JSON.parse(data)
        console.log('websocket: got message', data)

        if (data.status == 'request') {
          if (!data.page || !data.limit || !data.host) {
            const e = 'parameter must set page, limit, host'
            throw e
          }
          const start = (data.page - 1) * data.limit
          var sensordata = await SensorTable.list(start, data.limit, data.host)
          console.log('sensordata: ', sensordata)
          var count = (await SensorTable.count(data.host))[0]
          console.log('count: ', count)
          //ws.send(JSON.stringify({status: 'test'}))
          ws.send(JSON.stringify({
            status: 'success',
            data: sensordata,
            page: data.page,
            limit: data.limit,
            host: data.host,
            count: count,
            start: start
          }))
        } else if (data.status == 'list') {
          var data = {
            default_host: 'pe',
            hosts: [{
              name: 'pe', text: 'pe',
              default_col: 'environment',
              cols: [
                {
                  name: 'all', text: 'すべて',
                  data: [
                    { name: 'time', text: '時刻' },
                    { name: 'temperature', text: '気温' },
                    { name: 'pressure', text: '気圧' },
                    { name: 'humidity', text: '湿度' },
                    { name: 'illuminance', text: '照度' },
                    { name: 'battery_level', text: 'バッテリレベル' },
                    { name: 'battery_supply', text: 'バッテリ供給' },
                    { name: 'memory_usage', text: 'バッテリ使用率' },
                    { name: 'cpu_usage', text: 'CPU使用率' }, 
                    { name: 'disk_usage', text: 'ディスク使用率' },
                    { name: 'stopping_container', text: '停止中のコンテナ' },
                    { name: 'network_available', text: 'ネットワーク接続' }
                  ]
                },
                {
                  name: 'environment', text: '環境',
                  data: [
                    { name: 'time', text: '時刻' },
                    { name: 'temperature', text: '気温' },
                    { name: 'pressure', text: '気圧' },
                    { name: 'humidity', text: '湿度' },
                    { name: 'illuminance', text: '照度' },
                  ]
                }
              ],
              commands: [
                { name: 'air_conditioner_dehumidification', text: 'エアコン除湿' },
                { name: 'air_conditioner_off', text: 'エアコン停止' },
                { name: 'illumination_on', text: '電灯点灯' },
                { name: 'illumination_off', text: '電灯消灯' },
                { name: 'camera', text: '撮影' }
              ]
            }
            ]
          }
          ws.send(JSON.stringify({
            status: 'list',
            data: data
          }))
          
        } else if (data.status == 'command') {
          throw 'command has not implemented yet'
        } else {
          throw "this mode has not implemented: " + data.mode
        }
      } catch (err) {
        console.error('websocket error: ', err)
        ws.send(JSON.stringify({
          'status': 'error',
          'error': err
        }))
      }
    })
  })
  console.log('websocket: initialized')
}

// provide window
_router.get('/sensor',
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
  });

// insert data
_router.post('/sensor', 
  pass.authenticate('digest', {session: false}), 
  async (req, res) => {
    try {
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
                status: 'report',
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
                status: 'action',
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
  });


export const router = _router;
