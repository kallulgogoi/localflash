'use client';
import React, { memo } from 'react';
import type { Message } from '@/types';
import { getOrCreateUserId } from '@/utils/storage';

interface MessageBubbleProps {
  message: Message;
}

function timeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const myUserId = typeof window !== 'undefined' ? getOrCreateUserId() : '';
  const isOwn = message.userId === myUserId;

  return (
    <div
      className={`flex items-end gap-2.5 mb-4 px-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'fadeInUp 0.2s ease' }}
    >
      {/* Avatar */}
      {!isOwn && (
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: message.avatarColor }}
        >
          {message.username.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Bubble */}
      <div className={`flex flex-col max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs font-semibold mb-1 px-1" style={{ color: message.avatarColor }}>
            {message.username}
          </span>
        )}
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm"
          style={
            isOwn
              ? {
                  backgroundColor: '#ffffff',
                  color: '#09090b',
                  borderBottomRightRadius: '4px',
                }
              : {
                  backgroundColor: '#18181b',
                  color: '#f4f4f5',
                  borderBottomLeftRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }
          }
        >
          {message.text}
        </div>
        <span className="text-xs mt-1 px-1" style={{ color: '#444444' }}>
          {timeAgo(message.timestamp)}
        </span>
      </div>

      {/* Own avatar */}
      {isOwn && (
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: message.avatarColor }}
        >
          {message.username.charAt(0).toUpperCase()}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
});
