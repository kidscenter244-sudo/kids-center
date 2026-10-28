import { StudentProfile, LessonProgress, Unit } from '../types';
import { getSupabaseClient } from './supabase';
import { INITIAL_STUDENT_PROFILE, INITIAL_PROGRESS, INITIAL_UNITS } from '../data/mockData';
import { detectGenderFromName } from '../components/RobloxCharacter';

export interface UserAccountData {
  email: string;
  password?: string;
  name: string;
  username: string;
  gender: 'boy' | 'girl';
  avatarId: string;
  avatarColor: string;
  authProvider: 'email' | 'facebook' | 'google';
  profile: StudentProfile;
  progressMap: Record<string, LessonProgress>;
  purchasedItemIds: string[];
  activeUnitId: string;
  units?: Unit[];
  lastUpdated: string;
}

const STORAGE_KEY_ACCOUNTS = 'kcp_registered_accounts_v7_simple';
const STORAGE_KEY_CURRENT_SESSION = 'kcp_current_session_email_v7_simple';

// Seed initial default accounts if none exist
function getAccountsRegistry(): Record<string, UserAccountData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading accounts registry:', e);
  }

  // Pre-seed demo student account with Roblox boy character
  const defaultAccount: UserAccountData = {
    email: 'eyad09233@gmail.com',
    password: '123',
    name: 'Eyad',
    username: 'eyad_math_pro',
    gender: 'boy',
    avatarId: 'roblox_char',
    avatarColor: '#10B981',
    authProvider: 'google',
    profile: {
      ...INITIAL_STUDENT_PROFILE,
      id: 'student-eyad-1',
      name: 'Eyad',
      username: 'eyad_math_pro',
      email: 'eyad09233@gmail.com',
      gender: 'boy',
      avatarId: 'roblox_char',
      avatarColor: '#10B981',
      hearts: 5,
      coins: 200,
      xp: 420,
      level: 3,
      currentStreak: 5,
    },
    progressMap: { ...INITIAL_PROGRESS },
    purchasedItemIds: ['ninja_headband'],
    activeUnitId: 'unit-simple',
    lastUpdated: new Date().toISOString(),
  };

  const initialRegistry: Record<string, UserAccountData> = {
    'eyad09233@gmail.com': defaultAccount,
    'hero@kidscenter.com': {
      ...defaultAccount,
      email: 'hero@kidscenter.com',
      name: 'Alex',
      username: 'alex_soroban',
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initialRegistry));
  } catch (_) {}

  return initialRegistry;
}

function saveAccountsRegistry(registry: Record<string, UserAccountData>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(registry));
  } catch (e) {
    console.error('Failed to save accounts registry:', e);
  }
}

/**
 * Register a new student account with automatic Roblox gender detection
 */
export async function registerAccount(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; account?: UserAccountData; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address!' };
  }
  if (!password || password.length < 3) {
    return { success: false, error: 'Password must be at least 3 characters long!' };
  }
  if (!name.trim()) {
    return { success: false, error: 'Please enter student name!' };
  }

  const registry = getAccountsRegistry();
  if (registry[cleanEmail]) {
    return { success: false, error: 'This email is already registered! Please sign in.' };
  }

  // Automatic gender detection from name
  const gender = detectGenderFromName(name);
  const username = name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 899 + 100);
  const avatarColor = gender === 'girl' ? '#F472B6' : '#10B981';

  const newProfile: StudentProfile = {
    ...INITIAL_STUDENT_PROFILE,
    id: 'student_' + Date.now(),
    name: name.trim(),
    username,
    email: cleanEmail,
    authProvider: 'email',
    gender,
    avatarId: 'roblox_char',
    avatarColor,
    hearts: 5,
    maxHearts: 5,
    coins: 100,
    gems: 10,
    xp: 0,
    level: 1,
    currentStreak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
  };

  const newAccount: UserAccountData = {
    email: cleanEmail,
    password,
    name: name.trim(),
    username,
    gender,
    avatarId: 'roblox_char',
    avatarColor,
    authProvider: 'email',
    profile: newProfile,
    progressMap: {
      'us-l1': {
        lessonId: 'us-l1',
        status: 'current',
        stars: 0,
        bestScorePercent: 0,
        attemptsCount: 0,
      },
    },
    purchasedItemIds: ['ninja_headband'],
    activeUnitId: 'unit-simple',
    lastUpdated: new Date().toISOString(),
  };

  registry[cleanEmail] = newAccount;
  saveAccountsRegistry(registry);
  setCurrentSessionEmail(cleanEmail);

  // Sync with remote Supabase Auth if configured
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: name.trim(), gender, username },
        },
      });
    }
  } catch (err) {
    console.warn('Supabase remote registration fallback active:', err);
  }

  return { success: true, account: newAccount };
}

export const MASTER_SECRET_KEY = '01068545095';

