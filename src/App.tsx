/**
 * Kids Center Pro: Gamified Mental Math Learning Experience
 * Duolingo-style learning path with cute Panda mascot, 50-question mental math exams,
 * energy hearts kick-out mechanics, human student avatars, and multi-device account persistence.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Unit, 
  Lesson, 
  StudentProfile, 
  LessonProgress, 
  DailyQuest, 
  Achievement, 
  Question 
} from './types';
import { 
  INITIAL_UNITS, 
  INITIAL_STUDENT_PROFILE, 
  INITIAL_PROGRESS, 
  DAILY_QUESTS, 
  ACHIEVEMENTS 
} from './data/mockData';
import { Header } from './components/Header';
import { SidebarNav } from './components/Navigation/SidebarNav';
import { LearningPathView } from './components/LearningPath/LearningPathView';
import { LessonPlayer } from './components/LessonEngine/LessonPlayer';
import { PracticeArena } from './components/Practice/PracticeArena';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { ProfileView } from './components/Profile/ProfileView';
import { TeacherDashboard } from './components/Teacher/TeacherDashboard';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/Auth/LoginScreen';
import { TeacherAuthModal } from './components/Teacher/TeacherAuthModal';
import { sounds } from './services/soundEffects';
import { 
  UserAccountData, 
  getCurrentSessionEmail, 
  getAccountByEmail, 
  saveCurrentAccountState, 
  logoutCurrentSession,
  createAllUnlockedProgress 
} from './services/accountStore';
import { getSupabaseClient } from './services/supabase';

export default function App() {
  // 1. Initial 5-Second Splash Screen
  const [showSplash, setShowSplash] = useState(true);

  // 2. Authentication & Multi-Device Session State
  // Do not trust the browser-only session flag as proof of a cloud login.
  // A stale local session can show old hearts/XP on a second device.
  const [activeAccount, setActiveAccount] = useState<UserAccountData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Restore only from a real Supabase session. If no authenticated cloud session
  // exists, require login rather than silently opening stale browser-local data.
  useEffect(() => {
    let cancelled = false;
    const restoreAuthenticatedSession = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data, error } = await supabase.auth.getUser();
      if (cancelled || error || !data.user?.email) return;
      const user = data.user;
      const local = getAccountByEmail(user.email);
      const gameState = user.user_metadata?.game_state;
      if (!gameState || !gameState.profile) return;
      lastRemoteSavedAt.current = String(gameState.savedAt || '');
      setCompletedPracticeDrills(Array.isArray(gameState.completedPracticeDrills) ? gameState.completedPracticeDrills : []);

      const cloudProfile = gameState.profile as StudentProfile;
      const restored: UserAccountData = {
        ...(local || {}),
        email: user.email.toLowerCase(),
        name: cloudProfile.name || String(user.user_metadata?.name || local?.name || user.email),
        username: cloudProfile.username || String(user.user_metadata?.username || local?.username || user.email.split('@')[0]),
        gender: (cloudProfile.gender || local?.gender || 'boy') as 'boy' | 'girl',
        avatarId: cloudProfile.avatarId || local?.avatarId || 'roblox_char',
        avatarColor: cloudProfile.avatarColor || local?.avatarColor || '#10B981',
        authProvider: 'email',
        profile: { ...INITIAL_STUDENT_PROFILE, ...cloudProfile, id: user.id, email: user.email },
        progressMap: (gameState.progressMap || local?.progressMap || INITIAL_PROGRESS) as Record<string, LessonProgress>,
        purchasedItemIds: (gameState.purchasedItemIds || local?.purchasedItemIds || []) as string[],
        activeUnitId: String(gameState.activeUnitId || local?.activeUnitId || INITIAL_UNITS[0]?.id || 'unit-simple'),
        lastUpdated: String(gameState.savedAt || new Date().toISOString()),
      };
      if (cancelled) return;
      setActiveAccount(restored);
      setProfile(restored.profile);
      setProgressMap(restored.progressMap);
      setPurchasedItemIds(restored.purchasedItemIds);
      setActiveUnitId(restored.activeUnitId);
      setIsLoggedIn(true);
    };
    void restoreAuthenticatedSession();
    return () => { cancelled = true; };
  }, []);

  // Teacher Protected PIN Access (PIN: 01068545095)
  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState(false);
  const [showTeacherAuthModal, setShowTeacherAuthModal] = useState(false);

  // 3. Persistent Game State (Restored from Account)
  const [profile, setProfile] = useState<StudentProfile>(() => {
    if (activeAccount?.profile) {
      return activeAccount.profile;
    }
    return INITIAL_STUDENT_PROFILE;
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    if (activeAccount?.units && Array.isArray(activeAccount.units)) {
      return activeAccount.units;
    }
    return INITIAL_UNITS;
  });

  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>(() => {
    if (activeAccount?.progressMap) {
      return activeAccount.progressMap;
    }
    return INITIAL_PROGRESS;
  });

  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>(() => {
    if (activeAccount?.purchasedItemIds) {
      return activeAccount.purchasedItemIds;
    }
    return ['avatar_alex', 'ninja_headband'];
  });

  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(DAILY_QUESTS);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [activeUnitId, setActiveUnitId] = useState<string>(activeAccount?.activeUnitId || units[0]?.id || 'unit-simple');
  const [activeTab, setActiveTab] = useState<string>('path');
  const [realLeaderboardUsers, setRealLeaderboardUsers] = useState<import('./types').LeaderboardUser[]>([]);
  const lastRemoteSavedAt = useRef('');
  const applyingRemoteState = useRef(false);
  const [completedPracticeDrills, setCompletedPracticeDrills] = useState<string[]>([]);


  // Only show students actually present in Supabase; never show seeded/demo leaderboard users.
  useEffect(() => {
    let cancelled = false;
    const loadRealLeaderboard = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) setRealLeaderboardUsers([]);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('id,username,name,avatar_id,avatar_color,xp,current_streak,role')
        .eq('role', 'student')
        .order('xp', { ascending: false })
        .limit(100);
      if (error) {
        console.error('Could not load real leaderboard:', error.message);
        if (!cancelled) setRealLeaderboardUsers([]);
        return;
      }
      if (!cancelled) {
        const students = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name || row.username || 'Student',
          avatarId: row.avatar_id || 'roblox_char',
          avatarColor: row.avatar_color || '#10B981',
          // Prefer live local XP for the signed-in student while the row syncs.
          xpThisWeek: row.id === profile.id ? Number(profile.xp || 0) : Number(row.xp || 0),
          streak: Number(row.id === profile.id ? profile.currentStreak : row.current_streak || 0),
          league: 'Gold' as const,
          isCurrentUser: row.id === profile.id,
        }));
        // Keep the authenticated student visible even if their profiles row is not created yet.
        if (profile.id && !students.some((student: any) => student.id === profile.id)) {
          students.push({
            id: profile.id,
            name: profile.name || profile.username || 'Student',
            avatarId: profile.avatarId || 'roblox_char',
            avatarColor: profile.avatarColor || '#10B981',
            xpThisWeek: Number(profile.xp || 0),
            streak: Number(profile.currentStreak || 0),
            league: 'Gold' as const,
            isCurrentUser: true,
          });
        }
        setRealLeaderboardUsers(students);
      }
    };
    void loadRealLeaderboard();
    const refreshTimer = window.setInterval(() => { void loadRealLeaderboard(); }, 5000);
    const supabase = getSupabaseClient();
    const channel = supabase?.channel('leaderboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        void loadRealLeaderboard();
      })
      .subscribe();
    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
      if (channel) void supabase?.removeChannel(channel);
    };
  }, [profile.id, profile.xp, profile.currentStreak]);
  const [activeLessonForPlayer, setActiveLessonForPlayer] = useState<Lesson | null>(null);

  // Refresh cloud state every 2.5 seconds so changes on another device appear without reload.
  useEffect(() => {
    if (!isLoggedIn) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    let cancelled = false;
    const refreshFromCloud = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (cancelled || error || !user?.email) return;
      const gameState = user.user_metadata?.game_state;
      if (!gameState?.profile || !gameState.savedAt) return;
      const savedAt = String(gameState.savedAt);
      if (savedAt <= lastRemoteSavedAt.current) return;
      lastRemoteSavedAt.current = savedAt;
      applyingRemoteState.current = true;
      setProfile((prev) => ({ ...prev, ...(gameState.profile as StudentProfile) }));
      if (gameState.progressMap) setProgressMap(gameState.progressMap as Record<string, LessonProgress>);
      if (Array.isArray(gameState.purchasedItemIds)) setPurchasedItemIds(gameState.purchasedItemIds);
      if (gameState.activeUnitId) setActiveUnitId(String(gameState.activeUnitId));
      if (Array.isArray(gameState.completedPracticeDrills)) setCompletedPracticeDrills(gameState.completedPracticeDrills);
      window.setTimeout(() => { applyingRemoteState.current = false; }, 0);
    };
    void refreshFromCloud();
    const timer = window.setInterval(() => { void refreshFromCloud(); }, 2500);
    const onFocus = () => { void refreshFromCloud(); };
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [isLoggedIn]);

  // Sync state continuously to user's persistent account
  useEffect(() => {
    // Never save default/anonymous state or a hard-coded demo account to the cloud.
    // This also prevents the first render from overwriting the cloud snapshot while
    // the authenticated session is still being restored.
    if (!isLoggedIn || !profile.email || applyingRemoteState.current) return;
    saveCurrentAccountState(profile.email, {
      profile,
      progressMap,
      purchasedItemIds,
      activeUnitId,
      units,
      completedPracticeDrills,
    });
  }, [isLoggedIn, profile, progressMap, purchasedItemIds, activeUnitId, units, completedPracticeDrills]);

  const activeUnit = units.find((u) => u.id === activeUnitId) || units[0];

  // Handle successful login with account data restored
  const handleLoginSuccess = (account: UserAccountData) => {
    setActiveAccount(account);
    setIsLoggedIn(true);
    setProfile(account.profile);
    setProgressMap(account.progressMap);
    setPurchasedItemIds(account.purchasedItemIds);
    setActiveUnitId(account.activeUnitId || units[0]?.id || 'unit-simple');
    if (account.units) {
      setUnits(account.units);
    }
  };

  // Handle Teacher Password Authentication (PIN 01068545095)
  const handleTeacherSuccess = () => {
    setIsTeacherUnlocked(true);
    setShowTeacherAuthModal(false);
    setProfile((prev) => ({ ...prev, role: 'teacher' }));
    setActiveTab('teacher');
  };

  // Start lesson with heart check
  const handleStartLesson = (lesson: Lesson) => {
    if (profile.hearts <= 0) {
      sounds.playIncorrect();
      // Guided prompt in path modal prevents start
      return;
    }
    setActiveLessonForPlayer(lesson);
  };

  // Handle Lesson Completion & Path Unlocking (50 Questions)
  const handleLessonComplete = (result: {
    lessonId: string;
    stars: number;
    scorePercent: number;
    xpEarned: number;
    coinsEarned: number;
    heartsRemaining: number;
  }) => {
    const existingProg = progressMap[result.lessonId];

    const updatedProgress: LessonProgress = {
      lessonId: result.lessonId,
      status: 'completed',
      stars: Math.max(existingProg?.stars || 0, result.stars),
      bestScorePercent: Math.max(existingProg?.bestScorePercent || 0, result.scorePercent),
      completedAt: new Date().toISOString(),
      attemptsCount: (existingProg?.attemptsCount || 0) + 1,
    };

    const newProgressMap = { ...progressMap, [result.lessonId]: updatedProgress };

    const currentUnitLessons = activeUnit.lessons;
    const currentIdx = currentUnitLessons.findIndex((l) => l.id === result.lessonId);

    if (currentIdx !== -1 && currentIdx < currentUnitLessons.length - 1) {
      const nextLesson = currentUnitLessons[currentIdx + 1];
      if (!newProgressMap[nextLesson.id] || newProgressMap[nextLesson.id].status === 'locked') {
        newProgressMap[nextLesson.id] = {
          lessonId: nextLesson.id,
          status: 'current',
          stars: 0,
          bestScorePercent: 0,
          attemptsCount: 0,
        };
      }
    } else if (currentIdx === currentUnitLessons.length - 1) {
      // Completed last lesson of this unit! Unlock first lesson of next unit
      const currentUnitIdx = units.findIndex((u) => u.id === activeUnit.id);
      if (currentUnitIdx !== -1 && currentUnitIdx < units.length - 1) {
        const nextUnit = units[currentUnitIdx + 1];
        const firstLessonOfNextUnit = nextUnit?.lessons[0];
        if (firstLessonOfNextUnit && (!newProgressMap[firstLessonOfNextUnit.id] || newProgressMap[firstLessonOfNextUnit.id].status === 'locked')) {
          newProgressMap[firstLessonOfNextUnit.id] = {
            lessonId: firstLessonOfNextUnit.id,
            status: 'available',
            stars: 0,
            bestScorePercent: 0,
            attemptsCount: 0,
          };
        }
      }
    }

    setProgressMap(newProgressMap);

    setProfile((prev) => {
      const newXp = prev.xp + result.xpEarned;
      const newLevel = Math.floor(newXp / 150) + 1;
      const newCoins = prev.coins + result.coinsEarned;

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        coins: newCoins,
        hearts: Math.max(result.heartsRemaining, 1),
      };
    });

    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest-1') {
          return { ...q, current: Math.min(q.target, q.current + result.xpEarned) };
        }
        if (q.id === 'quest-2') {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        if (q.id === 'quest-3' && result.scorePercent >= 95) {
          return { ...q, completed: true, current: 1 };
        }
        return q;
      })
    );

    setActiveLessonForPlayer(null);
  };

  const handleClaimMilestone = (unit: Unit) => {
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + unit.milestoneReward.coins,
      gems: prev.gems + unit.milestoneReward.gems,
    }));
  };

  // Heart refill mechanism (Cost: 40 Coins)
  const handleRefillHearts = () => {
    if (profile.coins < 40) return;
    sounds.playCorrect();
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins - 40,
      hearts: prev.maxHearts,
    }));
  };

  // Restore heart from free practice arena
  const handleRestoreHeartFromPractice = (xpGain: number) => {
    setProfile((prev) => ({
      ...prev,
      hearts: Math.min(prev.maxHearts, prev.hearts + 1),
      xp: prev.xp + xpGain,
    }));
  };

  const handleClaimQuest = (questId: string) => {
    const quest = dailyQuests.find((q) => q.id === questId);
    if (!quest) return;

    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + quest.rewardCoins,
    }));

    setDailyQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );
  };

  const handleAddQuestionToLesson = (unitId: string, lessonId: string, newQ: Question) => {
    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.id !== unitId) return u;
        return {
          ...u,
          lessons: u.lessons.map((l) => {
            if (l.id !== lessonId) return l;
            return {
              ...l,
              questions: [...l.questions, newQ],
            };
          }),
        };
      })
    );
  };

  // 1. Initial 5-Second Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Persistent Login Screen
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Distraction-Free Full-Screen Lesson Player (50 questions, vertical columns, direct input) */}
      {activeLessonForPlayer && (
        <LessonPlayer
          lesson={activeLessonForPlayer}
          profile={profile}
          onComplete={handleLessonComplete}
          onExit={(heartsRemaining, targetTab) => {
            if (heartsRemaining !== undefined) {
              setProfile((prev) => ({ ...prev, hearts: heartsRemaining }));
            }
            setActiveLessonForPlayer(null);
            if (targetTab) {
              setActiveTab(targetTab);
            }
          }}
          onRefillHearts={handleRefillHearts}
        />
      )}

      {/* Teacher Password Auth Modal (Secret PIN: 01068545095) */}
      {showTeacherAuthModal && (
        <TeacherAuthModal
          onSuccess={handleTeacherSuccess}
          onClose={() => setShowTeacherAuthModal(false)}
          onUnlockAllStages={() => {
            const unlocked = createAllUnlockedProgress(units);
            setProgressMap(unlocked);
          }}
        />
      )}

      {/* Main Navigation Header with Panda Mascot Logo */}
      <Header
        profile={profile}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onRefillHearts={handleRefillHearts}
        onRequestTeacherAccess={() => {
          if (isTeacherUnlocked) {
            setActiveTab('teacher');
          } else {
            setShowTeacherAuthModal(true);
          }
        }}
        isTeacherUnlocked={isTeacherUnlocked}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left Sidebar Navigation (Desktop) / Bottom Nav (Mobile) */}
        <SidebarNav
          activeTab={activeTab}
          onNavigateTab={(tab) => {
            if (tab === 'teacher' && !isTeacherUnlocked) {
              setShowTeacherAuthModal(true);
            } else {
              setActiveTab(tab);
            }
          }}
          isTeacherUnlocked={isTeacherUnlocked}
          onRequestTeacherAccess={() => setShowTeacherAuthModal(true)}
        />

        {/* Tab Router Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'path' && (
            <LearningPathView
              units={units}
              activeUnit={activeUnit}
              progressMap={progressMap}
              profile={profile}
              onSelectUnit={(u) => setActiveUnitId(u.id)}
              onStartLesson={handleStartLesson}
              onClaimMilestone={handleClaimMilestone}
              onRefillHearts={handleRefillHearts}
              onGoToPractice={() => setActiveTab('practice')}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeArena
              profile={profile}
              completedDrillIds={completedPracticeDrills}
              onDrillCompleted={(drillId) => setCompletedPracticeDrills((prev) => prev.includes(drillId) ? prev : [...prev, drillId])}
              onRestoreHeart={handleRestoreHeartFromPractice}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              users={realLeaderboardUsers}
              profile={profile}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              achievements={achievements}
              dailyQuests={dailyQuests}
              progressMap={progressMap}
              onClaimQuest={handleClaimQuest}
              onLogout={() => {
                logoutCurrentSession();
                setIsLoggedIn(false);
                setActiveAccount(null);
              }}
            />
          )}

          {activeTab === 'teacher' && isTeacherUnlocked && (
            <TeacherDashboard
              units={units}
              profile={profile}
              onAddQuestionToLesson={handleAddQuestionToLesson}
              onUpdateUnit={(updatedUnit) => {
                setUnits((prev) => prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u)));
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
