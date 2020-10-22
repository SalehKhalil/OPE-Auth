const express = require('express')
const redisMiddleware = require('../app/middlewares/redis').redisSession
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')

class App {
  constructor() {
    this.express = express()

    this.database()
    this.middlewares()
    this.routes()
  }

  database() {
    require('./database')
  }

  middlewares() {
    this.express.use(redisMiddleware)
    this.express.use(bodyParser.json())
    this.express.use(cors())
    this.express.use(cookieParser())
  }

  routes() {
    this.express.use(require('../routes'))
  }
}

module.exports = new App().express
