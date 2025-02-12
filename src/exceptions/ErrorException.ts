import { StatusCodes, ReasonPhrases } from "http-status-codes";

class ErrorException extends Error {
  public statusCode: number;
  public reason: string;
  public timestamp: Date;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    reason: string = ReasonPhrases.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.statusCode = statusCode;
    this.reason = reason;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      reason: this.reason,
      timestamp: this.timestamp
    };
  }
}

export default ErrorException;
