import winston, { Logger } from 'winston';

const logger: Logger = winston.createLogger({
  level: 'info', // Log levels: error, warn, info, http, verbose, debug, silly
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps
    winston.format.printf(({ timestamp, level, message }: winston.Logform.TransformableInfo) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Show logs in console
    new winston.transports.File({ filename: 'logs/app.log' }) // Store logs in file
  ]
});

export default logger;
