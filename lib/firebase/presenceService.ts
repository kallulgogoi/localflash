import {
  ref,
  set,
  onValue,
  off,
  onDisconnect,
  remove,
  get,
} from 'firebase/database';
import { rtdb } from './config';

export async function setPresence(
  roomId: string,
  userId: string
): Promise<void> {
  const presenceRef = ref(rtdb, `rooms/${roomId}/presence/${userId}`);
  await set(presenceRef, true);
  // Auto-cleanup on disconnect
  onDisconnect(presenceRef).remove();
}

export async function removePresence(
  roomId: string,
  userId: string
): Promise<void> {
  const presenceRef = ref(rtdb, `rooms/${roomId}/presence/${userId}`);
  await remove(presenceRef);
}

export function subscribePresence(
  roomId: string,
  callback: (count: number) => void
): () => void {
  const presenceRef = ref(rtdb, `rooms/${roomId}/presence`);

  const handler = onValue(presenceRef, (snapshot) => {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    callback(count);
  });

  return () => off(presenceRef, 'value', handler);
}
