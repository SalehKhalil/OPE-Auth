const { google } = require('googleapis')
const redis = require('../app/middlewares/asyncRedis')
const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  REDIRECT_URI: redirect_uri
} = process.env

const defaultScope = [
  // 'https://www.googleapis.com/auth/classroom.announcements',
  // 'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  // 'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  // 'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
  // 'https://www.googleapis.com/auth/classroom.guardianlinks.students',
  // 'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
  // 'https://www.googleapis.com/auth/classroom.profile.emails',
  // 'https://www.googleapis.com/auth/classroom.profile.photos',
  // 'https://www.googleapis.com/auth/classroom.push-notifications',
  // 'https://www.googleapis.com/auth/classroom.rosters',
  // 'https://www.googleapis.com/auth/classroom.rosters.readonly',
  // 'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  // 'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  // 'https://www.googleapis.com/auth/classroom.topics',
  // 'https://www.googleapis.com/auth/classroom.topics.readonly',
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email'
]

const createConnection = () => {
  return new google.auth.OAuth2(clientId, clientSecret, redirect_uri)
}

const _getGooglePlusAPI = auth => {
  return google.plus({ version: 'v1', auth })
}

const _getGoogleClassroomAPI = auth => {
  return google.classroom({ version: 'v1', auth })
}

const _getConnectionUrl = auth => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  })
}

module.exports = {
  urlGoogle: () => {
    const auth = createConnection()
    const url = _getConnectionUrl(auth)
    return url
  },

  createConnection,

  getBasicDataForGoogleAccount: async code => {
    try {
      const auth = createConnection()
      const data = await auth.getToken(code)
      const tokens = data.tokens
      auth.setCredentials(tokens)

      const plus = _getGooglePlusAPI(auth)
      const classroom = _getGoogleClassroomAPI(auth)
      const { data: { courses } } = await classroom.courses.list()
      // In googleapis 'me' means the current user
      const { data: { emails, image: { url } } } = await plus.people.get({ userId: 'me' })
      const userGoogleEmail =
        emails &&
        emails.length &&
        emails[0].value

      // redis.set('saleh.junior@faculdadeimpacta.com.br', tokens)
      redis.set(userGoogleEmail, tokens)
      return {
        email: userGoogleEmail,
        avatar: url,
        courses
      }
    } catch (err) {
      return err
    }
  }
}
