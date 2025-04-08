import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    res.status(HttpStatus.BAD_REQUEST).json({ 
      success: false,
      error: err.message 
    });
    return;
  }

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;