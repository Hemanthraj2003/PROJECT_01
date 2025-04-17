//...
const winston = require("winston"); //importing winstone lib...

//creating an instance of logger..
const loggerSchema = winston.createLogger({
  level: "info", // specifing the level of logs that will be logged..
  format: winston.format.combine(
    // will combine multiple format...
    winston.format.timestamp(), //adds timestamp property to the log object...
    winston.format.ms(), // adds ms property to the log object...
    winston.format.printf(({ timestamp, level, message, ms }) => {
      // formatting the final log message..
      return `[${timestamp}]  [${level}]  ${message}      [${ms}]`;
    })
  ),
  // where to log the messages...
  transports: [
    new winston.transports.Console(), // will log in the console...
    new winston.transports.File({ filename: "app.log" }), // creates app.log file and writes log into it...
  ],
});

// creating logger instance for the error logging...
const errorLoggerSchema = winston.createLogger({
  level: "error", // onlys logs error level logs...
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.printf(({ timestamp, level, message, ms }) => {
      return `[${timestamp}]  [${level}]  ${message}    [${ms}]`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }), // creates app.log file and writes log into it...
    new winston.transports.File({ filename: "error.log" }),
  ],
});

// info logger...
const logger = (req, res, next) => {
  const currentDateTime = new Date().toISOString();
  // this will be passed as a message to the loggerschema...
  loggerSchema.info(
    `${req.method} request made to: ${req.url} at ${currentDateTime}`
  );
  next();
};

//error logger...
const errorLogger = (err, req, res, next) => {
  const currentDateTime = new Date().toISOString();
  errorLoggerSchema.error(
    `Error: ${err.message} occurred at ${currentDateTime}. Request Method: ${req.method}, Request URL: ${req.url}`
  );
  next(err); // passing the error to the default error handler...
};

module.exports = {
  logger,
  errorLogger,
};
