class ActivityError extends Error {
  constructor(args, httpStatus = '') {
    super(args)
    this.name = 'ActivityError'
    this.errorMessage = args
    this.httpStatus = httpStatus
    console.error(this)
  }
}

module.exports = ActivityError
