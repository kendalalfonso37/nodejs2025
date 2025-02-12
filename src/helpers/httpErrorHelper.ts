import ErrorException from "../exceptions/ErrorException";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export const getBadRequest = (message: string) => {
  return new ErrorException(message, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
};

export const getUnauthorized = (message: string) => {
  return new ErrorException(message, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
};

export const getForbidden = (message: string) => {
  return new ErrorException(message, StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
};

export const getNotFound = (message: string) => {
  return new ErrorException(message, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
};

export const getConflict = (message: string) => {
  return new ErrorException(message, StatusCodes.CONFLICT, ReasonPhrases.CONFLICT);
};

export const getInternalServerError = (message: string) => {
  return new ErrorException(
    message,
    StatusCodes.INTERNAL_SERVER_ERROR,
    ReasonPhrases.INTERNAL_SERVER_ERROR
  );
};
