import React, { useState } from 'react';
import { Lock, LogIn, ShieldAlert, User, UserPlus } from 'lucide-react';

interface AuthViewProps {
  onLogin: (username: string, password: string) => string | null;
  onRegister: (username: string, password: string, confirmPassword: string) => string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      setErrorMsg('অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন।');
      return;
    }

    if (mode === 'login') {
      const err = onLogin(cleanUser, password);
      if (err) setErrorMsg(err);
    } else {
      const err = onRegister(cleanUser, password, confirmPassword);
      if (err) setErrorMsg(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07110E] text-[#F0FDF4] flex flex-col justify-between p-4">
      {/* Top Demo Banner */}
      <div className="max-w-md w-full mx-auto pt-4">
        <div className="p-3.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-2.5 text-xs text-[#F0FDF4]">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <strong>শিক্ষামূলক ডেমো সংস্করণ (Demo App):</strong> এটি একটি ভার্চুয়াল বিনিয়োগ সিমুলেটর। এখানে কোনো আসল টাকার লেনদেন হয় না।
          </div>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md w-full mx-auto my-8 rounded-xl bg-[#0D1D18] border border-emerald-500/20 shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-[#10B981]" />

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-display text-3xl font-bold text-[#F0FDF4]">
              অর্থধারা (ডেমো)
            </h1>
            <p className="text-xs text-[#94A3B8]">
              {mode === 'login'
                ? 'আপনার ডেমো অ্যাকাউন্টে লগইন করুন'
                : 'নতুন ডেমো অ্যাকাউন্ট তৈরি করুন'}
            </p>
          </div>

          {/* Mode Toggle Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#07110E] rounded-lg border border-emerald-500/15">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#10B981] text-[#042F2E]'
                  : 'text-[#94A3B8] hover:text-[#F0FDF4]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>লগইন (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#10B981] text-[#042F2E]'
                  : 'text-[#94A3B8] hover:text-[#F0FDF4]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>রেজিস্টার (Register)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-username" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                ইউজারনেম (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="আপনার ইউজারনেম লিখুন"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="auth-confirm" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  কনফার্ম পাসওয়ার্ড (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] text-sm focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ডেমো অ্যাকাউন্টে প্রবেশ করুন</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>নতুন ডেমো অ্যাকাউন্ট খুলুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-xs text-[#64748B] pb-4">
        অর্থধারা — শুধুমাত্র ডেমো প্রদর্শনের জন্য নির্মিত সিমুলেটর অ্যাপ
      </div>
    </div>
  );
};
