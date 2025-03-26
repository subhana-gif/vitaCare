import winston, { Logger } from 'winston';

const logger: Logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.timestamp(), 
    winston.format.printf(({ timestamp, level, message }: winston.Logform.TransformableInfo) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), 
    new winston.transports.File({ filename: 'logs/app.log' }) 
  ]
});

export default logger;
