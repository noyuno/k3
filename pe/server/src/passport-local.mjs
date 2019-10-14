import passport from 'passport'
import localStrategy from 'passport-local'
passport.use(new localStrategy(
  { usernameField: 'token', passwordField: 'password' },
  (token, password, done) => {
    if (!!token && token == process.env.PE_TOKEN) {
      console.log('login success')
      return done(null, process.env.PE_TOKEN, { message: 'login success' })
    } else {
      console.log('login failure')
      return done(null, false, { message: 'login failure' });
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})

export default passport
