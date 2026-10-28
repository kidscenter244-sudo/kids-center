import React, { useState } from 'react';
import { Zap, Heart, CheckCircle2, Play, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { StudentProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import confetti from 'canvas-confetti';

interface PracticeArenaProps {
  profile: StudentProfile;
  onRestoreHeart: (xpGain: number) => void;
}

interface MiniDrill {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  questions: {
    q: string;
    choices: string[];
    answer: string;
  }[];
}

const MATH_DRILLS: MiniDrill[] = [
  {
    id: 'drill-add-sub',
    title: 'Rapid Column Add & Subtract',
    category: '1 & 2 Digits',
    icon: '⚡',
    description: 'Instant vertical mental math to sharpen mental Soroban bead movements.',
    questions: [
      { q: '7 - 3 + 4 = ?', choices: ['8', '7', '9', '6'], answer: '8' },
      { q: '9 - 5 + 6 = ?', choices: ['10', '11', '9', '8'], answer: '10' },
      { q: '14 - 8 + 7 = ?', choices: ['13', '12', '14', '15'], answer: '13' },
      { q: '25 - 12 + 10 = ?', choices: ['23', '21', '25', '22'], answer: '23' },
    ],
  },
  {
    id: 'drill-mul',
    title: 'Instant Mental Multiplication',
    category: 'Times Tables & Double Digits',
    icon: '✖️',
    description: 'Rapid-fire 2 digits multiplied by 1 digit and 2 digits by 2 digits.',
    questions: [
      { q: '15 × 6 = ?', choices: ['90', '85', '95', '80'], answer: '90' },
      { q: '24 × 4 = ?', choices: ['96', '92', '98', '86'], answer: '96' },
      { q: '35 × 3 = ?', choices: ['105', '95', '115', '100'], answer: '105' },
    ],
  },
  {
    id: 'drill-div',
    title: 'Mental Division Reflexes',
    category: 'Clean Integer Division',
    icon: '➗',
    description: 'Quick mental division for two-digit and three-digit dividends.',
    questions: [
      { q: '84 ÷ 4 = ?', choices: ['21', '22', '19', '24'], answer: '21' },
      { q: '96 ÷ 8 = ?', choices: ['12', '14', '11', '13'], answer: '12' },
      { q: '144 ÷ 12 = ?', choices: ['12', '11', '13', '14'], answer: '12' },
    ],
  },
];

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const STORAGE_KEY_DAILY_DRILLS = 'kcp_daily_drills_tracker_v1';

function loadCompletedDrillsFromStorage(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_DRILLS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch (e) {
    console.error('Failed to load daily drills tracker:', e);
  }
  return {};
}

function saveCompletedDrillToStorage(drillId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const today = getTodayDateString();
    const map = loadCompletedDrillsFromStorage();
    map[`${drillId}_${today}`] = today;
    localStorage.setItem(STORAGE_KEY_DAILY_DRILLS, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save daily drill:', e);
  }
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({ profile, onRestoreHeart }) => {
  const [activeDrill, setActiveDrill] = useState<MiniDrill | null>(null);
  const [drillIndex, setDrillIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  const [completedTodayMap, setCompletedTodayMap] = useState<Record<string, boolean>>(() => {
    const today = getTodayDateString();
    const stored = loadCompletedDrillsFromStorage();
    const map: Record<string, boolean> = {};
    MATH_DRILLS.forEach((d) => {
      map[d.id] = stored[`${d.id}_${today}`] === today;
    });
    return map;
  });

  const completedCountToday = MATH_DRILLS.filter((d) => completedTodayMap[d.id]).length;
  const isAllDrillsCompletedToday = completedCountToday === MATH_DRILLS.length;

  const startDrill = (drill: MiniDrill) => {
    if (completedTodayMap[drill.id]) {
      sounds.playIncorrect();
      setWarningNotice(`You have already completed "${drill.title}" today! Each drill is available once daily (resets tomorrow) ⏳`);
      setTimeout(() => setWarningNotice(null), 4500);
      return;
    }

    sounds.playClick();
    setWarningNotice(null);
    setActiveDrill(drill);
    setDrillIndex(0);
    setSelectedChoice(null);
    setIsChecked(false);
    setDrillCompleted(false);
  };

  const currentQ = activeDrill?.questions[drillIndex];

  const handleConfirmAnswer = () => {
    if (!currentQ || !selectedChoice || isChecked) return;
    setIsChecked(true);

    if (selectedChoice === currentQ.answer) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }
  };

  const handleNext = () => {
    if (!activeDrill) return;

    if (drillIndex < activeDrill.questions.length - 1) {
      setDrillIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setIsChecked(false);
    } else {
      saveCompletedDrillToStorage(activeDrill.id);
      setCompletedTodayMap((prev) => ({ ...prev, [activeDrill.id]: true }));

      setDrillCompleted(true);
      sounds.playFanfare();
      onRestoreHeart(25);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-left select-none">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Daily Practice Arena • Once Daily</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl mb-1">
            Recharge Hearts with Mental Drills
          </h2>
          <p className="text-white/85 text-xs sm:text-sm font-semibold max-w-md leading-relaxed">
            Each of the 3 drills is available <strong className="text-amber-300">once per day</strong>. Completing a drill instantly restores <strong className="text-rose-200">+1 Energy Heart ❤️</strong> and awards <strong className="text-yellow-200">+25 XP</strong>.
          </p>
        </div>

        {/* Heart Status & Daily Completion Counter */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20 flex items-center gap-3">
            <Heart className="w-7 h-7 fill-rose-400 text-rose-400 animate-pulse" />
            <div>
              <p className="text-[10px] font-black uppercase text-white/70">Heart Energy</p>
              <p className="font-heading font-black text-lg">{profile.hearts} / {profile.maxHearts} Hearts</p>
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-md rounded-2xl px-3.5 py-1.5 border border-white/15 flex items-center gap-2 text-xs font-black text-amber-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Drills: {completedCountToday} / 3 Completed</span>
          </div>
        </div>
      </div>

      {/* Warning Notice Toast */}
      {warningNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="flex-1 leading-snug">{warningNotice}</p>
        </div>
      )}

      {/* All Drills Completed Congratulations Banner */}
      {isAllDrillsCompletedToday && !activeDrill && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg border-2 border-white/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner shrink-0">
            🏆
          </div>
          <div>
            <h3 className="font-heading font-black text-lg leading-tight mb-0.5">
              All 3 daily drills completed for today! 🌟
            </h3>
            <p className="text-xs text-white/90 font-semibold">
              You've maximized today's practice attempts (1/1 per drill). They will refresh automatically tomorrow to refill hearts.
            </p>
          </div>
        </div>
      )}

      {/* Drill Player Mode */}
      {activeDrill && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl mb-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <button
              onClick={() => setActiveDrill(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Drills</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                Daily Attempt (1/1)
              </span>
              <span className="text-xs font-black text-slate-500">
                Q{drillIndex + 1}/{activeDrill.questions.length}
              </span>
            </div>
          </div>

          {!drillCompleted && currentQ ? (
            <div className="max-w-md mx-auto flex flex-col items-center text-center">
              <span className="text-4xl mb-3">{activeDrill.icon}</span>
              <h3 className="font-mono font-black text-3xl sm:text-4xl text-slate-800 mb-6 tracking-wider">
                {currentQ.q}
              </h3>

              {/* Multiple choice options */}
              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                {currentQ.choices.map((choice) => {
                  const isSelected = selectedChoice === choice;
                  const isRight = choice === currentQ.answer;

                  let btnStyle = 'border-slate-200 hover:border-blue-400 text-slate-800';
                  if (isSelected) {
                    btnStyle = 'border-blue-500 bg-blue-50 text-blue-900 shadow-md';
                  }
                  if (isChecked) {
                    if (isRight) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black';
                    } else if (isSelected && !isRight) {
                      btnStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                    }
                  }

                  return (
                    <button
                      key={choice}
                      disabled={isChecked}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedChoice(choice);
                      }}
                      className={`py-4 rounded-2xl border-2 font-mono text-xl font-black transition-all cursor-pointer ${btnStyle}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {/* Action Button */}
              {isChecked ? (
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-black text-sm uppercase shadow-[0_4px_0_#059669] cursor-pointer"
                >
                  {drillIndex < activeDrill.questions.length - 1 ? 'Next Question' : 'Complete Drill & Collect Heart ❤️'}
                </button>
              ) : (
                <button
                  disabled={!selectedChoice}
                  onClick={handleConfirmAnswer}
                  className="w-full py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-heading font-black text-sm uppercase shadow-[0_4px_0_#2563eb] disabled:opacity-50 cursor-pointer"
                >
                  Confirm Answer
                </button>
              )}
            </div>
          ) : (
            /* Drill Complete Card */
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 flex items-center justify-center mb-3 shadow-inner">
                <Heart className="w-8 h-8 fill-rose-500 text-rose-500 animate-bounce" />
              </div>
              <h3 className="font-heading font-black text-2xl text-slate-800 mb-1">
                +1 Energy Heart Restored! ❤️
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 mb-2">
                You completed this daily drill and earned +25 XP!
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs mb-5">
                🔒 Locked for today • Refreshes automatically tomorrow (1x daily)
              </div>
              <div>
                <button
                  onClick={() => setActiveDrill(null)}
                  className="py-3 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase shadow-[0_4px_0_#059669] cursor-pointer"
                >
                  Back to Drills
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Drill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MATH_DRILLS.map((drill) => {
          const isDoneToday = completedTodayMap[drill.id];

          return (
            <div
              key={drill.id}
              onClick={() => {
                if (!isDoneToday) {
                  startDrill(drill);
                } else {
                  sounds.playClick();
                  setWarningNotice(`"${drill.title}" already completed today (1/1) ✓ Available again tomorrow.`);
                  setTimeout(() => setWarningNotice(null), 4000);
                }
              }}
              className={`p-5 rounded-3xl border-2 flex flex-col justify-between transition-all select-none ${
                isDoneToday
                  ? 'bg-slate-50 border-emerald-300 opacity-90 cursor-default'
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg cursor-pointer group'
              }`}
            >
              <div>
                {/* Top status indicator */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-3xl transition-transform ${isDoneToday ? 'opacity-80' : 'group-hover:scale-110'}`}>
                    {drill.icon}
                  </span>

                  {isDoneToday ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Done Today (1/1)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Available (1/1)</span>
                    </span>
                  )}
                </div>

                <h4 className="font-heading font-black text-lg text-slate-800 mb-1 leading-snug">
                  {drill.title}
                </h4>
                <p className="text-xs text-slate-500 font-semibold mb-2 leading-relaxed">
                  {drill.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                {isDoneToday ? (
                  <div className="flex items-center justify-between w-full text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-700 font-black">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed Today</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Resets Tomorrow</span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-black text-rose-600 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>+1 Heart</span>
                    </span>
                    <button
                      type="button"
                      className="text-xs font-black text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Practice</span>
                      <Play className="w-3 h-3 fill-blue-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
