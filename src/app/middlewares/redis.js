const session = require('express-session')
const redis = require('redis')
const redisStore = require('connect-redis')(session)
const client = redis.createClient(6379, 'localhost')
const {
  REDIS_HOST,
  REDIS_PORT,
  SESSION_SECRET
} = process.env

client.on('error', (err) => {
  console.log('Redis error: ' + err)
})

client.on('connect', (res) => {
  console.log('Redis connected')
})

exports.redisSession = session({
  secret: SESSION_SECRET,
  store: new redisStore({
    host: REDIS_HOST,
    port: REDIS_PORT,
    client,
    ttl: 260
  }),
  saveUninitialized: false,
  resave: false
})
