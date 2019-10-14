import multer from 'multer';
import fs from 'fs';

const imagespath = '/data/photos'

const _photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 0: hostname
    // 1: date
    // 2: time
    const s = file.originalname.split("-")
    if (s.length != 3) {
      throw 'illegal filename'
    }
    const dir = imagespath + "/" + s[0] + '/' + s[1];
    try { fs.mkdirSync(dir, { recursive: true }) } catch(e) { if (e.code != 'EEXIST') console.log(e) }
    console.log("dir: ", dir)
    req.params.directory = dir
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    console.log(file.originalname)
    req.params.filename = file.originalname
    cb(null, file.originalname)
  }
})
export const photoStorage = _photoStorage
