import express from 'express';
export const router = express.Router();
router.get('/',
  (req, res, next) => {
    if (req.isAuthenticated()) {
      res.render('index', { info: 'Already logged in' })
    } else {
      res.render('index', { info: 'Not logged in' })
    }
  }
)
