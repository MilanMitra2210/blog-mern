import { Role, IRole } from '../models/Role.js';
import { User } from '../models/User.js';
import { AVAILABLE_PERMISSIONS, IPermissionItem } from '../constants/permissions.js';

export class RoleService {
  /**
   * Seed default starter roles if no custom roles exist yet in the database
   */
  private static async seedDefaultRolesIfNeeded(): Promise<void> {
    const count = await Role.countDocuments();
    if (count > 0) return;

    const defaultRoles = [
      {
        name: 'Editor',
        description: 'Can create, edit, and publish blogs, manage categories, media, and comments',
        permissions: [
          'blogs:read',
          'blogs:write',
          'categories:read',
          'categories:write',
          'comments:read',
          'comments:write',
          'media:read',
          'media:write',
        ],
      },
      {
        name: 'Author',
        description: 'Can write and manage own articles, comments, and media uploads',
        permissions: [
          'blogs:read',
          'blogs:write',
          'comments:read',
          'media:read',
          'media:write',
        ],
      },
      {
        name: 'Moderator',
        description: 'Reviews user comments, flagged entries, and public contributions',
        permissions: ['blogs:read', 'comments:read', 'comments:write'],
      },
      {
        name: 'Viewer',
        description: 'Read-only administrative observer profile',
        permissions: ['blogs:read', 'categories:read', 'comments:read', 'media:read'],
      },
    ];

    await Role.insertMany(defaultRoles);
  }

  /**
   * Return all roles in the system
   */
  static async getRoles(): Promise<IRole[]> {
    await this.seedDefaultRolesIfNeeded();
    return Role.find().sort({ createdAt: 1 });
  }

  /**
   * Return the list of available system permissions grouped by module
   */
  static getAvailablePermissions(): IPermissionItem[] {
    return AVAILABLE_PERMISSIONS;
  }

  /**
   * Fetch a single role by ID
   */
  static async getRoleById(id: string): Promise<IRole> {
    const role = await Role.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  /**
   * Create a new role
   */
  static async createRole(data: {
    name: string;
    description?: string;
    permissions?: string[];
  }): Promise<IRole> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Role name is required');
    }

    const trimmedName = data.name.trim();
    const existing = await Role.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });
    if (existing) {
      throw new Error(`A role with name "${trimmedName}" already exists`);
    }

    const permissions = Array.isArray(data.permissions)
      ? Array.from(new Set(data.permissions.map((p) => String(p).trim())))
      : [];

    const role = await Role.create({
      name: trimmedName,
      description: data.description?.trim() || '',
      permissions,
    });

    return role;
  }

  /**
   * Update an existing role
   */
  static async updateRole(
    id: string,
    data: {
      name?: string;
      description?: string;
      permissions?: string[];
    }
  ): Promise<IRole> {
    const role = await Role.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        throw new Error('Role name cannot be empty');
      }

      const existing = await Role.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (existing) {
        throw new Error(`Another role with name "${trimmedName}" already exists`);
      }
      role.name = trimmedName;
    }

    if (data.description !== undefined) {
      role.description = data.description.trim();
    }

    if (data.permissions !== undefined) {
      role.permissions = Array.isArray(data.permissions)
        ? Array.from(new Set(data.permissions.map((p) => String(p).trim())))
        : [];
    }

    await role.save();
    return role;
  }

  /**
   * Delete a role and unlink it from any users assigned to it
   */
  static async deleteRole(id: string): Promise<boolean> {
    const role = await Role.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.name.toUpperCase() === 'ADMIN') {
      throw new Error('The primary Administrator role cannot be deleted');
    }

    // Unset roleId for users who have this role
    await User.updateMany({ roleId: role._id }, { $set: { roleId: null } });

    await Role.findByIdAndDelete(id);
    return true;
  }
}
