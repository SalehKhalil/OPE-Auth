const express = require('express')
const routes = express.Router()
const LoginController = require('./app/controllers/LoginController')
const UserController = require('./app/controllers/UserController')
const ActivityController = require('./app/controllers/ActivityController')

routes.get('/', (req, res) => res.status(200).json({ message: 'Up and running!' }))
routes.get('/googleUrl', LoginController.loginWithGoogle)
routes.get('/logout', LoginController.logout)
routes.get('/callbackGoogle*', UserController.handleUser)
routes.patch('/updateUser', UserController.updateUser)
routes.get('/getMembersByGroupId', UserController.getMembersByGroupId)
routes.get('/getUserByEmail', UserController.getUserByEmail)
routes.get('/getActivities', ActivityController.getActivities)
routes.patch('/publishActivity', ActivityController.publishActivity)
routes.post('/setActivityGrade', ActivityController.setActivityGrade)
routes.post('/createActivitiesByPcstas', ActivityController.createActivitiesByPcstas)

module.exports = routes
