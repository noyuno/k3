import express from 'express'
import passport from '../src/passport-local.mjs';
export const router = express.Router();
router.get('/login', (req, res, next) => {
    console.log('login page')
    res.render('login', {
      error: req.flash('error'),
      info: req.flash('info'),
      redirect: req.query.redirect
    })
  }
)

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: true
}),
  (req, res, next) => {
    if (req.query.redirect) {
      res.redirect(req.query.redirect)
    } else {
      res.redirect('/')
    }
  })

