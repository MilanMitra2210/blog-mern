import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFolder extends Document {
  id: string;
  name: string;
  parentId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
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
        return ret;
      },
    },
  }
);

export const Folder: Model<IFolder> = mongoose.model<IFolder>('Folder', folderSchema);
