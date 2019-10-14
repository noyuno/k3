import 'fs';
import 'strftime'
import 'date-utils';

import express from 'express';
export const router = express.Router();

import WebSocket from 'ws'
import crypto from 'crypto'

import SensorTable, { SensorData } from "./sensordb.mjs"
//import {pass} from './passport-local.mjs';

const imagespath = '/data/photos'

// WebSocket
export var wss = null
export const callbacks = {}
router.InitWebSocket = (server, session) => {
  wss = new WebSocket.Server({
    server: server,
    path: '/ws',
    verifyClient: (info, done) => {
      console.log('session.instance: ', session)
      session(info.req, {}, () => {
        done(info.req.session)
      })
    }
  })
  wss.on('connection', (ws, req) => {
    console.log('websocket: connected')

    ws.on('message', async (data) => {
      try {
        //const id = crypto.randomBytes(16).toString('base64').substring(0, 16)
        data = JSON.parse(data)
        console.log('websocket: got message', data)

        if (data.type == 'list') {
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
            status: 'ok',
            type: 'list',
            data: data
          }))
          
        } else if (data.type == 'command') {
          throw 'command has not implemented yet'
        } else if (callbacks[data.type]) {
          callbacks[data.type](ws, data)
        } else {
          throw "this type has not implemented: " + data.type
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

