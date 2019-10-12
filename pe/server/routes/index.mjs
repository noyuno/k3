import express from 'express';
export const router = express.Router();
router.get('/',
  (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
  },
  (req, res, next) => {
    res.redirect('/sensor')
  }
)
