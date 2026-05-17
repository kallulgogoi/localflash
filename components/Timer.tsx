'use client';
import React from 'react';
import { useTimer } from '@/hooks/useTimer';

interface TimerProps {
  expiresAt: number | null;
}

export function Timer({ expiresAt }: TimerProps) {
  const { secondsLeft, formatted } = useTimer(expiresAt);
  const isCritical = secondsLeft <= 300; // last 5 minutes

  return (
    <div
      className="flex items-center gap-1.5 font-mono text-sm font-bold px-2.5 py-1 rounded-lg transition-colors"
      style={{
        color: isCritical ? '#FF4D00' : '#FFFFFF',
        backgroundColor: isCritical
          ? 'rgba(255,77,0,0.12)'
          : 'rgba(255,255,255,0.06)',
        border: isCritical
          ? '1px solid rgba(255,77,0,0.3)'
          : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {isCritical && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      ⏱ {expiresAt ? formatted() : '--:--'}
    </div>
  );
}
