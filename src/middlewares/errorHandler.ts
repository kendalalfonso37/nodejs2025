import { Request, Response, NextFunction } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import ErrorException from "../exceptions/ErrorException";
import logger from "../utils/logger";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ErrorException) {
    logger.error({
      message: err.message,
      statusCode: err.statusCode,
      reason: err.reason,
      stack: err.stack,
      timestamp: err.timestamp
    });
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  logger.error({
    message: err.message,
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    reason: ReasonPhrases.INTERNAL_SERVER_ERROR,
    stack: err.stack,
    timestamp: new Date()
  });
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong",
    reason: ReasonPhrases.INTERNAL_SERVER_ERROR,
    timestamp: new Date()
  });
};

export default errorHandler;
