'use client';
import { useState, useEffect } from 'react';
import { setPresence, removePresence, subscribePresence } from '@/lib/firebase/presenceService';
import { getOrCreateUserId } from '@/utils/storage';

export function usePresence(roomId: string) {
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    if (!roomId) return;
    const userId = getOrCreateUserId();

    setPresence(roomId, userId).catch(console.error);
    const unsubscribe = subscribePresence(roomId, setOnlineCount);

    return () => {
      unsubscribe();
      removePresence(roomId, userId).catch(console.error);
    };
  }, [roomId]);

  return { onlineCount };
}
