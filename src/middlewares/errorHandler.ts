import { Request, Response, NextFunction } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import ErrorException from "../exceptions/ErrorException";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ErrorException) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong",
    reason: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

export default errorHandler;
