'use client';

import React, { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Eye, Flame, Users } from 'lucide-react';

interface LiveReaderBadgeProps {
  postId: string;
}

export default function LiveReaderBadge({ postId }: LiveReaderBadgeProps) {
  const [activeOnPost, setActiveOnPost] = useState<number>(1);

  useEffect(() => {
    if (!postId) return;
    const socket = getSocket();

    // Join post reading room
    socket.emit('join:post', postId);

    // Handler for live post active reader updates
    const handleActiveUpdate = (data: { postId: string; count: number }) => {
      if (data?.postId === postId) {
        setActiveOnPost(Math.max(1, data.count));
      }
    };

    socket.on('post:active_readers', handleActiveUpdate);

    return () => {
      socket.emit('leave:post', postId);
      socket.off('post:active_readers', handleActiveUpdate);
    };
  }, [postId]);

  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold backdrop-blur-md shadow-sm shadow-red-500/10">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" />
        <span>
          <strong className="text-white font-bold tabular-nums">{activeOnPost}</strong> {activeOnPost === 1 ? 'person' : 'people'} reading now
        </span>
      </span>
    </div>
  );
}
