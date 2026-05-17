'use client';
import React from 'react';

interface SystemMessageProps {
  text: string;
}

export function SystemMessage({ text }: SystemMessageProps) {
  return (
    <div className="flex justify-center my-2 px-4">
      <span
        className="text-xs px-3 py-1.5 rounded-full font-medium"
        style={{
          color: '#a1a1aa',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {text}
      </span>
    </div>
  );
}
