import winston, { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, errors, prettyPrint, colorize } = format;
import { DateTime } from "luxon";
import fs from "fs";
import { isProduction } from "./utils";

const getLogPath = () => {
   try {
      const fullPath = `${process.env.LOGS_PATH}/server.log`;
      fs.accessSync(fullPath, fs.constants.W_OK);
      console.log("returning best permanent for logs", fullPath);
      return fullPath;
   } catch (err) {
      console.log("returning temporary path");
      return "server.log";
   }
};

const myFormat = printf(({ level, message, timestamp, stack }) => {
   if (stack) return `${timestamp} ${level}: ${message}\nStack: ${stack}`;
   return `${timestamp} ${level}: ${message}`;
});

const timezoned = () => {
   return DateTime.now()
      .setZone("Asia/Kolkata")
      .toFormat("yyyy-MM-dd HH:mm:ss");
};

const logger = createLogger({
   level: "debug",
   format: combine(
      errors({ stack: true }), // <-- use errors format
      timestamp({ format: timezoned }),
      prettyPrint(),
      myFormat
   ),
   transports: [
      //
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      //
      new transports.File({ filename: getLogPath() }),
   ],
});

if (!isProduction()) {
   logger.add(
      new winston.transports.Console({
         format: combine(
            errors({ stack: true }), // <-- use errors format
            colorize(),
            timestamp(),
            prettyPrint(),
            myFormat
         ),
      })
   );
}

export default logger;