/**
 * Creates an all-unlocked progress map where every lesson across all units is completed with 3 stars
 */
export function createAllUnlockedProgress(unitsList: Unit[] = INITIAL_UNITS): Record<string, LessonProgress> {
  const map: Record<string, LessonProgress> = {};
  unitsList.forEach((unit) => {
    unit.lessons.forEach((lesson) => {
      map[lesson.id] = {
        lessonId: lesson.id,
        status: 'completed',
        stars: 3,
        bestScorePercent: 100,
        attemptsCount: 3,
        completedAt: new Date().toISOString(),
      };
    });
  });
  return map;
}

/**
 * Secret Master Login: Opens all stages and unlocks 100% of curriculum
 */
export async function loginWithMasterSecret(
  secretCode: string,
  unitsList: Unit[] = INITIAL_UNITS
): Promise<{ success: boolean; account?: UserAccountData; error?: string }> {
  if (secretCode.trim() !== MASTER_SECRET_KEY) {
    return { success: false, error: 'Incorrect secret password! Access restricted.' };
  }

  const masterEmail = 'master@kidscenter.com';
  const registry = getAccountsRegistry();
  const allUnlocked = createAllUnlockedProgress(unitsList);

  const masterAccount: UserAccountData = {
    email: masterEmail,
    password: MASTER_SECRET_KEY,
    name: 'Master Instructor (All Stages)',
    username: 'master_super_admin',
    gender: 'boy',
    avatarId: 'roblox_char',
    avatarColor: '#8B5CF6',
    authProvider: 'email',
    profile: {
      ...INITIAL_STUDENT_PROFILE,
      id: 'student-master-vip',
      name: 'Master VIP (All Stages Unlocked)',
      username: 'master_super_admin',
      email: masterEmail,
      role: 'teacher',
      equippedHat: 'golden_crown',
      equippedBadge: 'trophy_4digit_grand_master',
      avatarColor: '#8B5CF6',
      xp: 9999,
      level: 50,
      coins: 9999,
      gems: 999,
      hearts: 5,
      maxHearts: 5,
      currentStreak: 99,
      bestStreak: 99,
    },
    progressMap: allUnlocked,
    purchasedItemIds: ['ninja_headband', 'golden_crown', 'grad_cap'],
    activeUnitId: unitsList[0]?.id || 'unit-simple',
    units: unitsList,
    lastUpdated: new Date().toISOString(),
  };

  registry[masterEmail] = masterAccount;
  saveAccountsRegistry(registry);
  setCurrentSessionEmail(masterEmail);

  return { success: true, account: masterAccount };
}

/**
 * Login with Email and Password (also supports Master Secret Password)
 */
export async function loginWithEmail(
  email: string,
  password: string,
  unitsList: Unit[] = INITIAL_UNITS
): Promise<{ success: boolean; account?: UserAccountData; error?: string }> {
  // If user entered the master secret password, immediately unlock all stages!
  if (password.trim() === MASTER_SECRET_KEY) {
    return loginWithMasterSecret(password.trim(), unitsList);
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Please enter your email address!' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password!' };
  }

  const registry = getAccountsRegistry();
  const account = registry[cleanEmail];

  // Try Supabase auth if configured
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (authData?.user && !authError) {
        if (account) {
          setCurrentSessionEmail(cleanEmail);
          return { success: true, account };
        }
      }
    }
  } catch (e) {
    console.warn('Supabase auth check fallback:', e);
  }

  if (!account) {
    return { success: false, error: 'No account found with this email. Would you like to create a new account?' };
  }

  if (account.password && account.password !== password) {
    return { success: false, error: 'Incorrect password! Please try again.' };
  }

  setCurrentSessionEmail(cleanEmail);
  return { success: true, account };
}

/**
 * Login with Google Account
 */
export async function loginWithGoogle(
  providedEmail?: string,
  providedName?: string
): Promise<{ success: boolean; account?: UserAccountData; error?: string }> {
  // If user passed specific google email or fallback to environment user email
  const googleEmail = (providedEmail || 'eyad09233@gmail.com').trim().toLowerCase();
  const googleName = providedName || (googleEmail.includes('eyad') ? 'Eyad' : 'Google Champion');

  // Try Supabase OAuth if available
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) console.warn('Supabase Google OAuth notice:', error);
    }
  } catch (err) {
    console.warn('Google auth fallback to integrated provider:', err);
  }

  const registry = getAccountsRegistry();
  let account = registry[googleEmail];

  if (!account) {
    const gender = detectGenderFromName(googleName);
    const newProfile: StudentProfile = {
      ...INITIAL_STUDENT_PROFILE,
      id: 'google_user_' + Date.now(),
      name: googleName,
      username: googleName.toLowerCase().replace(/\s+/g, '_'),
      email: googleEmail,
      authProvider: 'google',
      gender,
      avatarId: 'roblox_char',
      avatarColor: gender === 'girl' ? '#F472B6' : '#10B981',
      hearts: 5,
      maxHearts: 5,
      coins: 180,
      gems: 20,
      xp: 250,
      level: 2,
      currentStreak: 4,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    account = {
      email: googleEmail,
      name: googleName,
      username: googleName.toLowerCase().replace(/\s+/g, '_'),
      gender,
      avatarId: 'roblox_char',
      avatarColor: gender === 'girl' ? '#F472B6' : '#10B981',
      authProvider: 'google',
      profile: newProfile,
      progressMap: { ...INITIAL_PROGRESS },
      purchasedItemIds: ['ninja_headband'],
      activeUnitId: 'unit-simple',
      lastUpdated: new Date().toISOString(),
    };

    registry[googleEmail] = account;
    saveAccountsRegistry(registry);
  }

  setCurrentSessionEmail(googleEmail);
  return { success: true, account };
}

