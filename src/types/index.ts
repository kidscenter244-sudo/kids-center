export type LessonType = 'practice' | 'quiz' | 'review' | 'checkpoint' | 'final_challenge';

export type NodeStatus = 'locked' | 'available' | 'current' | 'completed';

export type QuestionType = 
  | 'mental_math'
  | 'single_choice' 
  | 'multiple_select' 
  | 'word_order' 
  | 'true_false' 
  | 'matching';

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface MathRow {
  value: number;
  isNegative: boolean; // if true, subtract, shown with '-' sign. If false, positive, NO '+' sign shown!
}

export interface Question {
  id: string;
  lessonId: string;
  type: QuestionType;
  prompt: string;
  subtitle?: string;
  explanation: string;
  hint?: string;
  options?: QuestionOption[];
  correctOptionIds?: string[];
  points?: number;
  
  // Specific fields for Mental Math / Soroban progressive calculations
  mathRows?: MathRow[]; // For vertical addition & subtraction column (3 to 7 rows)
  mathOperation?: 'add_sub' | 'mul' | 'div';
  operandA?: number;
  operandB?: number;
  correctAnswerNumber?: number; // Exact numeric answer
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  type: LessonType;
  order: number;
  xpReward: number;
  coinsReward: number;
  estimatedMinutes: number;
  questions: Question[];
  iconName?: string;
  stageInfo?: string;
}

export interface MilestoneReward {
  title: string;
  coins: number;
  gems: number;
  badgeId?: string;
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    bgGradient: string;
    bannerBg: string;
    nodeBg: string;
    nodeBorder: string;
    nodeShadow: string;
  };
  guidebook: {
    summary: string;
    keyPoints: string[];
    tips: string[];
  };
  milestoneReward: MilestoneReward;
  lessons: Lesson[];
}

export interface LessonProgress {
  lessonId: string;
  status: NodeStatus;
  stars: number; // 0 to 3
  bestScorePercent: number;
  completedAt?: string;
  attemptsCount: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  authProvider?: 'email' | 'facebook' | 'google';
  gender?: 'boy' | 'girl';
  avatarId: string;
  avatarColor: string;
  equippedHat?: string;
  equippedBadge?: string;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  streakFreezeActive: boolean;
  role: 'student' | 'teacher';
  lastActiveUnitId?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'character' | 'hat' | 'badge' | 'powerup';
  description: string;
  costCoins: number;
  costGems: number;
  icon: string;
  previewColor?: string;
  isEquippable: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  completed: boolean;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rewardCoins: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarId: string;
  avatarColor: string;
  xpThisWeek: number;
  streak: number;
  league: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  isCurrentUser?: boolean;
}
