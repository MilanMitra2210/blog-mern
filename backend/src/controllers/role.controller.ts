import { Request, Response } from 'express';
import { RoleService } from '../services/role.service.js';
import { ApiResponse } from '../utils/response.js';

export class RoleController {
  static async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await RoleService.getRoles();
      ApiResponse.success(res, roles, 'Roles fetched successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getAvailablePermissions(req: Request, res: Response): Promise<void> {
    try {
      const permissions = RoleService.getAvailablePermissions();
      ApiResponse.success(res, permissions, 'Permissions fetched successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      ApiResponse.success(res, role, 'Role fetched successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  static async createRole(req: Request, res: Response): Promise<void> {
    try {
      const role = await RoleService.createRole(req.body);
      ApiResponse.success(res, role, 'Role created successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const role = await RoleService.updateRole(req.params.id, req.body);
      ApiResponse.success(res, role, 'Role updated successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      await RoleService.deleteRole(req.params.id);
      ApiResponse.success(res, { success: true }, 'Role deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }
}
