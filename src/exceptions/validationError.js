class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.message = message
    this.statusCode = statusCode
    this.errorType = 'Validation Error'
  }
}

module.exports = ValidationError
