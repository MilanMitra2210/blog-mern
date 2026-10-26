import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
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
        return ret;
      },
    },
  }
);

export const Role: Model<IRole> = mongoose.model<IRole>('Role', roleSchema);
