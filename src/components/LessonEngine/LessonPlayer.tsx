import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Heart, 
  CheckCircle, 
  XCircle, 
  Flame, 
  Star, 
  Sparkles, 
  Dumbbell 
} from 'lucide-react';
import { Lesson, Question, StudentProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import { CuteBearLogo } from '../CuteBearLogo';
import confetti from 'canvas-confetti';

interface LessonPlayerProps {
  lesson: Lesson;
  profile: StudentProfile;
  onComplete: (result: {
    lessonId: string;
    stars: number;
    scorePercent: number;
    xpEarned: number;
    coinsEarned: number;
    heartsRemaining: number;
  }) => void;
  onExit: (heartsRemaining?: number, targetTab?: string) => void;
  onRefillHearts: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  profile,
  onComplete,
  onExit,
  onRefillHearts,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(profile.hearts);
  const [correctCount, setCorrectCount] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [isOutOfHearts, setIsOutOfHearts] = useState(false);

  // Student answer state (ONLY numeric input, no choices, no keypad)
  const [answerInput, setAnswerInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion: Question | undefined = lesson.questions[currentIndex];
  const totalQuestions = lesson.questions.length || 50;

  // Reset input and focus on question change
  useEffect(() => {
    setAnswerInput('');
    setIsAnswerChecked(false);
    setIsCurrentCorrect(false);

    // Auto-focus the input box
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [currentIndex]);

  // Keyboard shortcut listener (Enter to check/continue)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showExitConfirm || isCompleted || isOutOfHearts) return;

      if (e.key === 'Enter') {
        if (isAnswerChecked) {
          handleContinue();
        } else if (answerInput.trim().length > 0) {
          handleCheckAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerChecked, showExitConfirm, isCompleted, isOutOfHearts, answerInput, currentQuestion]);

  if (!currentQuestion && !isCompleted && !isOutOfHearts) {
    return null;
  }

  // Evaluate answer
  const handleCheckAnswer = () => {
    if (!currentQuestion || isAnswerChecked || answerInput.trim().length === 0) return;

    const studentNumber = parseInt(answerInput.trim(), 10);
    const correctNumber = currentQuestion.correctAnswerNumber;

    const correct = studentNumber === correctNumber;

    setIsCurrentCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      sounds.playCorrect();
      setCorrectCount((prev) => prev + 1);
    } else {
      sounds.playIncorrect();
      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);

      if (nextHearts === 0) {
        // Duolingo kick-out rule: kick student out when 5 hearts run out!
        setTimeout(() => {
          sounds.playStreakLost();
          setIsOutOfHearts(true);
        }, 550);
      }
    }
  };

  // Move to next question or complete lesson
  const handleContinue = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all 50 questions!
      const finalCorrect = correctCount + (isCurrentCorrect ? 1 : 0);
      const scorePercent = Math.round((finalCorrect / totalQuestions) * 100);

      let stars = 1;
      if (scorePercent >= 95) stars = 3;
      else if (scorePercent >= 75) stars = 2;

      setStarsEarned(stars);
      setIsCompleted(true);
      sounds.playFanfare();

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    }
  };

  const progressPercent = Math.round(((currentIndex) / totalQuestions) * 100);
  const isVerticalMath = currentQuestion?.mathRows && currentQuestion.mathRows.length > 0;
  const rowCount = currentQuestion?.mathRows?.length || 0;

  // Dynamic sizing based on row count (so 3 to 7 rows fit without clipping)
  const getRowFontSize = () => {
    if (rowCount >= 6) return 'text-2xl sm:text-3xl leading-snug';
    if (rowCount >= 4) return 'text-3xl sm:text-4xl leading-snug';
    return 'text-4xl sm:text-5xl leading-tight';
  };

  // ================= OUT OF HEARTS GAME OVER MODAL =================
  if (isOutOfHearts) {
    const canAffordRefill = profile.coins >= 40;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border-4 border-rose-300 animate-in zoom-in-95 duration-200">
          <div className="relative mb-3">
            <CuteBearLogo size="lg" mood="sad" animate={false} className="mx-auto" />
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 border-2 border-white shadow-md">
              <Heart className="w-6 h-6 fill-white" />
            </div>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-rose-600 mb-1 mt-3">
            Out of Hearts! (0/5) 💔
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600 mb-5 leading-relaxed">
            You lost all 5 energy hearts in this 50-question exam! Just like Duolingo, you cannot continue this exam until you restore hearts.
          </p>

          <div className="space-y-2.5">
            {/* Option 1: Buy refill now */}
            {canAffordRefill ? (
              <button
                onClick={() => {
                  onRefillHearts();
                  setHearts(5);
                  setIsOutOfHearts(false);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-heading font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Refill 5 Hearts Now (40 Coins 🪙)</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center">
                Current balance: {profile.coins} coins (40 needed for refill).
              </div>
            )}

            {/* Option 2: Go to practice arena to restore hearts */}
            <button
              onClick={() => {
                sounds.playClick();
                onExit(0, 'practice');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-heading font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#2563eb] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Earn Hearts in Practice Arena 🎯</span>
            </button>

            {/* Option 3: Exit back to path */}
            <button
              onClick={() => {
                sounds.playClick();
                onExit(0);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase transition-all cursor-pointer"
            >
              Exit to Learning Path
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= COMPLETION SCREEN =================
  if (isCompleted) {
    const finalScorePercent = Math.round((correctCount / totalQuestions) * 100);
    const xpReward = lesson.xpReward + (starsEarned === 3 ? 30 : 0);
    const coinsReward = lesson.coinsReward + (starsEarned === 3 ? 20 : 0);

    return (
      <div className="fixed inset-0 z-50 bg-amber-50/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-300 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_6px_0_#15803d] mb-4 animate-bounce">
            🏆
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-800 mb-1">
            Great Job, Math Champion!
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mb-5">
            You successfully completed all 50 questions in <strong className="text-slate-800">{lesson.title}</strong>
          </p>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((starNum) => (
              <div 
                key={starNum}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-md transition-all ${
                  starNum <= starsEarned
                    ? 'bg-amber-400 text-amber-950 shadow-[0_4px_0_#b45309] scale-110'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                <Star className={`w-7 h-7 sm:w-8 sm:h-8 ${starNum <= starsEarned ? 'fill-amber-950' : ''}`} />
              </div>
            ))}
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <span className="text-[10px] font-black uppercase text-indigo-500 block">XP Earned</span>
              <span className="font-heading font-black text-lg sm:text-xl text-indigo-900">+{xpReward}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-black uppercase text-amber-600 block">Coins</span>
              <span className="font-heading font-black text-lg sm:text-xl text-amber-900">+{coinsReward} 🪙</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-black uppercase text-emerald-600 block">Score</span>
              <span className="font-heading font-black text-lg sm:text-xl text-emerald-900">{correctCount}/50</span>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-3 border border-orange-200 mb-6 flex items-center justify-center gap-2 text-xs font-bold text-orange-900">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500 animate-flame" />
            <span>Streak blazing for Day {profile.currentStreak}! 🔥</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onComplete({
                lessonId: lesson.id,
                stars: starsEarned,
                scorePercent: finalScorePercent,
                xpEarned: xpReward,
                coinsEarned: coinsReward,
                heartsRemaining: hearts,
              });
            }}
            className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-heading font-black text-base uppercase tracking-wider shadow-[0_6px_0_#16a34a] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Claim Rewards & Continue 🚀
          </button>
        </div>
      </div>
    );
  }

  // ================= MAIN QUESTION VIEW =================
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Bar: Compact, clean, fully responsive */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-3 max-w-4xl mx-auto w-full shrink-0">
        {/* Exit Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowExitConfirm(true);
          }}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Exit Exam"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Progress Bar & Counter */}
        <div className="flex-1 max-w-md mx-2">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-500 mb-1">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 relative"
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-black text-xs sm:text-sm shrink-0">
          <Heart className={`w-4 h-4 ${hearts > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Main Center Area: Guaranteed to fit entire question without scrolling */}
      <div className="flex-1 overflow-y-auto px-4 py-2 sm:py-4 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
        {/* Stage tag */}
        <div className="text-center mb-2 shrink-0">
          <span className="text-[11px] sm:text-xs font-black uppercase px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {currentQuestion.subtitle || lesson.title} (Q{currentIndex + 1}/50)
          </span>
        </div>

        {/* The Math Problem Display */}
        {isVerticalMath ? (
          /* ================= VERTICAL MATH COLUMN (Entire problem fits on screen) ================= */
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-200 flex flex-col items-center min-w-[210px] sm:min-w-[260px] max-w-xs w-full transition-all">
            <div className={`w-full text-right font-mono font-black text-slate-800 tracking-wider space-y-0.5 sm:space-y-1 ${getRowFontSize()}`}>
              {currentQuestion.mathRows?.map((row, idx) => (
                <div key={idx} className="flex items-center justify-end gap-2 pr-4">
                  {/* ONLY '-' sign is displayed for the negative row. NO '+' sign is shown! */}
                  <span className="w-5 text-center text-rose-600 font-extrabold">
                    {row.isNegative ? '-' : ''}
                  </span>
                  <span className={row.isNegative ? 'text-rose-700' : 'text-slate-800'}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Horizontal line */}
            <div className="w-full h-1 bg-slate-800 rounded-full my-2.5" />

            {/* Direct Input Field for Answer (NO KEYPAD, NO CHOICES) */}
            <div className="w-full mt-1">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                disabled={isAnswerChecked}
                placeholder="Type result..."
                autoFocus
                className="w-full h-13 sm:h-15 bg-emerald-50/60 border-3 border-emerald-400 focus:border-emerald-600 rounded-2xl text-center font-mono text-2xl sm:text-3xl font-black text-emerald-950 focus:outline-hidden transition-all shadow-inner"
              />
            </div>
          </div>
        ) : (
          /* ================= HORIZONTAL MULTIPLICATION / DIVISION ================= */
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-md border-2 border-slate-200 flex flex-col items-center min-w-[240px] sm:min-w-[320px] max-w-sm w-full transition-all">
            <div className="font-mono text-3xl sm:text-5xl font-black text-slate-800 tracking-wider mb-4 text-center">
              {currentQuestion.prompt}
            </div>

            {/* Direct Input Field for Answer */}
            <div className="w-full">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                disabled={isAnswerChecked}
                placeholder="Type result..."
                autoFocus
                className="w-full h-13 sm:h-15 bg-emerald-50/60 border-3 border-emerald-400 focus:border-emerald-600 rounded-2xl text-center font-mono text-2xl sm:text-3xl font-black text-emerald-950 focus:outline-hidden transition-all shadow-inner"
              />
            </div>
          </div>
        )}

        <p className="text-[11px] font-semibold text-slate-400 mt-2 text-center">
          Type your number and press Enter or Check to confirm
        </p>
      </div>

      {/* Bottom Feedback & Confirmation Tray */}
      <div className={`p-3 sm:p-4 transition-all duration-200 border-t-2 shrink-0 ${
        isAnswerChecked
          ? isCurrentCorrect
            ? 'bg-emerald-50 border-emerald-300'
            : 'bg-rose-50 border-rose-300'
          : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Feedback message and explanation when checked */}
          {isAnswerChecked ? (
            <div className="flex items-center gap-2.5 w-full sm:w-auto text-left">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white ${
                isCurrentCorrect ? 'bg-emerald-500' : 'bg-rose-500'
              }`}>
                {isCurrentCorrect ? (
                  <CheckCircle className="w-6 h-6 stroke-[3]" />
                ) : (
                  <XCircle className="w-6 h-6 stroke-[3]" />
                )}
              </div>
              <div>
                <h4 className={`font-heading font-black text-base sm:text-lg leading-tight ${
                  isCurrentCorrect ? 'text-emerald-900' : 'text-rose-900'
                }`}>
                  {isCurrentCorrect ? 'Brilliant! Correct answer! 🎉' : 'Not quite right!'}
                </h4>
                <p className={`text-xs font-semibold mt-0.5 ${
                  isCurrentCorrect ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden sm:block text-xs font-semibold text-slate-400">
              Press Enter on your keyboard to instantly check answer
            </div>
          )}

          {/* Action Button: CHECK or CONTINUE */}
          <div className="w-full sm:w-auto shrink-0">
            {isAnswerChecked ? (
              <button
                onClick={handleContinue}
                className={`w-full sm:w-44 py-3 sm:py-3.5 px-6 rounded-2xl font-heading font-black text-sm uppercase tracking-wider text-white shadow-md active:translate-y-1 transition-all cursor-pointer ${
                  isCurrentCorrect
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_0_#059669]'
                    : 'bg-rose-500 hover:bg-rose-600 shadow-[0_4px_0_#e11d48]'
                }`}
              >
                Continue (Enter)
              </button>
            ) : (
              <button
                disabled={answerInput.trim().length === 0}
                onClick={handleCheckAnswer}
                className={`w-full sm:w-44 py-3 sm:py-3.5 px-6 rounded-2xl font-heading font-black text-sm uppercase tracking-wider transition-all ${
                  answerInput.trim().length > 0
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_0_#059669] active:translate-y-1 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-[0_3px_0_#cbd5e1]'
                }`}
              >
                Check Answer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-slate-200">
            <h3 className="font-heading font-black text-2xl text-slate-800 mb-2">
              Exit this exam?
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-6">
              Your progress in this 50-question exam will be lost if you leave now.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm uppercase shadow-[0_4px_0_#059669] cursor-pointer"
              >
                Keep Solving
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit(hearts);
                }}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs sm:text-sm cursor-pointer"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
