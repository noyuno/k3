import passport from 'passport'
import localStrategy from 'passport-local'
passport.use(new localStrategy(
  (username, password, done) => {
    if (!!username && username == process.env.PE_TOKEN) {
      console.log('login success')
      return done(null, process.env.PE_TOKEN, { message: 'login success' })
    } else {
      console.log('login failure')
      return done(null, false, { message: 'login failure' });
    }
  }
));

export const pass = passport
