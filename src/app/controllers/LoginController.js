const authGoogle = require('../../config/authGoogle')
const redis = require('../middlewares/asyncRedis')

class LoginController {
  loginWithGoogle (req, res) {
    const googleUrl = authGoogle.urlGoogle()
    res.json({ googleUrl })
  }

  logout (req, res) {
    return req.session.destroy(error => {
      if (error) {
        res.sendStatus(500).json({ error })
      } else {
        const { email } = req.query
        if (email) redis.delete(email)
        res.sendStatus(200)
      }
    })
  }
}

module.exports = new LoginController()
