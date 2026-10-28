import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { Unit, LessonProgress } from '../../types';
import { sounds } from '../../services/soundEffects';

interface UnitHeaderProps {
  unit: Unit;
  units: Unit[];
  completedCount: number;
  totalLessons: number;
  progressMap: Record<string, LessonProgress>;
  onSelectUnit: (unit: Unit) => void;
}

export function isUnitUnlocked(targetUnit: Unit, allUnits: Unit[], progMap: Record<string, LessonProgress>): boolean {
  const targetIdx = allUnits.findIndex((u) => u.id === targetUnit.id);
  if (targetIdx <= 0) return true; // First unit is always unlocked

  // Every previous unit must be 100% completed
  for (let i = 0; i < targetIdx; i++) {
    const prevU = allUnits[i];
    const allCompleted = prevU.lessons.length > 0 && prevU.lessons.every((l) => progMap[l.id]?.status === 'completed');
    if (!allCompleted) return false;
  }
  return true;
}

export const UnitHeader: React.FC<UnitHeaderProps> = ({
  unit,
  units,
  completedCount,
  totalLessons,
  progressMap,
  onSelectUnit,
}) => {
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const currentIndex = units.findIndex((u) => u.id === unit.id);
  const prevUnit = currentIndex > 0 ? units[currentIndex - 1] : null;
  const nextUnit = currentIndex < units.length - 1 ? units[currentIndex + 1] : null;

  const isNextUnlocked = nextUnit ? isUnitUnlocked(nextUnit, units, progressMap) : false;

  const progressPercent = Math.round((completedCount / Math.max(totalLessons, 1)) * 100);
  const isUnitFinished = completedCount === totalLessons && totalLessons > 0;

  const handleNextClick = () => {
    if (!nextUnit) return;

    if (!isNextUnlocked) {
      sounds.playIncorrect();
      setLockedNotice(`Unit ${nextUnit.number} is locked! Complete all ${totalLessons} lessons in Unit ${unit.number} first.`);
      setTimeout(() => setLockedNotice(null), 3500);
      return;
    }

    sounds.playClick();
    onSelectUnit(nextUnit);
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-6 px-3 sm:px-4">
      {/* Unit Banner */}
      <div className={`relative overflow-hidden rounded-3xl ${unit.colorScheme.bannerBg} text-white p-4 sm:p-6 shadow-xl border-2 border-white/20 transition-all text-left`}>
        {/* Decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-lg pointer-events-none" />

        {/* Top Header Row with Unit Switchers */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider">
            <span>Unit {unit.number} of {units.length}</span>
            {isUnitFinished && (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 ml-1 inline" />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Unit button */}
            <button
              onClick={() => {
                if (prevUnit) {
                  sounds.playClick();
                  onSelectUnit(prevUnit);
                }
              }}
              disabled={!prevUnit}
              className={`p-1.5 rounded-xl bg-black/20 hover:bg-black/30 transition-all ${
                !prevUnit ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'
              }`}
              title="Previous Unit"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Unit button (Strictly locked if previous unit not finished) */}
            <button
              onClick={handleNextClick}
              disabled={!nextUnit}
              className={`px-2 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 transition-all flex items-center gap-1 ${
                !nextUnit 
                  ? 'opacity-30 cursor-not-allowed' 
                  : !isNextUnlocked
                  ? 'opacity-75 cursor-pointer border border-amber-300/40 bg-black/35'
                  : 'cursor-pointer active:scale-95'
              }`}
              title={!isNextUnlocked && nextUnit ? `Unit ${nextUnit.number} is locked` : 'Next Unit'}
            >
              {!isNextUnlocked && nextUnit ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[10px] font-black uppercase text-amber-200">Locked</span>
                </>
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Locked notification banner */}
        {lockedNotice && (
          <div className="relative z-20 mb-3 p-2.5 rounded-2xl bg-amber-500/90 text-amber-950 font-bold text-xs flex items-center gap-2 border border-white/30 shadow-md animate-in fade-in">
            <Lock className="w-4 h-4 text-amber-950 shrink-0" />
            <span>{lockedNotice}</span>
          </div>
        )}

        {/* Unit Title and Description */}
        <div className="relative z-10 mb-3 sm:mb-4">
          <h2 className="font-heading font-black text-xl sm:text-2xl leading-tight drop-shadow-sm mb-1">
            {unit.title}
          </h2>
          <p className="text-white/90 text-xs sm:text-sm font-semibold line-clamp-2">
            {unit.description}
          </p>
        </div>

        {/* Clean Progress bar (Guidebook button completely removed) */}
        <div className="relative z-10 pt-2 border-t border-white/20">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider mb-1 text-white/90">
            <span>{completedCount}/{totalLessons} Lessons Mastered</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
