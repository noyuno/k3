import sqlite3 from "sqlite3"
import fs from 'fs';

// ファイルに対応した、ただ１つのインスタンス
let database

export class DBCommon {
  static init() {
    try { fs.mkdirSync('/data/sensor') } catch { }
    database = new sqlite3.Database("/data/sensor/sensor.sqlite3")
  }
  static get() {
    return database
  }
}

export class SensorData {
    constructor(time, host, temperature, pressure, humidity, illuminance, battery_level, battery_supply, memory_usage, cpu_usage, disk_usage, stopping_container, network_available) {
      this.time = time
      this.host = host
      this.temperature = temperature
      this.pressure = pressure
      this.humidity = humidity
      this.illuminance = illuminance
      this.battery_level = battery_level
      this.battery_supply = battery_supply
      this.memory_usage = memory_usage
      this.cpu_usage = cpu_usage
      this.disk_usage = disk_usage
      this.stopping_container = stopping_container
      this.network_available = network_available
    }
}

const sensorTableName = "sensorv1"

export default class SensorTable {
  static async createTableIfNotExists() {
    const db = DBCommon.get()
    return new Promise((resolve, reject) => {
      try {
        db.serialize(() => {
          db.run(`create table if not exists ${sensorTableName} (
            id integer primary key autoincrement,
            time integer,
            host text,
            temperature real,
            pressure real,
            humidity real,
            illuminance integer,
            battery_level integer,
            battery_supply integer,
            memory_usage integer,
            cpu_usage integer,
            disk_usage integer,
            stopping_container text,
            network_available integer
          )`)
        })
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  }

  static async save(sensor) {
    const db = DBCommon.get()
    return new Promise((resolve, reject) => {
      try {
        db.run(`insert or replace into ${sensorTableName} 
        (time, host, temperature, pressure, humidity, illuminance, battery_level, battery_supply, memory_usage, cpu_usage, disk_usage, stopping_container, network_available) 
        values ($time, $host, $temperature, $pressure, $humidity, $illuminance, $battery_level, $battery_supply, $memory_usage, $cpu_usage, $disk_usage, $stopping_container, $network_available)`,
            sensor.time, sensor.host, sensor.temperature, sensor.pressure, sensor.humidity, sensor.illuminance, sensor.battery_level, sensor.battery_supply, sensor.memory_usage, sensor.cpu_usage, sensor.disk_usage, sensor.stopping_container, sensor.network_available
        )
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  }

  static async count() {
    const db = DBCommon.get()
    return new Promise((resolve, reject) => {
      db.get(`select count(*) from ${sensorTableName}`, (err, row) => {
        if (err) return reject(err)
        return resolve(row["count(*)"])
      })
    })
  }

  static async list(offset, limit) {
    const db = DBCommon.get()
    const result = []
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`select * from ${sensorTableName}
        order by id desc limit ${limit} offset ${offset}`,
          (err, rows) => {
            if (err) return reject(err)
            rows.forEach(row => {
              result.push(new SensorData(row['time'], row['host'], row['temperature'], row['pressure'], row['humidity'], row['illuminance'], row['battery_level'], row['battery_supply'], row['memory_usage'], row['cpu_usage'], row['disk_usage'], row['stopping_container'], row['network_available']))
            })
            return resolve(result)
          })
      })
    })
  }

  static async delete(sensor) {
    const db = DBCommon.get()
    return new Promise((resolve, reject) => {
      try {
        db.run(`delete from ${userTableName} where id = $id`, sensor.id)
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  }
}
