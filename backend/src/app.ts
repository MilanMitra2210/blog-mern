import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const createApp = (): Application => {
  const app = express();

  // Security Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  // CORS Configuration
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow dev origins freely
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-site-id'],
    })
  );

  // Request Parsers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Static files for media uploads
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date(),
      uptime: process.uptime(),
      service: 'QuillForge MERN API',
    });
  });

  // Mount API version 1
  app.use('/api/v1', apiRoutes);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
