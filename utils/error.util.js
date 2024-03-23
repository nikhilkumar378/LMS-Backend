class AppError extends Error{
  constructor(message, statusCode){
    super(message);

    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);  //kon se line pe, file pe, js pe error fat gyas
  }
}

export default AppError; 