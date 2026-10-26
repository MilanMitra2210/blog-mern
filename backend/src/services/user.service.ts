import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';

export class UserService {
  static async getUsers(params: {
    page?: number | string;
    limit?: number | string;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    if (params.search) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (params.role && params.role !== 'all') {
      const upperRole = params.role.toUpperCase();
      if (upperRole === 'ADMIN' || upperRole === 'USER') {
        query.role = upperRole;
      } else if (mongoose.Types.ObjectId.isValid(params.role)) {
        query.roleId = params.role;
      }
    }

    if (params.status && params.status !== 'all') {
      if (params.status === 'blocked') query.blocked = true;
      if (params.status === 'active') query.active = true;
    }

    const [items, total] = await Promise.all([
      User.find(query)
        .populate('roleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  static async getUserById(id: string) {
    const user = await User.findOne({ _id: id, isDeleted: false }).populate('roleId');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async createUser(data: any) {
    const existing = await User.findOne({ email: data.email.toLowerCase(), isDeleted: false });
    if (existing) throw new Error('User with this email already exists');

    let assignedRoleId: mongoose.Types.ObjectId | null = null;
    const targetRole = data.role === 'ADMIN' ? 'ADMIN' : 'USER';

    if (targetRole !== 'ADMIN' && data.roleId) {
      const roleDoc = await Role.findById(data.roleId);
      if (!roleDoc) {
        throw new Error('Specified role does not exist');
      }
      assignedRoleId = roleDoc._id;
    }

    const user = await User.create({
      name: data.name || '',
      email: data.email.toLowerCase(),
      password: data.password || 'Password@123',
      role: targetRole,
      roleId: assignedRoleId,
      active: data.active ?? true,
      blocked: data.blocked ?? false,
      blockReason: data.blockReason || '',
    });

    await user.populate('roleId');
    return user;
  }

  static async updateUser(id: string, data: any) {
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) throw new Error('User not found');

    if (data.name !== undefined) user.name = data.name;
    if (data.active !== undefined) user.active = data.active;
    if (data.blocked !== undefined) user.blocked = data.blocked;
    if (data.blockReason !== undefined) user.blockReason = data.blockReason;
    if (data.password) user.password = data.password;

    // Handle role and roleId updates
    if (data.role !== undefined) {
      user.role = data.role;
      if (user.role === 'ADMIN') {
        user.roleId = null;
      }
    }

    if (data.roleId !== undefined) {
      if (!data.roleId || user.role === 'ADMIN') {
        user.roleId = null;
      } else {
        const roleDoc = await Role.findById(data.roleId);
        if (!roleDoc) {
          throw new Error('Specified role does not exist');
        }
        user.roleId = roleDoc._id;
      }
    }

    await user.save();
    await user.populate('roleId');
    return user;
  }

  static async deleteUser(id: string) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    return true;
  }
}
