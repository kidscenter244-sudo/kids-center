import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Database, 
  Users, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  Key,
  Calculator
} from 'lucide-react';
import { Unit, Question, QuestionType, StudentProfile } from '../../types';
import { SUPABASE_SQL_SCHEMA, getSupabaseCredentials, setSupabaseCredentials, isSupabaseConfigured } from '../../services/supabase';
import { sounds } from '../../services/soundEffects';

interface TeacherDashboardProps {
  units: Unit[];
  profile: StudentProfile;
  onAddQuestionToLesson: (unitId: string, lessonId: string, question: Question) => void;
  onUpdateUnit: (updatedUnit: Unit) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  units,
  profile,
  onAddQuestionToLesson,
  onUpdateUnit,
}) => {
  const [activeTab, setActiveTab] = useState<'units' | 'create_quiz' | 'students' | 'supabase'>('units');
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState(units[0]?.lessons[0]?.id || '');

  // Math Question Creator Form State
  const [questionPrompt, setQuestionPrompt] = useState('Calculate the sum mentally:');
  const [questionType, setQuestionType] = useState<QuestionType>('mental_math');
  const [questionExplanation, setQuestionExplanation] = useState('');
  const [verticalNumbers, setVerticalNumbers] = useState('8, -3, 4');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Supabase Credentials State
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(creds.anonKey);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [connectionSaved, setConnectionSaved] = useState(false);

  const activeUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const activeLesson = activeUnit?.lessons.find((l) => l.id === selectedLessonId) || activeUnit?.lessons[0];

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    let newQuestion: Question;

    if (questionType === 'mental_math') {
      const parts = verticalNumbers.split(',').map((p) => p.trim());
      let sum = 0;
      const rows = parts.map((part) => {
        const val = parseInt(part, 10);
        if (isNaN(val)) return { value: 0, isNegative: false };
        if (val < 0) {
          sum += val;
          return { value: Math.abs(val), isNegative: true };
        } else {
          sum += val;
          return { value: val, isNegative: false };
        }
      });

      newQuestion = {
        id: `q-custom-${Date.now()}`,
        lessonId: selectedLessonId,
        type: 'mental_math',
        prompt: questionPrompt,
        subtitle: 'Custom Mental Drill',
        explanation: questionExplanation || `Calculated mental total: ${sum}`,
        mathRows: rows,
        correctAnswerNumber: sum,
        points: 10,
      };
    } else {
      newQuestion = {
        id: `q-custom-${Date.now()}`,
        lessonId: selectedLessonId,
        type: 'mental_math',
        prompt: '12 × 5 = ?',
        subtitle: 'Multiplication Drill',
        explanation: '12 × 5 = 60',
        correctAnswerNumber: 60,
        points: 10,
      };
    }

    onAddQuestionToLesson(selectedUnitId, selectedLessonId, newQuestion);
    sounds.playCorrect();
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    sounds.playCorrect();
    setConnectionSaved(true);
    setTimeout(() => setConnectionSaved(false), 4000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    sounds.playClick();
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 text-left select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-black uppercase mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instructor Control Center</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl mb-1">
            Teacher & Curriculum Management
          </h1>
          <p className="text-white/70 text-xs sm:text-sm font-semibold max-w-xl">
            Manage mental math units, create custom 50-question exams, monitor student performance, and configure Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shrink-0">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black">
            {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Storage Sync'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 overflow-x-auto no-scrollbar border border-slate-200">
        {[
          { id: 'units', label: 'Curriculum Units', icon: Layers },
          { id: 'create_quiz', label: 'Add Questions', icon: Plus },
          { id: 'students', label: 'Student Analytics', icon: Users },
          { id: 'supabase', label: 'Supabase Database', icon: Database },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(t.id as any);
              }}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Units Overview */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm hover:border-indigo-400 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Unit {unit.number}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {unit.lessons.length} Lessons (50 Qs each)
                  </span>
                </div>

                <h3 className="font-heading font-black text-lg text-slate-800 mb-1">
                  {unit.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
                  {unit.description}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  {unit.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-2 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-700 truncate mr-2">{lesson.title}</span>
                      <span className="font-black text-emerald-600 shrink-0">
                        {lesson.questions.length || 50} questions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Create Questions */}
      {activeTab === 'create_quiz' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm max-w-2xl">
          <h3 className="font-heading font-black text-xl text-slate-800 mb-2">
            Add Question to Exam Bank
          </h3>
          <p className="text-xs font-semibold text-slate-500 mb-6">
            Configure mental math numbers for vertical column calculation.
          </p>

          {showSuccessToast && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Question successfully added to lesson!</span>
            </div>
          )}

          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Select Unit
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => {
                    setSelectedUnitId(e.target.value);
                    const found = units.find((u) => u.id === e.target.value);
                    if (found && found.lessons[0]) setSelectedLessonId(found.lessons[0].id);
                  }}
                  className="w-full p-3 rounded-2xl border-2 border-slate-200 text-xs font-bold bg-white focus:border-indigo-500 focus:outline-hidden"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>Unit {u.number}: {u.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Target Lesson
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-slate-200 text-xs font-bold bg-white focus:border-indigo-500 focus:outline-hidden"
                >
                  {activeUnit.lessons.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Vertical Numbers (comma-separated, minus for subtraction):
              </label>
              <input
                type="text"
                value={verticalNumbers}
                onChange={(e) => setVerticalNumbers(e.target.value)}
                placeholder="e.g. 8, -3, 4"
                className="w-full p-3 rounded-2xl border-2 border-slate-200 text-sm font-mono focus:border-indigo-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Rule: exactly one row is negative and strictly smaller than the number directly above it.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider shadow-[0_5px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Save Question to Exam Bank
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Students Analytics */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm overflow-x-auto">
          <div className="mb-6">
            <h3 className="font-heading font-black text-xl text-slate-800">
              Student Performance Roster
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Track student progress, accuracy, stars, and mastered 50-question exams.
            </p>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] font-black uppercase text-slate-400">
                <th className="pb-3 px-2">Student</th>
                <th className="pb-3 px-2">Current Unit</th>
                <th className="pb-3 px-2">XP Points</th>
                <th className="pb-3 px-2">Streak</th>
                <th className="pb-3 px-2">Mastered Tests</th>
                <th className="pb-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {[
                { name: profile.name, unit: 'Unit 1: Simple Equations', xp: profile.xp, streak: profile.currentStreak, mastered: 1, status: 'Active Now' },
                { name: 'Maya S. (Speed Pro)', unit: 'Unit 4: Mul & Div', xp: 940, streak: 15, mastered: 12, status: 'Active Today' },
                { name: 'Leo K. (Soroban Ace)', unit: 'Unit 3: 2-Digit Columns', xp: 810, streak: 9, mastered: 8, status: 'Active Today' },
                { name: 'Emma R. (Logic Pro)', unit: 'Unit 2: 1-Digit Columns', xp: 320, streak: 6, mastered: 5, status: '2 days ago' },
              ].map((student, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-900">{student.name}</td>
                  <td className="py-3 px-2">{student.unit}</td>
                  <td className="py-3 px-2 text-indigo-600 font-bold">{student.xp} XP</td>
                  <td className="py-3 px-2 text-orange-600 font-bold">🔥 {student.streak}d</td>
                  <td className="py-3 px-2">{student.mastered} tests (50 Qs)</td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Supabase Integration */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-slate-200 shadow-sm">
            <h3 className="font-heading font-black text-xl sm:text-2xl text-slate-800 mb-1 flex items-center gap-2">
              <Key className="w-6 h-6 text-indigo-600" />
              <span>Supabase Cloud Integration</span>
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-6">
              Connect your Supabase project to persist student accounts, progress, and 50-question exam scores globally.
            </p>

            {connectionSaved && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 font-bold text-sm flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Supabase connection details saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full p-3 rounded-2xl border-2 border-slate-200 text-sm font-mono focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-3 rounded-2xl border-2 border-slate-200 text-sm font-mono focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                Save & Connect Supabase
              </button>
            </form>
          </div>

          {/* DDL Script */}
          <div className="bg-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400">PostgreSQL DDL & RLS</span>
                <h3 className="font-heading font-black text-xl text-white">
                  Database Migration Schema
                </h3>
              </div>
              <button
                onClick={handleCopySchema}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-black text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                {copiedSchema ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <pre className="bg-black/50 p-4 rounded-2xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-80 border border-white/10">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
