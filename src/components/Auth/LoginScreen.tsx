import React, { useState } from 'react';
import { CuteBearLogo } from '../CuteBearLogo';
import { CheckCircle2, Key, ShieldCheck, X } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { loginWithGoogle, loginWithMasterSecret, UserAccountData } from '../../services/accountStore';

interface LoginScreenProps {
  onLoginSuccess: (account: UserAccountData) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [masterError, setMasterError] = useState('');

  const handleGoogleLogin = async () => {
    sounds.playClick();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await loginWithGoogle('student@kidscenter.com', 'Alex');
      if (res.success && res.account) {
        sounds.playCorrect();
        setSuccessMsg('Signed in with Google! Loading your profile...');
        setTimeout(() => onLoginSuccess(res.account!), 350);
      } else {
        setErrorMsg(res.error || 'Failed to sign in with Google.');
      }
    } catch {
      setErrorMsg('Google authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-amber-500/10 via-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-4 overflow-y-auto select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-200 text-center animate-in zoom-in-95 duration-200 my-auto">
        <div className="flex flex-col items-center mb-6">
          <CuteBearLogo size="lg" mood="excited" animate={true} className="mb-3" />
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-800">Welcome to Kids Center!</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2 max-w-xs">
            Continue with Google to access your learning adventure.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-black text-sm flex items-center justify-center gap-3 border-2 border-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{isLoading ? 'Loading...' : 'Continue with Google'}</span>
        </button>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMasterError('');
              setMasterPasswordInput('');
              setShowMasterModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="VIP Access"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>VIP Access</span>
          </button>
        </div>
      </div>

      {showMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-purple-200 relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowMasterModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              aria-label="Close VIP access"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-black text-xl text-slate-800 mb-1">VIP Master Access</h3>
            <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
              Enter the instructor passkey to unlock all curriculum units and stages.
            </p>
            {masterError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {masterError}
              </div>
            )}
            <form onSubmit={handleMasterUnlockSubmit} className="space-y-3.5">
              <input
                type="password"
                value={masterPasswordInput}
                onChange={(e) => {
                  setMasterPasswordInput(e.target.value);
                  setMasterError('');
                }}
                placeholder="Enter VIP passkey"
                autoFocus
                required
                className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-center text-lg font-mono tracking-widest font-black focus:border-purple-600 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-heading font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#581c87] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Unlock All Stages & Enter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
