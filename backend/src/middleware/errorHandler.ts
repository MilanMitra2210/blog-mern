import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error Details]:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
  }

  ApiResponse.error(res, message, statusCode, err.errors || undefined);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
