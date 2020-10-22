const { User } = require('../schemas/User')
const UserError = require('../../utils/errors/UserError')

class UserDao {
  findByEmail(email) {
    return User.findOne({ email })
  }

  findMany(query) {
    return User.find(query)
  }

  createUser(user) {
    try {
      return User.create(user)
    } catch (error) {
      throw new UserError('missing some user information', 400)
    }
  }

  updateUser(query, data) {
    try {
      return User.findOneAndUpdate(query, data, { new: true })
    } catch (error) {
      throw new UserError('missing some user information', 400)
    }
  }
}

module.exports = new UserDao()
