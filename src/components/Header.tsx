import React, { useState } from 'react';
import { Flame, Sparkles, Heart, Volume2, VolumeX, GraduationCap, Lock, Dumbbell } from 'lucide-react';
import { StudentProfile } from '../types';
import { sounds } from '../services/soundEffects';
import { CuteBearLogo } from './CuteBearLogo';

interface HeaderProps {
  profile: StudentProfile;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onRefillHearts?: () => void;
  onRequestTeacherAccess?: () => void;
  isTeacherUnlocked?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  onNavigateTab,
  onRefillHearts,
  onRequestTeacherAccess,
  isTeacherUnlocked = false,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sounds.playClick();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-slate-200/90 px-3 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Identity with Panda Mascot */}
          <div 
            onClick={() => onNavigateTab('path')}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <CuteBearLogo size="md" className="group-hover:scale-110 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent">
                  KIDS CENTER PRO
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 hidden xs:inline-block">
                  MATH
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 hidden sm:block">
                Soroban & Progressive Mental Arithmetic
              </p>
            </div>
          </div>

          {/* Gamification Stats Bar */}
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar py-0.5">
            {/* Streak Counter */}
            <button
              onClick={() => {
                sounds.playStreak();
                setShowStreakModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200 text-orange-600 font-extrabold text-xs sm:text-sm transition-transform active:scale-95 shadow-2xs shrink-0 cursor-pointer"
              title="Daily Learning Streak"
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-flame" />
              <span>{profile.currentStreak}</span>
            </button>

            {/* Gems / Crystals */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 font-extrabold text-xs sm:text-sm shadow-2xs shrink-0 select-none"
              title="Crystals & Gems"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 fill-cyan-400" />
              <span>{profile.gems}</span>
            </div>

            {/* Coins */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs sm:text-sm shadow-2xs shrink-0 select-none"
              title="Gold Coins"
            >
              <span className="text-sm leading-none">🪙</span>
              <span>{profile.coins}</span>
            </div>

            {/* Hearts Energy */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowHeartsModal(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-extrabold text-xs sm:text-sm transition-transform active:scale-95 shadow-2xs shrink-0 cursor-pointer ${
                profile.hearts === 0 
                  ? 'bg-rose-100 border-rose-300 text-rose-700 animate-pulse' 
                  : 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-600'
              }`}
              title="Energy Hearts (Max 5)"
            >
              <Heart className={`w-4 h-4 ${profile.hearts > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
              <span>{profile.hearts}/{profile.maxHearts}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Teacher Protected Portal Entry */}
            <button
              onClick={onRequestTeacherAccess}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isTeacherUnlocked
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Teacher Management Dashboard"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Teacher Portal</span>
              {!isTeacherUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Streak Details Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-3">
              <Flame className="w-10 h-10 fill-orange-500 text-orange-500 animate-bounce" />
            </div>
            <h3 className="font-heading font-black text-2xl text-slate-800 mb-1">
              {profile.currentStreak} Day Streak!
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-4 leading-relaxed">
              Solve at least one mental math lesson each day to keep your learning flame blazing!
            </p>
            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-900 mb-5">
              Best streak recorded: {profile.bestStreak} consecutive days 🏆
            </div>
            <button
              onClick={() => setShowStreakModal(false)}
              className="w-full py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-sm uppercase shadow-[0_4px_0_#16a34a] cursor-pointer"
            >
              Got It! Keep Practicing
            </button>
          </div>
        </div>
      )}

      {/* Hearts Energy Details Modal */}
      {showHeartsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center mb-3">
              <Heart className={`w-10 h-10 ${profile.hearts > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            </div>
            <h3 className="font-heading font-black text-2xl text-slate-800 mb-1">
              Hearts Energy: {profile.hearts}/{profile.maxHearts}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-4 leading-relaxed">
              You need at least 1 heart to take a 50-question exam. If you lose all 5 hearts in an exam, you will be kicked out!
            </p>

            <div className="space-y-2 mb-4">
              {profile.coins >= 40 && onRefillHearts && (
                <button
                  onClick={() => {
                    onRefillHearts();
                    setShowHeartsModal(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#d97706] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Refill 5 Hearts (40 Coins 🪙)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowHeartsModal(false);
                  onNavigateTab('practice');
                }}
                className="w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#2563eb] cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Earn Hearts in Practice Arena 🎯</span>
              </button>
            </div>

            <button
              onClick={() => setShowHeartsModal(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
