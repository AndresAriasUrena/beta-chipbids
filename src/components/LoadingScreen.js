"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setIsLoading(false);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] flex flex-col items-center justify-center z-50">
      <div className="relative w-52 h-52 mb-8">
        <Image
          src="/logo.png"
          alt="ChipBids Logo"
          fill
          style={{
            animation: 'logoAnimation 8s ease-in-out infinite',
            objectFit: 'contain'
          }}
          priority
        />
        <style jsx global>{`
          @keyframes logoAnimation {
            0% {
              transform: scale(1);
              filter: none;
            }
            50% {
              transform: scale(1.05);
              filter: brightness(0) saturate(100%) invert(70%) sepia(100%) saturate(1000%) hue-rotate(160deg) brightness(100%) contrast(100%);
            }
            100% {
              transform: scale(1);
              filter: none;
            }
          }
        `}</style>
      </div>
      <div className="w-80 h-2 bg-[#222] rounded-full overflow-hidden">
        <div 
          className="h-full"
          style={{ 
            width: `${progress}%`,
            transition: 'width 0.3s ease-in-out',
            animation: 'progressColor 8s ease-in-out infinite',
          }}
        />
        <style jsx global>{`
          @keyframes progressColor {
            0% {
              background-color: #00ff88;
            }
            50% {
              background-color: #00e5ff;
            }
            100% {
              background-color: #00ff88;
            }
          }
        `}</style>
      </div>
    </div>
  );
} 