import React from 'react';
import { X, Play, Star, Clock, Trophy, Calculator, Heart, Sparkles, Dumbbell } from 'lucide-react';
import { Lesson, LessonProgress, Unit, StudentProfile } from '../../types';
import { sounds } from '../../services/soundEffects';

interface NodePopoverModalProps {
  lesson: Lesson;
  unit: Unit;
  progress?: LessonProgress;
  profile: StudentProfile;
  onStartLesson: (lesson: Lesson) => void;
  onClose: () => void;
  onRefillHearts?: () => void;
  onGoToPractice?: () => void;
}

export const NodePopoverModal: React.FC<NodePopoverModalProps> = ({
  lesson,
  unit,
  progress,
  profile,
  onStartLesson,
  onClose,
  onRefillHearts,
  onGoToPractice,
}) => {
  const isCompleted = progress?.status === 'completed';
  const stars = progress?.stars || 0;
  const hasNoHearts = profile.hearts <= 0;
  const canAffordRefill = profile.coins >= 40;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border-2 border-slate-200 relative animate-in slide-in-from-bottom-6 duration-200 text-left"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category & Questions Count Badge */}
        <div className="flex items-center gap-2 mb-2 pr-8">
          <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>50 Questions</span>
          </span>
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            ~{lesson.estimatedMinutes} mins
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-heading font-black text-xl sm:text-2xl text-slate-800 leading-snug mb-1">
          {lesson.title}
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-4 leading-relaxed">
          {lesson.description}
        </p>

        {/* Previous Score Stars if Completed */}
        {isCompleted && (
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-900 uppercase">Mastered!</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((starNum) => (
                <Star
                  key={starNum}
                  className={`w-4 h-4 ${
                    starNum <= stars
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rewards Preview Cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shadow-2xs">
              🪙
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-amber-600">Reward</p>
              <p className="font-extrabold text-sm text-amber-950">+{lesson.coinsReward} Coins</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-2xs">
              XP
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-indigo-500">Exp</p>
              <p className="font-extrabold text-sm text-indigo-950">+{lesson.xpReward} XP</p>
            </div>
          </div>
        </div>

        {/* Heart Warning if 0 Hearts */}
        {hasNoHearts ? (
          <div className="space-y-2 mb-2">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500 shrink-0" />
              <div className="text-xs font-bold text-rose-900">
                <span className="block font-black text-sm text-rose-700">Out of Hearts (0/5)!</span>
                You need at least 1 heart to start a 50-question exam.
              </div>
            </div>

            {canAffordRefill && onRefillHearts ? (
              <button
                onClick={() => {
                  onRefillHearts();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-heading font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_0_#d97706] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Refill 5 Hearts Now (40 Coins 🪙)</span>
              </button>
            ) : null}

            {onGoToPractice && (
              <button
                onClick={() => {
                  onClose();
                  onGoToPractice();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-heading font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_0_#2563eb] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Earn Hearts in Practice Arena 🎯</span>
              </button>
            )}
          </div>
        ) : (
          /* Normal Start Button */
          <button
            onClick={() => {
              sounds.playClick();
              onStartLesson(lesson);
            }}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isCompleted
                ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_5px_0_#1d4ed8] active:translate-y-1 active:shadow-none'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_6px_0_#059669] active:translate-y-1 active:shadow-none'
            }`}
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{isCompleted ? 'Review Lesson (50 Qs)' : 'Start 50-Question Exam'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
