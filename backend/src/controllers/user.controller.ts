import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/response.js';

export class UserController {
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await UserService.getUsers(req.query);
      ApiResponse.paginated(res, result.items, result.total, result.page, result.limit);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);
      ApiResponse.success(res, user);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      ApiResponse.success(res, user, 'User created successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      await UserService.deleteUser(req.params.id);
      ApiResponse.success(res, { success: true }, 'User deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }
}
