import { Response } from 'express';
import  Logger  from './logger';

export const handleErrorResponse = (res: Response, error: unknown, defaultMessage: string) => {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  Logger.error(errorMessage, error);
  res.status(500).json({ message: errorMessage });
};