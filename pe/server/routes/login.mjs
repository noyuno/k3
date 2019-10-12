import express from 'express'
import passport from 'passport'
export const router = express.Router();
router.get('/login', (req, res, next) => {
    console.log('login page')
    res.render('login')
  }
)

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
    failureFlash: true,
    successFlash: true
}),
  (req, res, next) => {
    res.redirect('/')
  })