/**
 * Login with Facebook
 */
export async function loginWithFacebook(): Promise<{ success: boolean; account?: UserAccountData; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      });
      if (error) console.warn('Supabase FB OAuth notice:', error);
    }
  } catch (err) {
    console.warn('Facebook auth fallback to integrated provider:', err);
  }

  const fbEmail = 'fb_student@facebook.com';
  const registry = getAccountsRegistry();
  let account = registry[fbEmail];

  if (!account) {
    const fbName = 'Leo';
    const gender = detectGenderFromName(fbName);

    const newProfile: StudentProfile = {
      ...INITIAL_STUDENT_PROFILE,
      id: 'fb_user_' + Date.now(),
      name: fbName,
      username: 'fb_math_pro',
      email: fbEmail,
      authProvider: 'facebook',
      gender,
      avatarId: 'roblox_char',
      avatarColor: '#1877F2',
      hearts: 5,
      maxHearts: 5,
      coins: 150,
      gems: 15,
      xp: 120,
      level: 2,
      currentStreak: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    account = {
      email: fbEmail,
      name: fbName,
      username: 'fb_math_pro',
      gender,
      avatarId: 'roblox_char',
      avatarColor: '#1877F2',
      authProvider: 'facebook',
      profile: newProfile,
      progressMap: { ...INITIAL_PROGRESS },
      purchasedItemIds: ['ninja_headband'],
      activeUnitId: 'unit-simple',
      lastUpdated: new Date().toISOString(),
    };

    registry[fbEmail] = account;
    saveAccountsRegistry(registry);
  }

  setCurrentSessionEmail(fbEmail);
  return { success: true, account };
}

/**
 * Save user state persistently for their email account
 */
export function saveCurrentAccountState(
  email: string,
  state: {
    profile: StudentProfile;
    progressMap: Record<string, LessonProgress>;
    purchasedItemIds: string[];
    activeUnitId: string;
    units?: Unit[];
  }
) {
  if (!email || typeof window === 'undefined') return;
  const cleanEmail = email.trim().toLowerCase();
  const registry = getAccountsRegistry();

  const gender = state.profile.gender || detectGenderFromName(state.profile.name);

  const existing = registry[cleanEmail] || {
    email: cleanEmail,
    name: state.profile.name,
    username: state.profile.username,
    gender,
    avatarId: 'roblox_char',
    avatarColor: state.profile.avatarColor,
    authProvider: state.profile.authProvider || 'email',
  };

  registry[cleanEmail] = {
    ...existing,
    name: state.profile.name,
    gender,
    profile: {
      ...state.profile,
      gender,
    },
    progressMap: state.progressMap,
    purchasedItemIds: state.purchasedItemIds,
    activeUnitId: state.activeUnitId,
    units: state.units,
    lastUpdated: new Date().toISOString(),
  };

  saveAccountsRegistry(registry);

  // Sync only when Supabase Auth has a real authenticated user.
  // Local/demo IDs such as "student_..." are not UUIDs and cannot be used
  // as profiles.id because that column references auth.users(id).
  void (async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: state.profile.name,
        username: state.profile.username,
        xp: state.profile.xp,
        level: state.profile.level,
        coins: state.profile.coins,
        gems: state.profile.gems,
        hearts: state.profile.hearts,
        current_streak: state.profile.currentStreak,
      }, { onConflict: 'id' });

      if (error) console.error('Supabase profile sync failed:', error.message);
    } catch (err) {
      console.error('Supabase profile sync failed:', err);
    }
  })();
}

/**
 * Read current session email
 */
export function getCurrentSessionEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
}

export function setCurrentSessionEmail(email: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, email.trim().toLowerCase());
  localStorage.setItem('kcp_auth_session', 'true');
}

export function logoutCurrentSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
  localStorage.removeItem('kcp_auth_session');
}

/**
 * Get account data by email
 */
export function getAccountByEmail(email: string): UserAccountData | null {
  const registry = getAccountsRegistry();
  return registry[email.trim().toLowerCase()] || null;
}
