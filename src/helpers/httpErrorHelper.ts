import { Response } from "express";
import ErrorException from "../exceptions/ErrorException";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export const getBadRequest = (res: Response, message: string) => {
  return res
    .status(StatusCodes.BAD_REQUEST)
    .json(new ErrorException(message, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST));
};

export const getUnauthorized = (res: Response, message: string) => {
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json(new ErrorException(message, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED));
};

export const getForbidden = (res: Response, message: string) => {
  return res
    .status(StatusCodes.FORBIDDEN)
    .json(new ErrorException(message, StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN));
};

export const getNotFound = (res: Response, message: string) => {
  return res
    .status(StatusCodes.NOT_FOUND)
    .json(new ErrorException(message, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND));
};

export const getConflict = (res: Response, message: string) => {
  return res
    .status(StatusCodes.CONFLICT)
    .json(new ErrorException(message, StatusCodes.CONFLICT, ReasonPhrases.CONFLICT));
};

export const getInternalServerError = (res: Response, message: string) => {
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json(
      new ErrorException(
        message,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      )
    );
};
