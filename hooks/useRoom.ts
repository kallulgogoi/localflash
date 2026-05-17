'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { findNearbyRoom, createRoom, joinRoom } from '@/lib/firebase/roomService';
import { generateUsername, generateAvatarColor } from '@/utils/username';
import {
  getOrCreateUserId,
  getStoredUsername,
  setStoredUsername,
  getStoredAvatarColor,
  setStoredAvatarColor,
} from '@/utils/storage';
import type { Room } from '@/types';

type Status = 'idle' | 'searching' | 'joining' | 'done' | 'error';

export function useRoom() {
  const [status, setStatus] = useState<Status>('idle');
  const [room, setRoom] = useState<Room | null>(null);
  const router = useRouter();

  const findOrCreateRoom = useCallback(async (lat: number, lng: number) => {
    try {
      setStatus('searching');

      // Ensure identity
      getOrCreateUserId();
      if (!getStoredUsername()) setStoredUsername(generateUsername());
      if (!getStoredAvatarColor()) setStoredAvatarColor(generateAvatarColor());

      // Debounce-style: small artificial delay for UX
      await new Promise((r) => setTimeout(r, 600));

      let foundRoom = await findNearbyRoom(lat, lng);

      if (!foundRoom) {
        foundRoom = await createRoom(lat, lng);
      } else {
        setStatus('joining');
        await joinRoom(foundRoom.roomId);
      }

      setRoom(foundRoom);
      setStatus('done');
      router.push(`/chat/${foundRoom.roomId}`);
    } catch (err) {
      console.error(err);
      toast.error('Reconnecting... ⚡', { description: 'Firebase issue, retrying...' });
      setStatus('error');
    }
  }, [router]);

  return { status, room, findOrCreateRoom };
}
