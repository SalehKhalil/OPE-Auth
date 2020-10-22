const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  isStudent: {
    type: Boolean,
    required: true
  },
  groupId: {
    type: String,
    required: false
  },
  courseId: {
    type: Number,
    required: false
  },
  pcsta: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = {
  User: mongoose.model('User', UserSchema)
}
