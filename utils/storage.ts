import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'lf_userId';
const USERNAME_KEY = 'lf_username';
const AVATAR_COLOR_KEY = 'lf_avatarColor';

export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return uuidv4();
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const newId = uuidv4();
  localStorage.setItem(USER_ID_KEY, newId);
  return newId;
}

export function getStoredUsername(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USERNAME_KEY);
}

export function setStoredUsername(username: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERNAME_KEY, username);
}

export function getStoredAvatarColor(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AVATAR_COLOR_KEY);
}

export function setStoredAvatarColor(color: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AVATAR_COLOR_KEY, color);
}
