import expressWinston from "express-winston";
import logger from "../utils/logger";

const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  expressFormat: false,
  colorize: false,
  msg: (req, res) =>
    JSON.stringify({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      userAgent: req.headers["user-agent"],
      ip: req.ip
    })
});

export default requestLogger;
