/**
 * Supabase Integration Layer for Kids Center Pro Games
 * Provides live connection handling, persistence for progress/economy,
 * and graceful fallback when credentials are being provisioned.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentProfile, LessonProgress, Unit, Lesson } from '../types';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('kcp_supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('kcp_supabase_key') || '' : '';

  // Prefer the current Vercel build-time environment values. Older browsers may
  // contain stale or incomplete credentials in localStorage from previous setup.
  const url = envUrl.trim() || storedUrl.trim();
  const anonKey = envKey.trim() || storedKey.trim();

  return { url, anonKey };
}

export function setSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kcp_supabase_url', url.trim());
    localStorage.setItem('kcp_supabase_key', anonKey.trim());
  }
  clientInstance = null; // reset client instance
}

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  const { url, anonKey } = getSupabaseCredentials();

  if (url && anonKey) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return clientInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey);
}

/**
 * Proposed PostgreSQL schema migration for Supabase
 * Integrates cleanly with Auth and enforces Row-Level Security (RLS)
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- Kids Center Pro Games: Gamified Learning Path Database Schema
-- Run this in your Supabase SQL Editor to support the Duolingo-style path
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  name text not null,
  role text default 'student' check (role in ('student', 'teacher', 'admin')),
  avatar_id text default 'sparky_otter',
  avatar_color text default '#3B82F6',
  equipped_hat text default null,
  equipped_badge text default null,
  xp integer default 0,
  level integer default 1,
  coins integer default 100,
  gems integer default 10,
  hearts integer default 5,
  max_hearts integer default 5,
  current_streak integer default 1,
  best_streak integer default 1,
  last_active_date date default current_date,
  streak_freeze_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Learning Units
create table if not exists public.learning_units (
  id text primary key,
  unit_number integer not null,
  title text not null,
  description text not null,
  color_scheme jsonb not null,
  guidebook jsonb default '{}'::jsonb,
  milestone_reward jsonb default '{"coins": 50, "gems": 5, "title": "Unit Trophy"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Learning Lessons
create table if not exists public.learning_lessons (
  id text primary key,
  unit_id text references public.learning_units(id) on delete cascade not null,
  title text not null,
  description text not null,
  type text not null check (type in ('practice', 'quiz', 'review', 'checkpoint', 'final_challenge')),
  lesson_order integer not null,
  xp_reward integer default 20,
  coins_reward integer default 10,
  estimated_minutes integer default 5,
  icon_name text,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Student Lesson Progress
create table if not exists public.student_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text references public.learning_lessons(id) on delete cascade not null,
  status text not null check (status in ('locked', 'available', 'current', 'completed')),
  stars integer default 0 check (stars >= 0 and stars <= 3),
  best_score_percent integer default 0,
  attempts_count integer default 0,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, lesson_id)
);

-- 5. Student Inventory & Purchases
create table if not exists public.student_inventory (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  item_id text not null,
  item_category text not null,
  acquired_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, item_id)
);

-- 6. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.learning_units enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.student_progress enable row level security;
alter table public.student_inventory enable row level security;

-- 7. Policies
-- Public / Read-all for curriculum
create policy "Allow read for learning units" on public.learning_units for select using (true);
create policy "Allow read for learning lessons" on public.learning_lessons for select using (true);

-- Student Profile Policies
create policy "Allow individual read of profiles" on public.profiles for select using (true);
create policy "Allow users to update own profile" on public.profiles for update using (auth.uid() = id);

-- Student Progress Policies
create policy "Allow student to read own progress" on public.student_progress for select using (auth.uid() = student_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'));
create policy "Allow student to insert/update own progress" on public.student_progress for all using (auth.uid() = student_id);

-- Student Inventory Policies
create policy "Allow student to read own inventory" on public.student_inventory for select using (auth.uid() = student_id);
create policy "Allow student to insert own inventory" on public.student_inventory for insert with check (auth.uid() = student_id);

-- Teacher Write Policies for curriculum
create policy "Allow teachers to insert lessons" on public.learning_lessons for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')));
create policy "Allow teachers to update lessons" on public.learning_lessons for update using (exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')));
`;
