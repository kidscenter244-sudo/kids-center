import React, { useState } from 'react';
import { CuteBearLogo } from '../CuteBearLogo';
import { RobloxCharacter, detectGenderFromName } from '../RobloxCharacter';
import { User, Mail, Lock, Smartphone, CheckCircle2, LogIn, UserPlus, Key, ShieldCheck, X } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { loginWithEmail, registerAccount, loginWithMasterSecret, UserAccountData } from '../../services/accountStore';

interface LoginScreenProps {
  onLoginSuccess: (account: UserAccountData) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('Alex');
  const [manualGenderOverride, setManualGenderOverride] = useState<'boy' | 'girl' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [masterError, setMasterError] = useState('');
  const currentGender: 'boy' | 'girl' = manualGenderOverride || detectGenderFromName(studentName);

  const handleMasterUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterError('');
    setIsLoading(true);
    try {
      const res = await loginWithMasterSecret(masterPasswordInput);
      if (res.success && res.account) {
        sounds.playFanfare();
        setShowMasterModal(false);
        setSuccessMsg('VIP verified! All curriculum stages are unlocked.');
        setTimeout(() => onLoginSuccess(res.account!), 500);
      } else {
        sounds.playIncorrect();
        setMasterError(res.error || 'Incorrect VIP passkey. Please try again.');
      }
    } catch {
      setMasterError('An error occurred during VIP authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const res = tab === 'login'
        ? await loginWithEmail(username, password)
        : await registerAccount(username, password, studentName);
      if (res.success && res.account) {
        if (tab === 'login') sounds.playCorrect(); else sounds.playFanfare();
        setSuccessMsg(tab === 'login' ? 'Signed in successfully! Restoring your progress...' : 'Welcome, champion! Your account has been created.');
        setTimeout(() => onLoginSuccess(res.account!), 350);
      } else {
        sounds.playIncorrect();
        setErrorMsg(res.error || (tab === 'login' ? 'Failed to sign in. Please verify your credentials.' : 'Failed to create account.'));
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-amber-500/10 via-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-4 overflow-y-auto select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-200 text-left animate-in zoom-in-95 duration-200 my-auto">
        <div className="flex flex-col items-center text-center mb-5">
          <CuteBearLogo size="lg" mood="excited" animate={true} className="mb-2" />
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-800">{tab === 'login' ? 'Welcome Back!' : 'Join Math Champions!'}</h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 max-w-xs">
            {tab === 'login' ? 'Sign in to resume your learning path, avatar, and stats' : 'Create an account to save your progress across any phone or PC'}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4 border border-slate-200">
          <button type="button" onClick={() => { sounds.playClick(); setTab('login'); setErrorMsg(''); setSuccessMsg(''); }} className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${tab === 'login' ? 'bg-white text-amber-700 shadow-sm border border-slate-200/80' : 'text-slate-500 hover:text-slate-800'}`}>
            <LogIn className="w-4 h-4" /><span>Sign In</span>
          </button>
          <button type="button" onClick={() => { sounds.playClick(); setTab('register'); setErrorMsg(''); setSuccessMsg(''); }} className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${tab === 'register' ? 'bg-white text-amber-700 shadow-sm border border-slate-200/80' : 'text-slate-500 hover:text-slate-800'}`}>
            <UserPlus className="w-4 h-4" /><span>New Account</span>
          </button>
        </div>

        {errorMsg && <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">{errorMsg}</div>}
        {successMsg && <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>{successMsg}</span></div>}

        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {tab === 'register' && <>
            <div>
              <label className="block text-xs font-black uppercase text-slate-600 mb-1">Student Name</label>
              <div className="relative">
                <input type="text" value={studentName} onChange={(e) => { setStudentName(e.target.value); setManualGenderOverride(null); setErrorMsg(''); }} placeholder="e.g. Alex or Maya" required className="w-full p-3 pl-10 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-800 focus:border-amber-500 focus:outline-hidden transition-colors" />
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs overflow-hidden"><RobloxCharacter name={studentName} gender={currentGender} size="sm" /></div>
                  <div><div className="flex items-center gap-1.5"><span className="font-heading font-black text-xs text-slate-800">Avatar Style</span><span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase ${currentGender === 'girl' ? 'bg-pink-100 text-pink-700' : 'bg-emerald-100 text-emerald-700'}`}>{currentGender === 'girl' ? 'Girl 👧' : 'Boy 👦'}</span></div><p className="text-[11px] text-slate-500 font-semibold">Auto-matched from student name!</p></div>
                </div>
                <button type="button" onClick={() => { sounds.playClick(); setManualGenderOverride(currentGender === 'boy' ? 'girl' : 'boy'); }} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer">Switch style</button>
              </div>
            </div>
          </>}

          <div>
            <label className="block text-xs font-black uppercase text-slate-600 mb-1">Username</label>
            <div className="relative">
              <input type="text" value={username} onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')); setErrorMsg(''); }} placeholder="e.g. alex123" minLength={3} autoComplete="username" required className="w-full p-3 pl-10 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-800 focus:border-amber-500 focus:outline-hidden transition-colors" />
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Remember your username and password to continue your progress on another device.</p>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-600 mb-1">Password</label>
            <div className="relative">
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }} placeholder="••••••" required className="w-full p-3 pl-10 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-800 focus:border-amber-500 focus:outline-hidden transition-colors" />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 pt-1"><Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" /><span>Progress syncs across phone, tablet, or PC</span></div>
          <button type="submit" disabled={isLoading} className="w-full py-3.5 sm:py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-heading font-black text-base uppercase tracking-wider shadow-[0_5px_0_#d97706] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50">
            {isLoading ? 'Loading...' : tab === 'login' ? 'Sign In & Resume Progress 🚀' : 'Create Account & Begin 🌟'}
          </button>
        </form>

        {tab === 'login' && <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button type="button" onClick={() => { sounds.playClick(); setMasterError(''); setMasterPasswordInput(''); setShowMasterModal(true); }} className="px-3 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs" title="VIP Access">
            <Key className="w-3.5 h-3.5 text-amber-600" /><span>VIP</span>
          </button>
        </div>}
      </div>

      {showMasterModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-purple-200 relative animate-in zoom-in-95 duration-200">
          <button type="button" onClick={() => setShowMasterModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"><X className="w-4 h-4" /></button>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 shadow-inner"><ShieldCheck className="w-8 h-8" /></div>
          <h3 className="font-heading font-black text-xl text-slate-800 mb-1">VIP Master Access</h3>
          <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">Enter VIP instructor passkey to unlock all curriculum units and stages.</p>
          {masterError && <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">{masterError}</div>}
          <form onSubmit={handleMasterUnlockSubmit} className="space-y-3.5">
            <input type="password" value={masterPasswordInput} onChange={(e) => { setMasterPasswordInput(e.target.value); setMasterError(''); }} placeholder="Enter VIP passkey" autoFocus required className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-center text-lg font-mono tracking-widest font-black focus:border-purple-600 focus:outline-hidden" />
            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-heading font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#581c87] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50">{isLoading ? 'Verifying...' : 'Unlock All Stages & Enter 🚀'}</button>
          </form>
        </div>
      </div>}
    </div>
  );
};
