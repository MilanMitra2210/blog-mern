import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';
import { User } from './models/User.js';

const PORT = Number(process.env.PORT) || 8080;

const seedInitialData = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'ADMIN', isDeleted: false });
    if (adminCount === 0) {
      await User.create({
        name: 'QuillForge Admin',
        email: 'admin@quillforge.com',
        password: 'Admin@1234',
        role: 'ADMIN',
        active: true,
      });
      console.log('[Seed]: Created default Admin: admin@quillforge.com / Admin@1234');
    }

    const regularCount = await User.countDocuments({ role: 'USER', isDeleted: false });
    if (regularCount === 0) {
      await User.create({
        name: 'Jane Regular User',
        email: 'user@quillforge.com',
        password: 'User@1234',
        role: 'USER',
        active: true,
      });
      console.log('[Seed]: Created default Regular User: user@quillforge.com / User@1234');
    }
  } catch (err: any) {
    console.error('[Seed Error]:', err.message);
  }
};

const startServer = async () => {
  await connectDB();
  await seedInitialData();

  const app = createApp();
  const httpServer = http.createServer(app);

  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 QuillForge MERN Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔑 Default Admin: admin@quillforge.com | Admin@1234`);
    console.log(`👤 Default User:  user@quillforge.com  | User@1234`);
    console.log(`====================================================`);
  });
};

startServer().catch((err) => {
  console.error('[Startup Fatal Error]:', err);
  process.exit(1);
});
