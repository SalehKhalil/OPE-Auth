const redis = require('redis')
const {
  promisify
} = require('util')
const {
  REDIS_HOST,
  REDIS_PORT
} = process.env

// Define cache object
const cache = {
  client: null,
  get: undefined,
  set: undefined,
  del: undefined,
  keys: undefined
}

// Connect to redis
cache.client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT
})
cache.client
  .on('error', error => {
    throw error
  })

// Promifisy redis client functions
cache.get = promisify(cache.client.get).bind(cache.client)
cache.set = promisify(cache.client.set).bind(cache.client)
cache.del = promisify(cache.client.del).bind(cache.client)
cache.keys = promisify(cache.client.keys).bind(cache.client)

exports.get = async (key) => {
  const value = await cache.get(key)
  return JSON.parse(value)
}

exports.set = async (key, value, expiryMinutes = 0) => {
  if (expiryMinutes > 0) {
    await cache.set(key, JSON.stringify(value), 'EX', expiryMinutes * 60)
  } else {
    await cache.set(key, JSON.stringify(value))
  }
}

exports.delete = async (key) => {
  await cache.del(key)
}
