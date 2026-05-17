'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserCountBadgeProps {
  count: number;
}

export function UserCountBadge({ count }: UserCountBadgeProps) {
  return (
    <Badge
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold"
      style={{
        backgroundColor: 'rgba(0,255,136,0.1)',
        color: '#00FF88',
        border: '1px solid rgba(0,255,136,0.25)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: '#00FF88' }}
      />
      {count} {count === 1 ? 'person' : 'people'}
    </Badge>
  );
}
