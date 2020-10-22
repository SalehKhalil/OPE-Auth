const { google } = require('googleapis')
const { createConnection } = require('../../config/authGoogle')
const ActivityError = require('../utils/errors/ActivityError')
const redis = require('../middlewares/asyncRedis')

const generateClassroom = async email => {
  const tokens = await redis.get(email)
  if (!tokens) throw new ActivityError('Missing google token from redis', 401)
  const auth = createConnection()
  auth.setCredentials(tokens)
  return google.classroom({ version: 'v1', auth })
}

class ActivityControlller {
  async getActivities (req, res) {
    try {
      const { pcstaId, email, courseId, pcsta } = req.query
      if (!email || !courseId || !pcsta || !pcstaId) throw new ActivityError('Missing email, pcstaId, courseId and/or pcsta', 400)
      const classroom = await generateClassroom(email)
      const { data: { courseWork } } = await classroom.courses.courseWork.list({ courseId: parseInt(courseId), courseWorkStates: ['PUBLISHED'] })

      res.status(200).json({
        pcsta: {
          title: pcsta,
          courseId,
          _id: pcstaId
        },
        activities: courseWork
      })
    } catch (error) {
      console.error(error)
      res.status(error.httpStatus || 500).json({ error })
    }
  }

  async setActivityGrade (req, res) {
    try {
      const { courseId, email, courseWorkId, studentEmail: userId, sprintGrade } = req.body
      const classroom = await generateClassroom(email)
      const { data } = await classroom.courses.courseWork.studentSubmissions.list({ courseId: parseInt(courseId), courseWorkId: parseInt(courseWorkId), userId })
      let response

      if (data.studentSubmissions) {
        const studentSubmission = data.studentSubmissions[0]
        response = await classroom.courses.courseWork.studentSubmissions.patch({
          courseId: parseInt(courseId),
          courseWorkId: parseInt(courseWorkId),
          id: studentSubmission.id,
          updateMask: 'assignedGrade',
          resource: { assignedGrade: parseInt(sprintGrade) }
        })
      }

      res.status(200).json({ response })
    } catch (error) {
      console.log('error:', error)
      res.status(error.httpStatus || 500).json({ error })
    }
  }

  async publishActivity (req, res) {
    try {
      const { email, courseId, activityId } = req.body
      if (!email || !courseId || !activityId) throw new ActivityError('Missing email, courseId and/or activityId', 400)
      const classroom = await generateClassroom(email)
      await classroom.courses.courseWork.patch({ courseId: parseInt(courseId), id: parseInt(activityId), updateMask: 'state', 'courseWork.state': 'PUBLISHED' })
      res.status(200).json()
    } catch (error) {
      console.error(error)
      res.status(error.httpStatus || 500).json({ error })
    }
  }

  async createActivitiesByPcstas (req, res) {
    try {
      const { email, pcstas } = req.body
      if (!email || !pcstas) throw new ActivityError('Missing email and/or pcstas', 400)
      const requests = []

      for (const pcsta of pcstas) {
        const { courseId } = pcsta
        const classroom = await generateClassroom(email)
        const { data: { courseWork } } = await classroom.courses.courseWork.list({ courseId: parseInt(courseId), courseWorkStates: ['PUBLISHED'] })

        if (courseWork) {
          const activitiesToCreate = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

          for (const activity of courseWork) {
            for (const number of activitiesToCreate) {
              if (number === 10) {
                if (activity.title.includes('1') && activity.title.includes('0')) {
                  const indexToRemove = activitiesToCreate.indexOf(10)
                  activitiesToCreate.splice(indexToRemove, 1)
                  break
                }
              } else {
                if (activity.title.includes(`${number}`)) {
                  const indexToRemove = activitiesToCreate.indexOf(number)
                  activitiesToCreate.splice(indexToRemove, 1)
                  break
                }
              }
            }
          }

          if (activitiesToCreate.length > 0) {
            for (const activityNumber of activitiesToCreate) {
              const courseWork = {
                'courseWork.title': activityNumber === 10 ? `Atividade contínua ${activityNumber}` : `Atividade contínua 0${activityNumber}`,
                'courseWork.state': 'PUBLISHED',
                'courseWork.maxPoints': 10,
                'courseWork.workType': 'ASSIGNMENT'
              }

              requests.push(classroom.courses.courseWork.create({ courseId: parseInt(courseId), ...courseWork }))
            }
          }
        } else {
          for (let i = 1; i < 11; i++) {
            const courseWork = {
              'courseWork.title': i === 10 ? `Atividade contínua ${i}` : `Atividade contínua 0${i}`,
              'courseWork.state': 'PUBLISHED',
              'courseWork.maxPoints': 10,
              'courseWork.workType': 'ASSIGNMENT'
            }

            requests.push(classroom.courses.courseWork.create({ courseId: parseInt(courseId), ...courseWork }))
          }
        }
      }

      await Promise.all(requests)
      res.status(requests.length > 0 ? 201 : 200).json({ activitiesCreated: requests.length || 0 })
    } catch (error) {
      console.error(error)
      res.status(error.httpStatus || 500).json({ error })
    }
  }
}

module.exports = new ActivityControlller()
