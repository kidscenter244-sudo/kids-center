import React, { useState } from 'react';
import { Unit, Lesson, LessonProgress, StudentProfile } from '../../types';
import { UnitHeader, isUnitUnlocked } from './UnitHeader';
import { PathNode } from './PathNode';
import { NodePopoverModal } from './NodePopoverModal';
import { CuteBearLogo } from '../CuteBearLogo';
import { sounds } from '../../services/soundEffects';
import confetti from 'canvas-confetti';

interface LearningPathViewProps {
  units: Unit[];
  activeUnit: Unit;
  progressMap: Record<string, LessonProgress>;
  profile: StudentProfile;
  onSelectUnit: (unit: Unit) => void;
  onStartLesson: (lesson: Lesson) => void;
  onClaimMilestone: (unit: Unit) => void;
  onRefillHearts?: () => void;
  onGoToPractice?: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  units,
  activeUnit,
  progressMap,
  profile,
  onSelectUnit,
  onStartLesson,
  onClaimMilestone,
  onRefillHearts,
  onGoToPractice,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [claimedUnits, setClaimedUnits] = useState<Record<string, boolean>>({
    'unit-1': false,
  });

  // Calculate completed lessons in this unit
  const completedLessonsCount = activeUnit.lessons.filter(
    (l) => progressMap[l.id]?.status === 'completed'
  ).length;

  const isUnitFinished = completedLessonsCount === activeUnit.lessons.length && activeUnit.lessons.length > 0;
  const isMilestoneClaimed = claimedUnits[activeUnit.id];

  // Natural serpentine curve offsets
  const offsets = [-35, 0, 38, 12, -32, 28, -15];

  // Identify the currently active node
  let foundCurrent = false;
  const lessonStatuses = activeUnit.lessons.map((lesson, idx) => {
    const prog = progressMap[lesson.id];
    let isCurrent = false;

    if (prog?.status === 'current') {
      isCurrent = true;
      foundCurrent = true;
    } else if (!foundCurrent && prog?.status !== 'completed') {
      isCurrent = true;
      foundCurrent = true;
    }

    return {
      lesson,
      progress: prog,
      isCurrent,
      offset: offsets[idx % offsets.length],
    };
  });

  const mascotQuotes = [
    '50 mental math questions to boost your focus today! 🌟🧠',
    "You're a calculation champion! Keep this streak blazing! 🚀",
    'Visualizing the Soroban abacus is the true secret of masters! ⚡',
    'Every column you solve strengthens mental photographic memory! ⭐',
  ];
  const mascotQuote = mascotQuotes[profile.currentStreak % mascotQuotes.length];

