import React, { useState } from 'react';
import { Lock, X, ShieldAlert } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface TeacherAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
  onUnlockAllStages?: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ onSuccess, onClose, onUnlockAllStages }) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Protected teacher secret password
  const TEACHER_SECRET_KEY = '01068545095';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === TEACHER_SECRET_KEY) {
      sounds.playCorrect();
      setIsVerified(true);
    } else {
      sounds.playIncorrect();
      setErrorMsg('Incorrect password! This section is restricted to instructors.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-left shadow-2xl border-2 border-slate-200 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner mb-4">
          <Lock className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h3 className="font-heading font-black text-2xl text-slate-800 text-center mb-1">
          {isVerified ? 'Verified Instructor! 👑' : 'Teacher Portal Access'}
        </h3>
        <p className="text-xs text-slate-500 font-semibold text-center mb-5">
          {isVerified 
            ? 'Welcome, Instructor! You can open the curriculum dashboard or unlock all stages.'
            : 'Access to curriculum management is protected by the instructor passkey.'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {isVerified ? (
          <div className="space-y-3">
            {onUnlockAllStages && (
              <button
                type="button"
                onClick={() => {
                  sounds.playFanfare();
                  onUnlockAllStages();
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-heading font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🌟 Unlock All Stages (100%)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onSuccess();
              }}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Enter Curriculum Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-600 mb-1.5">
                Instructor Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••••••"
                autoFocus
                required
                className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-center text-lg font-mono font-bold tracking-widest focus:border-purple-600 focus:outline-hidden transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-heading font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#6b21a8] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Verify & Enter
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
