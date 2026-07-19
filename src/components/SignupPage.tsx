import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, Building, ArrowRight, Check, Heart, Activity, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabaseClient';

interface SignupPageProps {
  onSignup: () => void;
}

export default function SignupPage({ onSignup }: SignupPageProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!shopName.trim()) {
      setError('Please provide a Clinic / Hospital name.');
      return;
    }
    if (!email.trim() || !password || password.length < 6) {
      setError('Please enter a valid email and a password of at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: fullName.trim(),
            business_name: shopName.trim()
          }
        }
      });

      if (signUpError) {
        let msg = signUpError.message;
        if (
          msg.toLowerCase().includes('rate limit') || 
          msg.toLowerCase().includes('rate_limit') || 
          msg.toLowerCase().includes('60 seconds') || 
          msg.toLowerCase().includes('too many requests') ||
          msg.toLowerCase().includes('email provider')
        ) {
          msg = "Supabase Email Rate Limit Exceeded. To fix this instantly, please go to your Supabase Dashboard -> Authentication -> Providers -> Email, and disable 'Confirm email' (uncheck it). This allows immediate signups without any email verification bottlenecks!";
        }
        setError(msg);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      // Wait briefly for user feedback and redirect
      setTimeout(() => {
        onSignup();
        navigate('/overview');
      }, 1200);

    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during signup.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d172a] text-gray-300 font-sans relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden select-none">
      
      {/* Decorative ambient lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>
      
      {/* Dynamic ambient blur orbs */}
      <div className="absolute top-[5%] right-[15%] w-[450px] h-[450px] bg-[#2563eb]/10 rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[5%] left-[15%] w-[400px] h-[400px] bg-[#7c3aed]/5 rounded-full blur-[130px] pointer-events-none"></div>

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
          Start your free trial
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{' '}
          <Link to="/login" className="font-semibold text-[#2563eb] hover:text-[#2563eb]/90 transition-colors inline-flex items-center gap-1">
            sign in to your existing workspace <ArrowRight className="w-3 h-3" />
          </Link>
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

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 p-6 rounded-xl text-xs flex flex-col gap-3 items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 mb-2">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="font-bold text-base text-white">Registration Successful!</span>
              <p className="text-gray-400 leading-relaxed text-[11px] max-w-xs">
                Welcome <span className="text-[#2563eb] font-semibold">{fullName}</span>! Your MediCall medical workspace is ready. Redirecting to your dashboard...
              </p>
            </motion.div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
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

              <div>
                <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Full Name / Doctor Name
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#2563eb] transition-colors" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Balot Hussain"
                    className="block w-full pl-11 pr-3 py-2.5 bg-[#0d172a] border border-[#1e293b] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2563eb]/60 focus:ring-1 focus:ring-[#2563eb]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="shopName" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Clinic / Hospital Name
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#2563eb] transition-colors" />
                  </div>
                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Metro Cardiology Clinic"
                    className="block w-full pl-11 pr-3 py-2.5 bg-[#0d172a] border border-[#1e293b] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2563eb]/60 focus:ring-1 focus:ring-[#2563eb]/20 transition-all"
                  />
                </div>
              </div>

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
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Create Secure Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#2563eb] transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
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
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Confirm Secure Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#2563eb] transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="block w-full pl-11 pr-10 py-2.5 bg-[#0d172a] border border-[#1e293b] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2563eb]/60 focus:ring-1 focus:ring-[#2563eb]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  defaultChecked
                  className="h-4 w-4 rounded bg-[#0d172a] border-[#1e293b] text-[#2563eb] focus:ring-[#2563eb] focus:ring-offset-gray-900 cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2.5 block text-xs text-gray-400 cursor-pointer select-none">
                  I agree to the <span className="text-[#2563eb] font-semibold hover:underline">Terms of Service</span> and <span className="text-[#2563eb] font-semibold hover:underline">Privacy Policy</span>
                </label>
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
                      Create Workspace <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-[#1e293b] pt-6 flex flex-col items-center gap-4">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#2563eb] hover:text-[#2563eb]/90 transition-colors hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-[11px] text-center text-gray-500 leading-relaxed">
              No credit card required. Free trials include <span className="text-[#2563eb]/80 font-medium">500 outbound call minutes</span> and full custom AI voice prompt configurability.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
