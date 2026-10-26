'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Next.js Socket]: Connected to QuillForge Realtime Hub:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Next.js Socket]: Disconnected from Realtime Hub');
    });
  }
  return socket;
};
