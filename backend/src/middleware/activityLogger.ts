import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const activityLogger = (actionName?: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    res.on('finish', async () => {
      // Only log successful mutating actions or explicitly labeled activities
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || actionName) {
        try {
          const action = actionName || `${req.method} ${req.baseUrl}${req.path}`;
          const entityType = req.baseUrl.replace('/api/v1/', '').split('/')[0] || 'general';
          const entityId = req.params?.id || req.body?.id || '';

          await ActivityLog.create({
            user: req.user?.id || null,
            action,
            entityType,
            entityId,
            method: req.method,
            endpoint: req.originalUrl,
            status: res.statusCode,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'] || '',
          });
        } catch (err) {
          console.error('[ActivityLogger Error]:', err);
        }
      }
    });

    next();
  };
};
