import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, IUserPayload } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';
import { User, IUser } from '../models/User.js';
import { ALL_PERMISSION_KEYS, DEFAULT_USER_PERMISSIONS } from '../constants/permissions.js';

export function resolveUserPermissions(user: IUser): string[] {
  if (user.role === 'ADMIN') {
    return ALL_PERMISSION_KEYS;
  }
  if (user.roleId && typeof user.roleId === 'object' && Array.isArray((user.roleId as any).permissions)) {
    return (user.roleId as any).permissions;
  }
  return DEFAULT_USER_PERMISSIONS;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.error(res, 'Authentication required: No Bearer token provided', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'quillforge_secret_jwt_key_2026';

    const decoded = jwt.verify(token, secret) as IUserPayload;

    // Verify user exists and is not blocked / soft deleted, and populate roleId
    const user = await User.findOne({ _id: decoded.id, isDeleted: false }).populate('roleId');
    if (!user) {
      ApiResponse.error(res, 'User no longer exists', 401);
      return;
    }

    if (user.blocked) {
      ApiResponse.error(res, `Account blocked: ${user.blockReason || 'Contact admin'}`, 403);
      return;
    }

    const permissions = resolveUserPermissions(user);
    const roleIdStr = user.roleId
      ? (user.roleId as any)._id
        ? (user.roleId as any)._id.toString()
        : user.roleId.toString()
      : null;

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      roleId: roleIdStr,
      permissions,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      ApiResponse.error(res, 'Access token has expired', 401);
      return;
    }
    ApiResponse.error(res, 'Invalid or malformed access token', 401);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'quillforge_secret_jwt_key_2026';
      const decoded = jwt.verify(token, secret) as IUserPayload;
      const user = await User.findOne({ _id: decoded.id, isDeleted: false }).populate('roleId');
      if (user && !user.blocked) {
        const permissions = resolveUserPermissions(user);
        const roleIdStr = user.roleId
          ? (user.roleId as any)._id
            ? (user.roleId as any)._id.toString()
            : user.roleId.toString()
          : null;

        req.user = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          roleId: roleIdStr,
          permissions,
        };
      }
    }
    next();
  } catch {
    next();
  }
};
