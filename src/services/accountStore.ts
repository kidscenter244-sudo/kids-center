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

// Usernames are used in the UI; Supabase Auth still requires an email-shaped identifier.
// This internal alias is never shown to the student and does not require a real inbox.
function usernameLoginEmail(username: string): string {
  const normalized = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${normalized}@login.kidscenterpro.com`;
}

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

  // Store account-specific state only. Curriculum units are shared application data;
  // copying the entire curriculum into every account grows localStorage until it fails.
  const compactRegistry: Record<string, UserAccountData> = {};
  Object.entries(registry).forEach(([key, account]) => {
    const compactAccount = { ...account };
    delete compactAccount.units;
    compactRegistry[key] = compactAccount;
  });

  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(compactRegistry));
  } catch (error) {
    // Preserve student profile and lesson progress; drop only optional purchase history as fallback.
    const reducedRegistry: Record<string, UserAccountData> = {};
    Object.entries(compactRegistry).forEach(([key, account]) => {
      reducedRegistry[key] = { ...account, purchasedItemIds: [] };
    });
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(reducedRegistry));
      console.warn('Account registry saved without optional purchase history because browser storage is nearly full.');
    } catch (retryError) {
      console.error('Account registry still exceeds browser storage quota; cloud persistence is required.', retryError);
    }
  }
}

/**
 * Register a new student account with automatic Roblox gender detection
 */
export async function registerAccount(
  usernameInput: string,
  password: string,
  name: string
): Promise<{ success: boolean; account?: UserAccountData; error?: string }> {
  const cleanUsername = usernameInput.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters (letters and numbers only)!' };
  }
  const cleanEmail = usernameLoginEmail(cleanUsername);
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
  const username = cleanUsername;
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
  if (password.trim() === MASTER_SECRET_KEY) {
    return loginWithMasterSecret(password.trim(), unitsList);
  }

  const entered = email.trim().toLowerCase();
  if (!entered) return { success: false, error: 'Please enter your username!' };
  if (!password) return { success: false, error: 'Please enter your password!' };

  const registry = getAccountsRegistry();
  const localAccount = registry[entered] ||
    Object.values(registry).find((item) => item.username?.toLowerCase() === entered);
  const authEmails = Array.from(new Set([
    localAccount?.email,
    entered.includes('@') ? entered : '',
    usernameLoginEmail(localAccount?.username || entered),
  ].filter(Boolean) as string[]));

  const supabase = getSupabaseClient();
  let authErrorMessage = '';

  // Authenticate against Supabase first, then restore the student's cloud data.
  if (supabase) {
    for (const authEmail of authEmails) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
      if (error) {
        authErrorMessage = error.message;
        continue;
      }
      if (!data.user) continue;

      const user = data.user;
      const { data: cloudProfile, error: profileReadError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileReadError) {
        console.error('Could not load cloud student profile:', profileReadError.message);
      }

      const name = cloudProfile?.name || String(user.user_metadata?.name || localAccount?.name || entered);
      const username = cloudProfile?.username || String(user.user_metadata?.username || localAccount?.username || entered.split('@')[0]);
      const gender = (user.user_metadata?.gender || localAccount?.gender || detectGenderFromName(name)) as 'boy' | 'girl';
      const avatarColor = cloudProfile?.avatar_color || localAccount?.avatarColor || (gender === 'girl' ? '#F472B6' : '#10B981');

      // The auth user's metadata is our schema-independent source of truth for game state.
      // This avoids losing hearts/coins when the public profiles table lacks newer columns.
      const cloudGameState = (user.user_metadata?.game_state || {}) as Partial<UserAccountData>;
      const cloudSavedProfile = (cloudGameState.profile || {}) as Partial<StudentProfile>;
      let profile: StudentProfile = {
        ...(localAccount?.profile || INITIAL_STUDENT_PROFILE),
        ...cloudSavedProfile,
        id: user.id,
        name,
        username,
        email: user.email || authEmail,
        gender,
        avatarId: cloudProfile?.avatar_id || localAccount?.avatarId || 'roblox_char',
        avatarColor,
        equippedHat: cloudProfile?.equipped_hat ?? localAccount?.profile?.equippedHat ?? undefined,
        equippedBadge: cloudProfile?.equipped_badge ?? localAccount?.profile?.equippedBadge ?? undefined,
        xp: Number(cloudSavedProfile.xp ?? cloudProfile?.xp ?? localAccount?.profile?.xp ?? 0),
        level: Number(cloudSavedProfile.level ?? cloudProfile?.level ?? localAccount?.profile?.level ?? 1),
        coins: Number(cloudSavedProfile.coins ?? cloudProfile?.coins ?? localAccount?.profile?.coins ?? 100),
        gems: Number(cloudSavedProfile.gems ?? cloudProfile?.gems ?? localAccount?.profile?.gems ?? 10),
        hearts: Number(cloudSavedProfile.hearts ?? cloudProfile?.hearts ?? localAccount?.profile?.hearts ?? 5),
        maxHearts: Number(cloudSavedProfile.maxHearts ?? cloudProfile?.max_hearts ?? localAccount?.profile?.maxHearts ?? 5),
        currentStreak: Number(cloudSavedProfile.currentStreak ?? cloudProfile?.current_streak ?? localAccount?.profile?.currentStreak ?? 1),
        bestStreak: Number(cloudSavedProfile.bestStreak ?? cloudProfile?.best_streak ?? localAccount?.profile?.bestStreak ?? 1),
      };

      let progressMap = cloudGameState.progressMap || localAccount?.progressMap || { ...INITIAL_PROGRESS };
      const { data: cloudProgress, error: progressError } = await supabase
        .from('student_progress')
        .select('lesson_id,status,stars,best_score_percent,attempts_count,completed_at')
        .eq('student_id', user.id);
      if (progressError) console.error('Could not load cloud lesson progress:', progressError.message);
      if (cloudProgress?.length) {
        progressMap = {};
        cloudProgress.forEach((row: any) => {
          progressMap[row.lesson_id] = {
            lessonId: row.lesson_id,
            status: row.status,
            stars: Number(row.stars || 0),
            bestScorePercent: Number(row.best_score_percent || 0),
            attemptsCount: Number(row.attempts_count || 0),
            ...(row.completed_at ? { completedAt: row.completed_at } : {}),
          };
        });
      }

      let purchasedItemIds = cloudGameState.purchasedItemIds || localAccount?.purchasedItemIds || [];
      const { data: inventory, error: inventoryError } = await supabase
        .from('student_inventory')
        .select('item_id')
        .eq('student_id', user.id);
      if (inventoryError) console.error('Could not load cloud inventory:', inventoryError.message);
      if (inventory?.length) purchasedItemIds = inventory.map((row: any) => row.item_id);

      const account: UserAccountData = {
        ...(localAccount || {}),
        email: user.email || authEmail,
        password,
        name,
        username,
        gender,
        avatarId: profile.avatarId || 'roblox_char',
        avatarColor,
        authProvider: 'email',
        profile,
        progressMap,
        purchasedItemIds,
        activeUnitId: cloudGameState.activeUnitId || localAccount?.activeUnitId || unitsList[0]?.id || 'unit-simple',
        lastUpdated: new Date().toISOString(),
      };
      const nextRegistry = getAccountsRegistry();
      nextRegistry[account.email] = account;
      saveAccountsRegistry(nextRegistry);
      setCurrentSessionEmail(account.email);
      return { success: true, account };
    }
  }

  // Local fallback is allowed only for accounts already saved on this device.
  if (localAccount && localAccount.password === password) {
    setCurrentSessionEmail(localAccount.email);
    return { success: true, account: localAccount };
  }

  if (!supabase) {
    return { success: false, error: 'Cloud login is not configured. Please check the Supabase connection.' };
  }
  return {
    success: false,
    error: authErrorMessage.toLowerCase().includes('email not confirmed')
      ? 'This account needs email confirmation. Disable Confirm email in Supabase Auth settings, then register again.'
      : 'Username or password is incorrect, or this account has not been registered in Supabase yet.',
  };
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

      // Persist complete game state in Auth user metadata as a schema-independent fallback.
      // This includes hearts, coins, gems, XP, level, progress, purchases and selected unit.
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          game_state: {
            profile: state.profile,
            progressMap: state.progressMap,
            purchasedItemIds: state.purchasedItemIds,
            activeUnitId: state.activeUnitId,
            savedAt: new Date().toISOString(),
          },
        },
      });
      if (metadataError) console.error('Supabase game-state metadata sync failed:', metadataError.message);

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        name: state.profile.name,
        username: state.profile.username,
        avatar_id: state.profile.avatarId || 'roblox_char',
        avatar_color: state.profile.avatarColor,
        equipped_hat: state.profile.equippedHat ?? null,
        equipped_badge: state.profile.equippedBadge ?? null,
        xp: state.profile.xp,
        level: state.profile.level,
        coins: state.profile.coins,
        gems: state.profile.gems,
        hearts: state.profile.hearts,
        max_hearts: state.profile.maxHearts,
        current_streak: state.profile.currentStreak,
        best_streak: state.profile.bestStreak,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (profileError) {
        // Continue attempting the other cloud writes so one table's policy/schema issue
        // does not silently prevent every other sync operation.
        console.error('Supabase profile sync failed:', profileError.message);
      }

      // Persist lesson progress in the cloud so it follows the student to another device.
      const progressRows = Object.values(state.progressMap).map((progress) => ({
        student_id: user.id,
        lesson_id: progress.lessonId,
        status: progress.status,
        stars: progress.stars,
        best_score_percent: progress.bestScorePercent,
        attempts_count: progress.attemptsCount,
        completed_at: progress.completedAt ?? null,
        updated_at: new Date().toISOString(),
      }));

      if (progressRows.length) {
        const { error: progressError } = await supabase
          .from('student_progress')
          .upsert(progressRows, { onConflict: 'student_id,lesson_id' });
        if (progressError) console.error('Supabase lesson progress sync failed:', progressError.message);
      }

      // Keep purchased items in the cloud too. Ignore duplicate items safely.
      if (state.purchasedItemIds.length) {
        const inventoryRows = state.purchasedItemIds.map((itemId) => ({
          student_id: user.id,
          item_id: itemId,
          item_category: 'cosmetic',
        }));
        const { error: inventoryError } = await supabase
          .from('student_inventory')
          .upsert(inventoryRows, { onConflict: 'student_id,item_id' });
        if (inventoryError) console.error('Supabase inventory sync failed:', inventoryError.message);
      }
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
