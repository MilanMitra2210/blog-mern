import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ProviderType, UserRole } from '../types/index.js';
import { IRole } from './Role.js';
import { ALL_PERMISSION_KEYS, DEFAULT_USER_PERMISSIONS } from '../constants/permissions.js';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  roleId?: mongoose.Types.ObjectId | IRole | null;
  role_id?: string | null;
  roleRel?: {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
  };
  role_rel?: {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
  };
  active: boolean;
  blocked: boolean;
  blockReason: string;
  provider: ProviderType;
  facebookId?: string;
  googleId?: string;
  image?: string;
  refreshToken?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['MANUAL', 'GOOGLE', 'FACEBOOK', 'APPLE', 'LINKEDIN'],
      default: 'MANUAL',
    },
    facebookId: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : doc.id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshToken;

        // Normalize roleId and dynamic RBAC roleRel
        const rawRoleId = ret.roleId;
        let roleIdStr: string | null = null;

        if (rawRoleId) {
          if (typeof rawRoleId === 'string') {
            roleIdStr = rawRoleId;
          } else if (rawRoleId.id) {
            roleIdStr = String(rawRoleId.id);
          } else if (rawRoleId._id) {
            roleIdStr = rawRoleId._id.toString();
          } else if (doc.roleId) {
            roleIdStr = (doc.roleId as any)._id ? (doc.roleId as any)._id.toString() : (doc.roleId as any).toString();
          }
        }

        ret.roleId = roleIdStr;
        ret.role_id = roleIdStr;

        // Resolve dynamic RBAC roleRel
        if (ret.role === 'ADMIN') {
          ret.roleRel = {
            id: 'role-admin',
            name: 'ADMIN',
            description: 'Super administrator with full permissions',
            permissions: ALL_PERMISSION_KEYS,
          };
        } else if (rawRoleId && typeof rawRoleId === 'object' && ('name' in rawRoleId || 'permissions' in rawRoleId)) {
          ret.roleRel = {
            id: roleIdStr || 'role-custom',
            name: rawRoleId.name || 'Custom Role',
            description: rawRoleId.description || '',
            permissions: Array.isArray(rawRoleId.permissions) ? rawRoleId.permissions : [],
          };
        } else {
          ret.roleRel = {
            id: 'role-user',
            name: 'USER',
            description: 'Standard registered user',
            permissions: DEFAULT_USER_PERMISSIONS,
          };
        }
        ret.role_rel = ret.roleRel;

        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
