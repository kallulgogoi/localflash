'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame } from 'lucide-react';

interface VanishScreenProps {
  onComplete?: () => void;
}

export function VanishScreen({ onComplete }: VanishScreenProps) {
  const [countdown, setCountdown] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Fade out then redirect
          setOpacity(0);
          setTimeout(() => {
            if (onComplete) onComplete();
            else router.push('/');
          }, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#09090b',
        opacity,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Animated Icon */}
      <div
        className="mb-6 text-zinc-300"
        style={{ animation: 'vanishBounce 0.6s ease infinite alternate' }}
      >
        <Flame className="w-24 h-24" strokeWidth={1} />
      </div>

      <h1
        className="text-4xl font-black tracking-tight mb-3"
        style={{ color: '#FFFFFF' }}
      >
        Room Vanished
      </h1>

      <p className="text-lg mb-8 text-zinc-400">
        All messages deleted. No trace left.
      </p>

      <div
        className="flex items-center gap-3 px-6 py-3 rounded-2xl"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span className="text-sm font-semibold text-zinc-300">
          Finding new room in {countdown}...
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-zinc-300"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes vanishBounce {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-16px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
