import passport from 'passport'
import passport_http from 'passport-http'
passport.use(new passport_http.DigestStrategy({ qop: 'auth' },
  function(username, done) {
    if (!!username && username == process.env.PE_USERNAME) {
      return done(null, process.env.PE_USERNAME, process.env.PE_PASSWORD)
    } else {
      return done(null, false);
    }
  },
  function(params, done) {
    done(null, true)
  }
));

export const pass = passport
