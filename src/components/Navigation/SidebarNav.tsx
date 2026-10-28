import React from 'react';
import { 
  Compass, 
  Zap, 
  Trophy, 
  User, 
  GraduationCap,
  Lock,
  Lightbulb
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface SidebarNavProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  isTeacherUnlocked: boolean;
  onRequestTeacherAccess: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onNavigateTab,
  isTeacherUnlocked,
  onRequestTeacherAccess,
}) => {
  const navItems = [
    { id: 'path', label: 'Learning Path', sub: 'Main Journey', icon: Compass, badge: null, isProtected: false },
    { id: 'practice', label: 'Practice Arena', sub: 'Daily Hearts (1x)', icon: Zap, badge: '❤️ 1x/Day', isProtected: false },
    { id: 'leaderboard', label: 'Leaderboard', sub: 'Top Champions', icon: Trophy, badge: null, isProtected: false },
    { id: 'profile', label: 'Student Profile', sub: 'Stats & Badges', icon: User, badge: null, isProtected: false },
    { 
      id: 'teacher', 
      label: 'Teacher Portal', 
      sub: isTeacherUnlocked ? 'Curriculum Hub' : 'Password Protected', 
      icon: isTeacherUnlocked ? GraduationCap : Lock, 
      badge: isTeacherUnlocked ? 'Manage' : 'PIN',
      isProtected: !isTeacherUnlocked
    },
  ];

  const handleSelect = (item: typeof navItems[0]) => {
    sounds.playClick();
    if (item.id === 'teacher' && !isTeacherUnlocked) {
      onRequestTeacherAccess();
    } else {
      onNavigateTab(item.id);
    }
  };

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r-2 border-slate-200/80 bg-white min-h-[calc(100vh-57px)] p-4 shrink-0 select-none">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-xl ${isActive ? 'bg-emerald-200/60' : 'bg-slate-100'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700 stroke-[2.5]' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-heading font-black text-xs leading-tight">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{item.sub}</p>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Motivational Tip Card at bottom of sidebar */}
        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/90 text-left">
          <div className="flex items-center gap-1.5 mb-1 text-emerald-800 font-black text-xs">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Master Ninja Tip 🥋</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
            Completing 50 mental math questions daily triples brain speed and strengthens internal Soroban visualization!
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-2 py-1.5 flex items-center justify-around select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-600 font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 font-bold tracking-tight">{item.label.split(' ')[0]}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute -bottom-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
