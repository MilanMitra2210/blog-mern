'use client';

import React, { useState } from 'react';
import { likePost } from '@/lib/api';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
}

export default function LikeButton({ postId, initialLikes = 0 }: LikeButtonProps) {
  const [likes, setLikes] = useState<number>(initialLikes);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);

  const handleLike = async () => {
    if (hasLiked) return;
    setAnimating(true);
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    const result = await likePost(postId);
    if (result && typeof result.likes === 'number') {
      setLikes(result.likes);
    }
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={hasLiked}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
        hasLiked
          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-lg shadow-pink-500/10'
          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-pink-500/30 hover:text-pink-400'
      }`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${
          animating ? 'scale-130 text-pink-500 fill-pink-500' : hasLiked ? 'fill-pink-400 text-pink-400' : ''
        }`}
      />
      <span>{hasLiked ? 'Liked' : 'Like Article'}</span>
      <span className="ml-1 px-2 py-0.5 rounded-md bg-black/30 text-xs font-bold tabular-nums">
        {likes}
      </span>
    </button>
  );
}
