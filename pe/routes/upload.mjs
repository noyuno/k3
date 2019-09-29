import multer from 'multer';
import fs from 'fs';

const imagespath = '/data/photos'

var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = imagespath + "/" + file.originalname.split("-")[0];
    try { fs.mkdirSync(dir) } catch { }
    console.log("dir: ", dir)
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    console.log(file.originalname)
    cb(null, file.originalname)
  }
})
export const upload = multer({ storage: _storage })
