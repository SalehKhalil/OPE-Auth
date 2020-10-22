const authGoogle = require('../../config/authGoogle')
const UserDao = require('../models/daos/userDao')
const {
  handleEmail,
  validateEmail,
  validateCourse,
  getOpeCourse
} = require('../utils/loginValidator')
const UserError = require('../utils/errors/UserError')

const handleStudent = ({ email, avatar, username, isStudent, courses }) => {
  if (validateCourse(courses)) {
    const { id, section } = getOpeCourse(courses)
    const student = {
      email,
      avatar,
      username,
      isStudent,
      groupId: null,
      courseId: id,
      pcsta: section,
      createAt: Date.now()
    }
    return student
  } else {
    throw new UserError('not authorized', 403)
  }
}

const handleTeacher = ({ email, avatar, username, isStudent }) => {
  const teacher = {
    email,
    avatar,
    username,
    isStudent,
    groupId: null,
    courseId: null,
    pcsta: null,
    createAt: Date.now()
  }
  return teacher
}

const checkUserAndCreateIfNecessary = async (user) => {
  const exists = await UserDao.findByEmail(user.email)
  if (exists) return exists
  else {
    const newUser = await UserDao.createUser(user)
    return newUser
  }
}

class UserController {
  async handleUser (req, res) {
    // Code is used to get the Google OAuth token
    const code = req.query.code || null
    if (!code) {
      res.status(403)
    }
    try {
      const { email, avatar, courses } = await authGoogle.getBasicDataForGoogleAccount(code)
      // Para mockar o seu usuário para professor, descomente a linha abaixo e mude a variavel para let
      // email = email.split('@')[0] + '@faculdadeimpacta.com.br'
      await validateEmail(email)
      const { username, isStudent } = handleEmail(email)
      if (!courses) throw new UserError('not authorized', 403)
      const userData = { email, avatar, username, isStudent, courses }
      let user = isStudent
        ? handleStudent(userData)
        : handleTeacher(userData)
      user = await checkUserAndCreateIfNecessary(user)
      req.session.user = user
      res.status(200).json({ user })
    } catch (err) {
      console.error(err)
      res.status(err.httpStatus || 500).json({ err })
    }
  }

  async updateUser (req, res) {
    try {
      const { data } = req.body
      if (!data || !data.email) throw new UserError('missing some information', 400)
      const query = {
        email: data.email
      }
      const dataToUpdate = {
        $set: data
      }
      const userUpdated = await UserDao.updateUser(query, dataToUpdate)
      res.status(200).json({ user: userUpdated })
    } catch (err) {
      console.error(err)
      res.status(err.httpStatus || 500).json({ err })
    }
  }

  async getMembersByGroupId (req, res) {
    try {
      const { groupId } = req.query
      if (!groupId) throw new UserError('missing groupId', 400)
      const members = await UserDao.findMany({ groupId })
      res.status(200).json({ members })
    } catch (err) {
      console.error(err)
      res.status(err.httpStatus || 500).json({ err })
    }
  }

  async getUserByEmail (req, res) {
    try {
      const { email } = req.query
      const user = await UserDao.findByEmail(email)
      res.status(200).json({ user })
    } catch (err) {
      console.error(err)
      res.status(err.httpStatus || 500).json({ err })
    }
  }
}

module.exports = new UserController()
