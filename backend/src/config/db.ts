import mongoose from 'mongoose';

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/quillforge_mern';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};
