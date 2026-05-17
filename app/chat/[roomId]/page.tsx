'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getRoomById } from '@/lib/firebase/roomService';
import type { Room } from '@/types';

// Dynamically import ChatRoom for code splitting
const ChatRoom = dynamic(
  () => import('@/components/ChatRoom').then((m) => ({ default: m.ChatRoom })),
  {
    loading: () => (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#FF4D00', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#666666' }}>
            Loading room...
          </p>
        </div>
      </div>
    ),
  }
);

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    getRoomById(roomId)
      .then((r) => {
        if (!r || !r.active) {
          setError('Room not found or expired');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        setRoom(r);
      })
      .catch(() => {
        setError('Failed to load room');
        setTimeout(() => router.push('/'), 2000);
      })
      .finally(() => setLoading(false));
  }, [roomId, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: '#FF4D00', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#666666' }}>
            Connecting...
          </p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="text-center">
          <p className="text-2xl mb-2">💨</p>
          <p className="text-sm" style={{ color: '#666666' }}>
            {error ?? 'Room vanished. Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  return <ChatRoom room={room} />;
}
