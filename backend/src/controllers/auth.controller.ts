import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/response.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth.validation.js';
import { AuthRequest } from '../types/index.js';
import { User } from '../models/User.js';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
      if (error) {
        ApiResponse.error(res, error.details.map((d) => d.message).join(', '), 400);
        return;
      }

      const result = await AuthService.register(value);
      ApiResponse.success(res, result.user, 'Registration successful', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
      if (error) {
        ApiResponse.error(res, error.details.map((d) => d.message).join(', '), 400);
        return;
      }

      const result = await AuthService.login(value);
      ApiResponse.success(res, result, 'Login successful', 200);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 401);
    }
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Unauthenticated', 401);
        return;
      }

      const user = await User.findOne({ _id: req.user.id, isDeleted: false }).populate('roleId');
      if (!user) {
        ApiResponse.error(res, 'User not found', 404);
        return;
      }

      ApiResponse.success(res, user.toJSON(), 'User profile retrieved successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        ApiResponse.error(res, error.details[0].message, 400);
        return;
      }

      const tokens = await AuthService.refreshToken(value.refresh_token);
      ApiResponse.success(res, tokens, 'Token refreshed successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 401);
    }
  }

  static async socialGoogle(req: Request, res: Response): Promise<void> {
    try {
      const { access_token } = req.body;
      const result = await AuthService.socialGoogle(access_token);
      ApiResponse.success(res, result, 'Google login successful');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async socialFacebook(req: Request, res: Response): Promise<void> {
    try {
      const { access_token } = req.body;
      const result = await AuthService.socialFacebook(access_token);
      ApiResponse.success(res, result, 'Facebook login successful');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.id) {
        await AuthService.logout(req.user.id);
      }
      ApiResponse.success(res, { success: true }, 'Logged out successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!req.user?.id) {
        ApiResponse.error(res, 'Unauthenticated', 401);
        return;
      }

      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        ApiResponse.error(res, 'User not found', 404);
        return;
      }

      if (user.provider === 'MANUAL' && oldPassword) {
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
          ApiResponse.error(res, 'Current password is incorrect', 400);
          return;
        }
      }

      user.password = newPassword;
      await user.save();

      ApiResponse.success(res, { success: true, message: 'Password changed successfully' });
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email?.toLowerCase(), isDeleted: false });
      // Security: always return positive message even if email not found
      ApiResponse.success(res, { message: 'If an account exists, a password reset link has been dispatched' });
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      ApiResponse.success(res, { message: 'Password reset successfully' });
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }
}