  const handleClaimChest = () => {
    if (!isUnitFinished || isMilestoneClaimed) return;
    sounds.playChest();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#3B82F6', '#10B981', '#EC4899'],
    });
    setClaimedUnits((prev) => ({ ...prev, [activeUnit.id]: true }));
    onClaimMilestone(activeUnit);
  };

  const handleSafeSelectUnit = (unitToSelect: Unit) => {
    if (!isUnitUnlocked(unitToSelect, units, progressMap)) {
      sounds.playIncorrect();
      return;
    }
    onSelectUnit(unitToSelect);
  };

  return (
    <div className="relative pb-24 pt-3 sm:pt-4 min-h-[calc(100vh-64px)] overflow-x-hidden">
      {/* Unit Banner Header */}
      <UnitHeader
        unit={activeUnit}
        units={units}
        completedCount={completedLessonsCount}
        totalLessons={activeUnit.lessons.length}
        progressMap={progressMap}
        onSelectUnit={handleSafeSelectUnit}
      />

      {/* Learning Path Container */}
      <div className="max-w-md mx-auto px-4 relative flex flex-col items-center">
        {/* SVG Decorative S-Curve Path connecting the nodes */}
        <div className="relative w-full flex flex-col items-center">
          {lessonStatuses.map((item, idx) => {
            const nextItem = lessonStatuses[idx + 1];
            return (
              <React.Fragment key={item.lesson.id}>
                <div className="relative flex items-center justify-center w-full">
                  {/* Floating Companion standing next to Current Node on Desktop */}
                  {item.isCurrent && (
                    <div 
                      className="absolute z-20 hidden md:flex items-center gap-3 transition-all animate-mascot-bounce"
                      style={{
                        left: item.offset > 0 ? '-140px' : 'auto',
                        right: item.offset <= 0 ? '-140px' : 'auto',
                      }}
                    >
                      {item.offset <= 0 ? (
                        <>
                          <CuteBearLogo size="lg" mood="excited" animate={true} />
                          <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-slate-200 text-xs font-bold text-slate-800 max-w-[150px] relative text-left">
                            {mascotQuote}
                            <div className="w-0 h-0 border-y-6 border-y-transparent border-r-6 border-r-white absolute -left-1.5 top-1/2 -translate-y-1/2"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-slate-200 text-xs font-bold text-slate-800 max-w-[150px] relative text-left">
                            {mascotQuote}
                            <div className="w-0 h-0 border-y-6 border-y-transparent border-l-6 border-l-white absolute -right-1.5 top-1/2 -translate-y-1/2"></div>
                          </div>
                          <CuteBearLogo size="lg" mood="excited" animate={true} />
                        </>
                      )}
                    </div>
                  )}

                  {/* Circular Lesson Node */}
                  <PathNode
                    lesson={item.lesson}
                    unit={activeUnit}
                    progress={item.progress}
                    isCurrent={item.isCurrent}
                    offsetPercent={item.offset}
                    onSelectNode={(l) => setSelectedLesson(l)}
                    isSelected={selectedLesson?.id === item.lesson.id}
                  />
                </div>

                {/* Connecting Curved Connector Pipe */}
                {nextItem && (
                  <div 
                    className="w-3.5 h-8 sm:h-10 rounded-full transition-colors my-[-6px]"
                    style={{
                      background: item.progress?.status === 'completed'
                        ? '#10B981'
                        : '#CBD5E1',
                      transform: `translateX(${(item.offset + nextItem.offset) / 2}px) rotate(${
                        (nextItem.offset - item.offset) * 0.4
                      }deg)`,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Milestone Trophy / Treasure Chest at the end of the unit */}
        <div className="mt-8 flex flex-col items-center">
          <div 
            onClick={handleClaimChest}
            className={`relative p-5 rounded-3xl border-4 transition-all duration-300 flex flex-col items-center text-center max-w-xs ${
              isUnitFinished
                ? isMilestoneClaimed
                  ? 'bg-emerald-50 border-emerald-300 shadow-md'
                  : 'bg-amber-100/90 border-amber-400 shadow-[0_8px_0_#d97706] cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-slate-100 border-slate-300 opacity-70 cursor-not-allowed shadow-[0_4px_0_#94a3b8]'
            }`}
          >
            {/* Animated Chest Icon */}
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md mb-2 ${
              isUnitFinished
                ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 animate-pulse'
                : 'bg-slate-200'
            }`}>
              {isMilestoneClaimed ? '🏆' : isUnitFinished ? '🎁' : '🔒'}
            </div>

            <h4 className="font-heading font-black text-base sm:text-lg text-slate-800">
              {activeUnit.milestoneReward.title}
            </h4>

            <p className="text-xs text-slate-600 font-bold mb-3">
              {isMilestoneClaimed
                ? 'Milestone claimed! Unit complete ⭐'
                : isUnitFinished
                ? 'Tap here to unlock your unit milestone chest!'
                : `Complete all ${activeUnit.lessons.length} lessons to unlock`}
            </p>

            {/* Reward Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 font-extrabold text-xs">
                +{activeUnit.milestoneReward.coins} 🪙
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-200 text-cyan-900 font-extrabold text-xs">
                +{activeUnit.milestoneReward.gems} 💎
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Details Popover */}
      {selectedLesson && (
        <NodePopoverModal
          lesson={selectedLesson}
          unit={activeUnit}
          progress={progressMap[selectedLesson.id]}
          profile={profile}
          onStartLesson={(l) => {
            setSelectedLesson(null);
            onStartLesson(l);
          }}
          onClose={() => setSelectedLesson(null)}
          onRefillHearts={onRefillHearts}
          onGoToPractice={onGoToPractice}
        />
      )}
    </div>
  );
};
