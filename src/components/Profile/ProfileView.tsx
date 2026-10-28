import React from 'react';
import { Flame, Star, Award, Zap, CheckCircle2, Target, LogOut } from 'lucide-react';
import { StudentProfile, Achievement, DailyQuest, LessonProgress } from '../../types';
import { RobloxCharacter } from '../RobloxCharacter';
import { sounds } from '../../services/soundEffects';

interface ProfileViewProps {
  profile: StudentProfile;
  achievements: Achievement[];
  dailyQuests: DailyQuest[];
  progressMap: Record<string, LessonProgress>;
  onClaimQuest: (questId: string) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  achievements,
  dailyQuests,
  progressMap,
  onClaimQuest,
  onLogout,
}) => {
  const totalStars = Object.values(progressMap).reduce((acc, p) => acc + (p.stars || 0), 0);
  const completedLessons = Object.values(progressMap).filter((p) => p.status === 'completed').length;

  const xpCurrentInLevel = profile.xp % 150;
  const levelProgressPercent = Math.min(100, Math.round((xpCurrentInLevel / 150) * 100));

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 pb-24 space-y-5 text-left select-none">
      {/* Profile Header Hero */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-4 flex-col sm:flex-row">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center p-2 shadow-inner">
            <RobloxCharacter
              name={profile.name}
              gender={profile.gender}
              equippedHat={profile.equippedHat}
              size="xl"
            />
          </div>

          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase mb-1">
              <span>Level {profile.level} · Soroban Champion</span>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-800">
              {profile.name}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-3">
              @{profile.username} {profile.email ? `• ${profile.email}` : ''}
            </p>

            {/* Level XP Bar */}
            <div className="max-w-xs mx-auto sm:ml-0">
              <div className="flex items-center justify-between text-xs font-black text-slate-600 mb-1">
                <span>Next Level Progress</span>
                <span>{xpCurrentInLevel} / 150 XP</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={() => {
              sounds.playClick();
              onLogout();
            }}
            className="px-4 py-2.5 rounded-2xl border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="text-[10px] font-black uppercase text-orange-600">Streak</span>
          </div>
          <p className="font-heading font-black text-2xl text-orange-950">{profile.currentStreak} Days</p>
          <p className="text-[11px] text-orange-700 font-semibold">Best: {profile.bestStreak} days</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between mb-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span className="text-[10px] font-black uppercase text-amber-600">Stars</span>
          </div>
          <p className="font-heading font-black text-2xl text-amber-950">{totalStars} ⭐</p>
          <p className="text-[11px] text-amber-700 font-semibold">Perfect scores</p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
          <div className="flex items-center justify-between mb-1">
            <Zap className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] font-black uppercase text-indigo-600">Total XP</span>
          </div>
          <p className="font-heading font-black text-2xl text-indigo-950">{profile.xp}</p>
          <p className="text-[11px] text-indigo-700 font-semibold">Points accumulated</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-emerald-600">Lessons</span>
          </div>
          <p className="font-heading font-black text-2xl text-emerald-950">{completedLessons}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">50-question tests</p>
        </div>
      </div>

      {/* Daily Quests Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm">
        <h3 className="font-heading font-black text-lg text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <span>Daily Goals & Quests</span>
        </h3>

        <div className="space-y-3">
          {dailyQuests.map((quest) => {
            const isCompleted = quest.current >= quest.target;

            return (
              <div
                key={quest.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{quest.icon}</span>
                  <div>
                    <h4 className="font-heading font-black text-sm text-slate-800">{quest.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{quest.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-black text-slate-500">
                    {quest.current}/{quest.target}
                  </span>
                  {quest.completed ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                      Claimed ✓
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => {
                        sounds.playCorrect();
                        onClaimQuest(quest.id);
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      +{quest.rewardCoins} 🪙 Claim
                    </button>
                  ) : (
                    <span className="text-xs font-black text-slate-400">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm">
        <h3 className="font-heading font-black text-lg text-slate-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Badges & Achievements</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <span className="text-3xl p-2 rounded-xl bg-white shadow-2xs border border-slate-200 shrink-0">
                {ach.icon}
              </span>
              <div>
                <h4 className="font-heading font-black text-sm text-slate-800">{ach.title}</h4>
                <p className="text-xs text-slate-500 font-semibold">{ach.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase text-amber-600">
                    +{ach.rewardCoins} Coins
                  </span>
                  {ach.unlocked && (
                    <span className="text-[10px] font-black text-emerald-600">Unlocked!</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
