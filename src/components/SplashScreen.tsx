import React, { useEffect, useState } from 'react';
import { CuteBearLogo } from './CuteBearLogo';
import { Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 5-second total duration timer (50 intervals of 100ms)
    const durationMs = 5000;
    const intervalMs = 100;
    const step = 100 / (durationMs / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          onFinish();
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-500 via-orange-500 to-amber-700 flex flex-col items-center justify-between p-6 sm:p-10 text-white select-none overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-12 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-16 right-10 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header info */}
      <div className="w-full flex items-center justify-between max-w-md pt-2">
        <span className="text-xs font-black uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Mental Math Pro</span>
        </span>

        {/* Skip button */}
        <button
          onClick={() => {
            sounds.playClick();
            onFinish();
          }}
          className="text-xs font-bold text-white/80 hover:text-white px-3 py-1 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-xs transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Mascot & Logo: Ultra-Cute Bear */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative mb-5 animate-bounce">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center p-3 border-4 border-white/40 shadow-2xl">
            <CuteBearLogo size="xl" mood="excited" animate={false} />
          </div>
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white drop-shadow-md mb-2">
          Kids Center Pro
        </h1>
        <p className="font-bold text-sm sm:text-lg text-amber-100 max-w-xs sm:max-w-sm drop-shadow-xs">
          Interactive Soroban & Mental Math Gamified Journey
        </p>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-2.5 pb-4">
        <div className="w-full h-3 bg-black/20 backdrop-blur-md rounded-full overflow-hidden p-0.5 border border-white/30 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full transition-all duration-100 ease-out shadow-md"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between w-full text-xs font-black text-amber-100 px-1">
          <span>Loading math kingdom...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};
