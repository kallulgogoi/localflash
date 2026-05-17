export interface User {
  userId: string;
  username: string;
  avatarColor: string;
  joinedAt: number;
}

export interface Message {
  messageId: string;
  userId: string;
  username: string;
  avatarColor: string;
  text: string;
  timestamp: number;
  type: 'user' | 'system';
}

export interface Room {
  roomId: string;
  centerLat: number;
  centerLng: number;
  createdAt: number;
  expiresAt: number;
  userCount: number;
  active: boolean;
}
