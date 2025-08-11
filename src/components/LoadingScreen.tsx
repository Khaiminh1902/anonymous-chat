'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center font-mono">
      <div className="text-center">
        <div className="text-2xl mb-4 glitch">
          [ANONYMOUS_CHAT_TERMINAL]
        </div>
        <div className="text-lg">
          Initializing secure connection{dots}
        </div>
        <div className="mt-8 text-sm opacity-60">
          █▓▒░ LOADING ░▒▓█
        </div>
      </div>
    </div>
  );
}
