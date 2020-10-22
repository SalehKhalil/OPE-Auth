class UserError extends Error {
  constructor(args, httpStatus = '') {
    super(args)
    this.name = 'UserError'
    this.errorMessage = args
    this.httpStatus = httpStatus
    console.error(this)
  }
}

module.exports = UserError
