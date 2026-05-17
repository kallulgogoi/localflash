import {
  ref,
  push,
  onValue,
  off,
  query,
  limitToLast,
  remove,
  get,
} from 'firebase/database';
import { rtdb } from './config';
import type { Message } from '@/types';

const MAX_MESSAGES = 100;

export async function sendMessage(
  roomId: string,
  message: Omit<Message, 'messageId'>
): Promise<void> {
  const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
  await push(messagesRef, {
    userId: message.userId,
    username: message.username,
    avatarColor: message.avatarColor,
    text: message.text,
    timestamp: message.timestamp,
    type: message.type,
  });
}

export function subscribeMessages(
  roomId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = query(
    ref(rtdb, `rooms/${roomId}/messages`),
    limitToLast(MAX_MESSAGES)
  );

  const handler = onValue(messagesRef, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((child) => {
      const data = child.val();
      messages.push({
        messageId: child.key!,
        userId: data.userId,
        username: data.username,
        avatarColor: data.avatarColor ?? '#FF4D00',
        text: data.text,
        timestamp: data.timestamp,
        type: data.type ?? 'user',
      });
    });
    callback(messages);
  });

  return () => off(messagesRef, 'value', handler);
}

export async function deleteAllMessages(roomId: string): Promise<void> {
  const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
  await remove(messagesRef);
}
