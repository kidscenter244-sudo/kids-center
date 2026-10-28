import React from 'react';
import { Flame, Clock } from 'lucide-react';
import { LeaderboardUser, StudentProfile } from '../../types';
import { RobloxCharacter } from '../RobloxCharacter';

interface LeaderboardViewProps {
  users: LeaderboardUser[];
  profile: StudentProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ users, profile }) => {
  const sortedUsers = [...users].sort((a, b) => b.xpThisWeek - a.xpThisWeek);

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 pb-24 text-left select-none">
      {/* League Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-5 sm:p-8 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-4xl shadow-inner border border-white/30 shrink-0">
              🏆
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-white/80">Weekly Competition</span>
              <h1 className="font-heading font-black text-2xl sm:text-3xl leading-tight">
                Gold Champions League
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-white/90">
                Top 3 students promote to the Diamond League on Sunday!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl text-xs font-black shrink-0">
            <Clock className="w-4 h-4 text-amber-200" />
            <span>Resets in 3 days</span>
          </div>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md overflow-hidden">
        <div className="divide-y divide-slate-100">
          {sortedUsers.map((user, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const isCurrentUser = user.isCurrentUser;

            return (
              <div
                key={user.id}
                className={`p-3.5 sm:px-6 flex items-center justify-between gap-2.5 transition-colors ${
                  isCurrentUser
                    ? 'bg-blue-50/80 font-bold border-l-4 border-l-blue-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Rank & Student Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-heading font-black text-sm shrink-0 ${
                    rank === 1
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : rank === 2
                      ? 'bg-slate-200 text-slate-800'
                      : rank === 3
                      ? 'bg-amber-700 text-amber-100'
                      : 'text-slate-400'
                  }`}>
                    {rank}
                  </div>

                  <RobloxCharacter
                    name={isCurrentUser ? profile.name : user.name}
                    equippedHat={isCurrentUser ? profile.equippedHat : undefined}
                    size="sm"
                  />

                  <div className="min-w-0">
                    <p className="font-heading font-black text-sm text-slate-800 truncate">
                      {isCurrentUser ? `${profile.name} (You)` : user.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                      <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                      <span>{user.streak} days streak</span>
                    </div>
                  </div>
                </div>

                {/* Weekly XP Count */}
                <div className="text-right shrink-0">
                  <span className="font-heading font-black text-base sm:text-lg text-slate-800">
                    {user.xpThisWeek}
                  </span>
                  <span className="text-xs font-black text-indigo-500 ml-1">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
