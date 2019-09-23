import multer from 'multer';
import fs from 'fs';

const imagespath = '/data/photos'

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = imagespath + "/" + file.originalname.split("-")[0];
    try { fs.mkdirSync(dir) } catch { }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
export const upload = multer({ storage: storage })
