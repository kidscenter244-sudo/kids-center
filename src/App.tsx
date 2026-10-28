/**
 * Kids Center Pro: Gamified Mental Math Learning Experience
 * Duolingo-style learning path with cute Panda mascot, 50-question mental math exams,
 * energy hearts kick-out mechanics, human student avatars, and multi-device account persistence.
 */

import React, { useState, useEffect } from 'react';
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
  ACHIEVEMENTS, 
  LEADERBOARD_USERS 
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

export default function App() {
  // 1. Initial 5-Second Splash Screen
  const [showSplash, setShowSplash] = useState(true);

  // 2. Authentication & Multi-Device Session State
  const [activeAccount, setActiveAccount] = useState<UserAccountData | null>(() => {
    const sessionEmail = getCurrentSessionEmail();
    if (sessionEmail) {
      return getAccountByEmail(sessionEmail);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(getCurrentSessionEmail());
  });

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
  const [activeLessonForPlayer, setActiveLessonForPlayer] = useState<Lesson | null>(null);

  // Sync state continuously to user's persistent account
  useEffect(() => {
    const userEmail = profile.email || 'hero@kidscenter.com';
    saveCurrentAccountState(userEmail, {
      profile,
      progressMap,
      purchasedItemIds,
      activeUnitId,
      units,
    });
  }, [profile, progressMap, purchasedItemIds, activeUnitId, units]);

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
              onRestoreHeart={handleRestoreHeartFromPractice}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              users={LEADERBOARD_USERS}
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
