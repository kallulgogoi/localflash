'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { sendMessage, subscribeMessages } from '@/lib/firebase/messageService';
import { getOrCreateUserId, getStoredUsername, getStoredAvatarColor } from '@/utils/storage';
import type { Message } from '@/types';

const RATE_LIMIT_MS = 1000;

export function useMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeMessages(roomId, setMessages);
    return unsubscribe;
  }, [roomId]);

  const send = useCallback(async (text: string) => {
    const now = Date.now();
    if (now - lastSentRef.current < RATE_LIMIT_MS) {
      toast.warning('Slow down! 1 message per second.');
      return;
    }
    lastSentRef.current = now;

    const userId = getOrCreateUserId();
    const username = getStoredUsername() ?? 'Anonymous';
    const avatarColor = getStoredAvatarColor() ?? '#FF4D00';

    const message: Omit<Message, 'messageId'> = {
      userId,
      username,
      avatarColor,
      text: text.trim(),
      timestamp: now,
      type: 'user',
    };

    try {
      await sendMessage(roomId, message);
    } catch {
      toast.error('Message not sent, try again');
    }
  }, [roomId]);

  const sendSystemMessage = useCallback(async (text: string) => {
    const userId = 'system';
    const message: Omit<Message, 'messageId'> = {
      userId,
      username: 'system',
      avatarColor: '#666666',
      text,
      timestamp: Date.now(),
      type: 'system',
    };
    try {
      await sendMessage(roomId, message);
    } catch {
      // Silent fail for system messages
    }
  }, [roomId]);

  return { messages, send, sendSystemMessage };
}
