import React from 'react';
import { 
  Lock, 
  Check, 
  Star, 
  Zap, 
  BookOpen, 
  RotateCcw, 
  ShieldAlert, 
  Trophy, 
  Crown,
  Sparkles
} from 'lucide-react';
import { Lesson, LessonProgress, NodeStatus, Unit } from '../../types';
import { sounds } from '../../services/soundEffects';

interface PathNodeProps {
  lesson: Lesson;
  unit: Unit;
  progress?: LessonProgress;
  isCurrent: boolean;
  offsetPercent: number; // Horizontal offset (-40 to +40)
  onSelectNode: (lesson: Lesson) => void;
  isSelected: boolean;
}

export const PathNode: React.FC<PathNodeProps> = ({
  lesson,
  unit,
  progress,
  isCurrent,
  offsetPercent,
  onSelectNode,
  isSelected,
}) => {
  const status: NodeStatus = progress?.status || (isCurrent ? 'current' : 'locked');
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';
  const stars = progress?.stars || 0;

  // Icon selector based on lesson type
  const renderIcon = () => {
    if (isLocked) {
      return <Lock className="w-7 h-7 text-slate-400 stroke-[2.5]" />;
    }
    if (isCompleted) {
      return <Check className="w-8 h-8 text-white stroke-[3.5]" />;
    }

    switch (lesson.type) {
      case 'practice':
        return <BookOpen className="w-7 h-7 text-white stroke-[2.5]" />;
      case 'quiz':
        return <Zap className="w-7 h-7 text-white stroke-[2.5]" fill="white" />;
      case 'review':
        return <RotateCcw className="w-7 h-7 text-white stroke-[2.5]" />;
      case 'checkpoint':
        return <ShieldAlert className="w-8 h-8 text-white stroke-[2.5]" />;
      case 'final_challenge':
        return <Crown className="w-8 h-8 text-white stroke-[2.5]" fill="white" />;
      default:
        return <Star className="w-7 h-7 text-white stroke-[2.5]" fill="white" />;
    }
  };

  const isMilestone = lesson.type === 'checkpoint' || lesson.type === 'final_challenge';

  // Base node styling based on state
  let nodeStyle = 'bg-slate-200 border-slate-300 text-slate-400 shadow-[0_6px_0_#94a3b8]';
  if (isCompleted) {
    nodeStyle = 'bg-emerald-500 border-emerald-400 text-white shadow-[0_8px_0_#059669] hover:bg-emerald-400';
  } else if (isCurrent) {
    nodeStyle = 'bg-amber-500 border-amber-300 text-white shadow-[0_8px_0_#d97706] ring-4 ring-amber-300/60 ring-offset-2 animate-bounce-subtle';
  } else if (!isLocked) {
    nodeStyle = `${unit.colorScheme.nodeBg} ${unit.colorScheme.nodeBorder} text-white hover:brightness-110 shadow-[0_8px_0_${unit.colorScheme.nodeShadow}]`;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    onSelectNode(lesson);
  };

  return (
    <div 
      className="relative flex flex-col items-center my-6 transition-all duration-300"
      style={{
        transform: `translateX(${offsetPercent}px)`,
      }}
    >
      {/* Current Pointer Indicator Badge ("START HERE") */}
      {isCurrent && (
        <div className="absolute -top-10 z-20 animate-bounce flex flex-col items-center">
          <div className="bg-amber-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md border-2 border-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START</span>
          </div>
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-amber-500 -mt-0.5"></div>
        </div>
      )}

      {/* Main Circular Node Button */}
      <button
        onClick={handleClick}
        disabled={isLocked}
        className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-150 select-none ${
          isMilestone ? 'w-22 h-22 border-4' : 'w-18 h-18 border-4'
        } ${nodeStyle} ${
          isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer active:translate-y-1.5 active:shadow-[0_2px_0_#00000020]'
        }`}
        aria-label={`${lesson.title} - ${status}`}
      >
        {/* Pulsing ring effect on active node */}
        {isCurrent && (
          <div className="absolute -inset-2 rounded-full border-2 border-amber-400 animate-ring-pulse pointer-events-none" />
        )}

        {/* Inner glow highlight on top edge */}
        <div className="absolute top-1 left-2 right-2 h-4 rounded-t-full bg-white/20 pointer-events-none" />

        {/* Central Icon */}
        <div className="relative z-10 drop-shadow-sm">
          {renderIcon()}
        </div>

        {/* Milestone Crown Accents */}
        {lesson.type === 'final_challenge' && !isLocked && (
          <div className="absolute -top-2 -right-1 text-base">⭐</div>
        )}
      </button>

      {/* Star Rating Badge for Completed Nodes */}
      {isCompleted && (
        <div className="flex items-center gap-0.5 mt-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
          {[1, 2, 3].map((starNum) => (
            <Star
              key={starNum}
              className={`w-3.5 h-3.5 ${
                starNum <= stars
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Lesson Label underneath */}
      <div className="mt-1 text-center max-w-[140px]">
        <p className={`text-xs font-bold truncate ${isCurrent ? 'text-amber-800' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
          {lesson.title}
        </p>
      </div>
    </div>
  );
};
