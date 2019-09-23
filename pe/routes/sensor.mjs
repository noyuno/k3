import 'fs';
import 'strftime'
import 'date-utils';

import express from 'express';
var _router = express.Router();

import SensorTable, { SensorData } from "./sensordb.mjs"
import {pass} from './passport-digest.mjs';

// show data
_router.get('/',
  async (req, res, next) => {
    try {
      // TODO: pagenation
      const page = 1
      const limit = 500
      const start = (page - 1) * limit
      var sensordata = await SensorTable.list(start, limit)
      
      res.render('sensor', {
        title: 'Sensor Database',
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
_router.post('/sensor', 
  pass.authenticate('digest', {session: false}), 
  async (req, res) => {
    try {
      const sensordata = new SensorData(
        req.body.time, req.body.host, req.body.temperature, req.body.pressure, req.body.humidity, req.body.illuminance, req.body.battery_level, req.body.battery_supply, req.body.memory_usage, req.body.cpu_usage, req.body.disk_usage, req.body.stopping_container, req.body.network_available
      )
      await SensorTable.save(sensordata)
      res.json({ 'result': 'success' });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        'result': 'error',
        'error': err
      });
    }
});


export const router = _router;
