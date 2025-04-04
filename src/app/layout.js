"use client";

import { useState, useEffect } from 'react';
import { Providers } from './providers';
import './globals.css';
import LoadingScreen from '@/components/LoadingScreen';

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="es">
      <body className={isLoading ? 'overflow-hidden' : ''}>
        <Providers>
          {isLoading && <LoadingScreen />}
          <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}