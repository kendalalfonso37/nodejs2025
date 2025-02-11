import { StatusCodes, ReasonPhrases } from "http-status-codes";

class ErrorException extends Error {
  public statusCode: number;
  public reason: string;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    reason: string = ReasonPhrases.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.statusCode = statusCode;
    this.reason = reason;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      reason: this.reason,
    };
  }
}

export default ErrorException;
