class AppError extends Error {
  constructor(error, message, statusCode) {
    super(message);
    this.name = "AppError";
    this.error = error;
    this.statusCode = statusCode;
  }
}

module.exports = { AppError };
