import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;
let activeReaders = 0;
const activePosts: Record<string, number> = {};

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    activeReaders = io ? io.engine.clientsCount : activeReaders + 1;
    console.log(`[Socket.io]: Client connected (ID: ${socket.id}). Active readers: ${activeReaders}`);

    // Emit live active readers count immediately
    io?.emit('reader:count', { activeReaders, activePosts });

    // Join post-specific reading room (idempotent room join)
    socket.on('join:post', (postId: string) => {
      if (postId) {
        socket.join(`post:${postId}`);
        const room = io?.sockets.adapter.rooms.get(`post:${postId}`);
        const count = room ? room.size : 1;
        activePosts[postId] = count;
        io?.emit('reader:count', { activeReaders: io?.engine.clientsCount || activeReaders, activePosts });
        io?.to(`post:${postId}`).emit('post:active_readers', { postId, count });
      }
    });

    socket.on('leave:post', (postId: string) => {
      if (postId) {
        socket.leave(`post:${postId}`);
        const room = io?.sockets.adapter.rooms.get(`post:${postId}`);
        const count = room ? room.size : 0;
        if (count > 0) {
          activePosts[postId] = count;
        } else {
          delete activePosts[postId];
        }
        io?.emit('reader:count', { activeReaders: io?.engine.clientsCount || activeReaders, activePosts });
        io?.to(`post:${postId}`).emit('post:active_readers', { postId, count });
      }
    });

    // Automatically decrement room counts when browser tab reloads or disconnects
    socket.on('disconnecting', () => {
      for (const roomName of socket.rooms) {
        if (roomName.startsWith('post:')) {
          const postId = roomName.replace('post:', '');
          const currentSize = io?.sockets.adapter.rooms.get(roomName)?.size || 1;
          const newCount = Math.max(0, currentSize - 1);
          if (newCount > 0) {
            activePosts[postId] = newCount;
          } else {
            delete activePosts[postId];
          }
          io?.to(roomName).emit('post:active_readers', { postId, count: newCount });
        }
      }
    });

    socket.on('disconnect', () => {
      activeReaders = io ? io.engine.clientsCount : Math.max(0, activeReaders - 1);
      io?.emit('reader:count', { activeReaders, activePosts });
      console.log(`[Socket.io]: Client disconnected (ID: ${socket.id}). Active readers: ${activeReaders}`);
    });
  });

  return io;
};

export const getActiveReadersData = () => {
  const currentTotal = io ? io.engine.clientsCount : activeReaders;
  return {
    totalActive: currentTotal,
    entityActive: 0,
    activePosts: { ...activePosts },
    activeCountries: currentTotal > 0 ? { IN: currentTotal } : {},
  };
};

export const emitNotification = (event: string, payload: any) => {
  if (io) {
    io.emit(event, payload);
  }
};

export const getIO = (): SocketIOServer | null => io;
