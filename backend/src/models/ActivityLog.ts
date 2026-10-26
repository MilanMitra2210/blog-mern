import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  id: string;
  user?: mongoose.Types.ObjectId | string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  method: string;
  endpoint: string;
  status: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      default: '',
    },
    entityId: {
      type: String,
      default: '',
    },
    method: {
      type: String,
      default: '',
    },
    endpoint: {
      type: String,
      default: '',
    },
    status: {
      type: Number,
      default: 200,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

export const ActivityLog: Model<IActivityLog> = mongoose.model<IActivityLog>(
  'ActivityLog',
  activityLogSchema
);
