import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, ArrowRight, Sparkles, ArrowLeft, CheckCircle2, Heart, Activity, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabaseClient';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim() || !password || password.length < 6) {
      setError('Please enter a valid email and a password of at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      // In the mockup backend or real Supabase, attempt signing in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) {
        let msg = signInError.message;
        if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('verification')) {
          msg = "Email not confirmed. To login immediately without verification, please go to your Supabase Dashboard -> Authentication -> Providers -> Email, and disable 'Confirm email' (uncheck it).";
        } else if (
          msg.toLowerCase().includes('rate limit') || 
          msg.toLowerCase().includes('rate_limit') || 
          msg.toLowerCase().includes('60 seconds') || 
          msg.toLowerCase().includes('too many requests')
        ) {
          msg = "Supabase login rate limit exceeded. To bypass verification checks and limits, go to your Supabase Dashboard -> Authentication -> Providers -> Email, and disable 'Confirm email'.";
        }
        setError(msg);
        setIsLoading(false);
        return;
      }

      onLogin();
      navigate('/overview');
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during login.');
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!forgotEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    
    setForgotLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim());

      if (resetError) {
        let msg = resetError.message;
        if (
          msg.toLowerCase().includes('rate limit') || 
          msg.toLowerCase().includes('rate_limit') || 
          msg.toLowerCase().includes('60 seconds') || 
          msg.toLowerCase().includes('too many requests')
        ) {
          msg = "Password reset rate limit hit. Try again in a minute, or go to your Supabase Dashboard to adjust rate limits under Auth Settings.";
        }
        setError(msg);
        setForgotLoading(false);
        return;
      }

      setForgotSuccess(true);
      setForgotLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger password reset.');
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d172a] text-gray-300 font-sans relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden select-none">
      
      {/* Decorative ambient lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>
      
      {/* Dynamic ambient blur orbs */}
      <div className="absolute top-[5%] left-[15%] w-[450px] h-[450px] bg-[#2563eb]/10 rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[5%] right-[15%] w-[400px] h-[400px] bg-[#7c3aed]/5 rounded-full blur-[130px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sm:mx-auto w-full sm:max-w-md z-10 px-4 sm:px-0"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-11 h-11 rounded-xl bg-[#121e36] border border-[#1e293b] flex items-center justify-center shadow-lg shadow-[#2563eb]/10 relative shrink-0"
            >
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0d172a] animate-pulse"></span>
              <div className="relative">
                <Heart className="w-5 h-5 text-[#2563eb] fill-[#2563eb]/10" />
                <Activity className="w-3.5 h-3.5 text-white absolute inset-0 m-auto mt-0.5 animate-pulse" />
              </div>
            </motion.div>
            <span className="font-display font-black text-white text-2xl tracking-tighter">
              Medi<span className="text-[#2563eb]">Call</span>
            </span>
          </Link>
        </div>
        <h2 className="text-center text-3xl font-display font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
          {mode === 'login' ? 'Welcome back' : 'Reset password'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          {mode === 'login' ? (
            <>
              Or{' '}
              <Link to="/signup" className="font-semibold text-[#2563eb] hover:text-[#2563eb]/90 transition-colors inline-flex items-center gap-1">
                create a new clinical AI account <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          ) : (
            <span>We will send you a secure link to reset your credentials</span>
          )}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className="mt-8 sm:mx-auto w-full sm:max-w-md z-10 px-4 sm:px-0"
      >
        <div className="bg-[#121e36] py-8 px-6 border border-[#1e293b] shadow-2xl sm:rounded-2xl sm:px-10 relative group/card hover:border-[#2563eb]/20 transition-all duration-300">
          {/* Card subtle upper lighting edge */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/30 to-transparent"></div>

          {mode === 'login' ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-950/45 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 shrink-0 text-red-500" />
                    <span className="font-semibold text-white">Error Encountered</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-[11px]">{error}</p>
                  
                  {(error.includes('Rate Limit') || error.includes('confirm') || error.includes('Confirm email') || error.includes('limit')) && (
                    <div className="mt-1 pt-3 border-t border-red-900/40 bg-slate-900/60 p-3 rounded-lg text-gray-300 text-[11px] leading-relaxed flex flex-col gap-2">
                      <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                        💡 INSTANT SOLUTION / FORI HAL:
                      </div>
                      <p className="text-gray-400 font-medium">
                        Supabase free tier limits emails. You can turn email confirmation off to instantly register and log in with zero limits:
                      </p>
                      
                      <ol className="list-decimal list-inside space-y-1 text-gray-300 ml-1">
                        <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] underline hover:text-[#2563eb]/80 font-semibold">Supabase Dashboard</a></li>
                        <li>Click <strong className="text-white">Authentication</strong> (Left side navigation)</li>
                        <li>Click <strong className="text-white">Providers</strong> -&gt; <strong className="text-white">Email</strong></li>
                        <li>Uncheck / Turn off <strong className="text-amber-400">"Confirm email"</strong></li>
                        <li>Click <strong className="text-white">Save</strong></li>
                      </ol>

                      <div className="mt-1 pt-2 border-t border-slate-800 text-[10px] text-gray-400 leading-normal">
                        <strong>Urdu/Hindi:</strong> Apne Supabase dashboard mein ja kar <span className="text-white">"Confirm email"</span> ko uncheck (disable) kar ke save kar dein. Is se bina kisi verification bottleneck ya limit ke signup/login foran chal pare ga!
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Email Address (Gmail, Yahoo, iCloud, Business Mail, etc.)
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#2563eb] transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@gmail.com, yahoo.com, or custom business mail"
                    className="block w-full pl-11 pr-3 py-2.5 bg-[#0d172a] border border-[#1e293b] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2563eb]/60 focus:ring-1 focus:ring-[#2563eb]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setForgotSuccess(false); }}
                    className="text-[10px] font-bold text-[#2563eb] hover:text-[#2563eb]/90 transition-colors uppercase tracking-wider cursor-pointer bg-transparent border-none outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#2563eb] transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-10 py-2.5 bg-[#0d172a] border border-[#1e293b] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2563eb]/60 focus:ring-1 focus:ring-[#2563eb]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#2563eb]/10 hover:shadow-[#2563eb]/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide border border-[#2563eb]/45"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleForgotSubmit}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-950/40 border border-red-900/30 text-red-400 px-4 py-3 rounded-xl text-xs flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {forgotSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 p-5 rounded-xl text-xs flex flex-col gap-2 items-center text-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0 mb-1" />
                  <span className="font-bold text-sm text-white">Reset Link Dispatched</span>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    If an account is associated with <span className="text-[#2563eb] font-semibold">{forgotEmail}</span>, a secure password reset link will arrive in a few minutes.
                  </p>
                </motion.div>
              ) : (
                <div>
                  <label htmlFor="forgotEmail" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Email Address (Gmail, Yahoo, iCloud, Business Mail, etc.)
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#2563eb] transition-colors" />
                    </div>
                    <input
                      id="forgotEmail"
                      name="forgotEmail"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="doctor@gmail.com, yahoo.com, or custom business mail"
                      className="block w-full pl-11 pr-3 py-2.5 bg-[#0d172a] border border-[#1e293b] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2563eb]/60 focus:ring-1 focus:ring-[#2563eb]/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {!forgotSuccess && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#2563eb]/10 hover:shadow-[#2563eb]/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide border border-[#2563eb]/45"
                  >
                    {forgotLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Send Reset Link <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setForgotSuccess(false); }}
                  className="w-full bg-[#121e36]/40 hover:bg-[#1a2e4c]/50 text-gray-300 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs border border-[#1e293b]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </motion.button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-gray-900 pt-6 flex flex-col items-center gap-4">
            <p className="text-sm text-gray-400">
              New to MediCall?{' '}
              <Link to="/signup" className="font-bold text-[#2563eb] hover:text-[#2563eb]/90 transition-colors hover:underline">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
