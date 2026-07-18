import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Sparkles, CheckCircle, Code, Shield, MessageSquare, 
  Calendar, Clock, Zap, Star, BarChart3, Settings, Share2, PhoneCall, ArrowRight, Activity, Smile, ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { LANDING_REVIEWS } from '../data';
import DialerSim from './DialerSim';
import FloatingChatWidget from './FloatingChatWidget';
import { AIAgent } from '../types';

interface LandingPageProps {
  onAppointmentBooked: (name: string, vehicle: string, service: string) => void;
  isLoggedIn?: boolean;
  agents?: AIAgent[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LandingPage({ onAppointmentBooked, isLoggedIn = false, agents = [] }: LandingPageProps) {
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] font-sans relative selection:bg-[#3B82F6] selection:text-white overflow-x-hidden">
      
      {/* Premium grid background */}
      <div className="absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-40 bg-[linear-gradient(to_right,#1F2937_1px,transparent_1px),linear-gradient(to_bottom,#1F2937_1px,transparent_1px)]"></div>

      {/* Subtle radial green and indigo ambient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8s] bg-[#3B82F6]/10"></div>
      <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[140px] pointer-events-none bg-[#8B5CF6]/8"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] rounded-full blur-[130px] pointer-events-none bg-[#EC4899]/5"></div>

      {/* HEADER NAVBAR */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all bg-[#0B1120]/80 border-[#1F2937]"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 8 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb]/20 to-[#7c3aed]/20 flex items-center justify-center border border-[#2563eb]/30 shadow-md shadow-[#2563eb]/10"
            >
              <PhoneCall className="w-5 h-5 text-[#2563eb] group-hover:text-[#7c3aed] transition-colors" />
            </motion.div>
            <span className="font-display font-black text-xl tracking-tighter text-white">
              Medi<span className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">Call</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#94A3B8]">
            <button onClick={() => scrollToSection('features')} className="transition-all cursor-pointer relative py-1 group hover:text-white">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#2563eb] group-hover:w-full transition-all duration-300"></span>
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="transition-all cursor-pointer relative py-1 group hover:text-white">
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#2563eb] group-hover:w-full transition-all duration-300"></span>
            </button>
            <button onClick={() => scrollToSection('live-demo')} className="hover:text-[#2563eb] transition-all cursor-pointer text-[#2563eb] font-bold relative py-1 group flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Demo
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2563eb]/40"></span>
            </button>
            <button onClick={() => scrollToSection('integration')} className="transition-all cursor-pointer relative py-1 group hover:text-white">
              Integrations
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#2563eb] group-hover:w-full transition-all duration-300"></span>
            </button>
            <button onClick={() => scrollToSection('reviews')} className="transition-all cursor-pointer relative py-1 group hover:text-white">
              Reviews
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#2563eb] group-hover:w-full transition-all duration-300"></span>
            </button>
          </nav>

          {/* Auth CTA Buttons */}
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="text-sm font-semibold transition-colors cursor-pointer text-[#94A3B8] hover:text-white">
                  Sign in
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="/signup"
                    className="bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#3B82F6] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#2563eb]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    Signup <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  to="/overview"
                  className="bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#3B82F6] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#2563eb]/20 flex items-center gap-1.5 cursor-pointer"
                >
                  Go to Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="relative pt-28 md:pt-40 pb-16 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            
            {/* Realtime API Badge */}
            <div className="mb-6 bg-[#2563eb]/10 text-[#2563eb] text-[11px] font-bold px-4 py-1.5 rounded-full border border-[#2563eb]/20 flex items-center gap-2 shadow-xl shadow-blue-950/20 tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping"></span>
              Powered by Gemini Clinical Realtime Voice
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white leading-[1.05] tracking-tight mb-6">
              Your Clinic <br />
              <span className="bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#3B82F6] bg-clip-text text-transparent">Never Misses</span> <br />
              a Patient Call
            </h1>

            {/* Subtitle */}
            <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed mb-8 max-w-xl">
              Deploy a state-of-the-art clinical AI voice receptionist that answers incoming patient calls, books clinical appointments, and logs medical queries 24/7, while your staff focus on the care.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link 
                  to={isLoggedIn ? "/overview" : "/signup"}
                  className="bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#3B82F6] text-white font-bold px-7 py-4 rounded-xl transition-all shadow-lg shadow-[#7c3aed]/20 text-center flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
                >
                  {isLoggedIn ? (
                    <>
                      Open Your Workspace <ArrowUpRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Start Free — No Card Needed <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Link>
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('live-demo')}
                className="bg-[#111827] hover:bg-[#111827]/80 text-[#F8FAFC] font-semibold px-7 py-4 rounded-xl border border-[#1F2937] hover:border-[#3B82F6]/30 transition-all text-center flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-current text-[#3B82F6]" /> Watch Demo
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <span className="w-9 h-9 rounded-full bg-emerald-700 border-2 border-[#0B1120] flex items-center justify-center text-[11px] font-bold text-white shadow-lg">MT</span>
                <span className="w-9 h-9 rounded-full bg-indigo-700 border-2 border-[#0B1120] flex items-center justify-center text-[11px] font-bold text-white shadow-lg">SL</span>
                <span className="w-9 h-9 rounded-full bg-amber-700 border-2 border-[#0B1120] flex items-center justify-center text-[11px] font-bold text-white shadow-lg">JR</span>
                <span className="w-9 h-9 rounded-full bg-teal-700 border-2 border-[#0B1120] flex items-center justify-center text-[11px] font-bold text-white shadow-lg">DC</span>
              </div>
              <div className="flex flex-col">
                <div className="flex gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-[#94A3B8] font-medium tracking-wide">Trusted by <span className="text-white font-semibold">200+ clinics & medical practices</span> nationwide</span>
              </div>
            </div>

          </motion.div>

          {/* Hero Right Mockup Windows */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 relative w-full"
          >
            {/* Ambient glow behind mockup */}
            <div className="absolute inset-0 bg-[#3B82F6]/10 rounded-2xl blur-3xl pointer-events-none -m-4"></div>
            
            {/* Dashboard Mockup Window */}
            <div className="bg-[#111827]/95 backdrop-blur-xl rounded-2xl border border-[#1F2937] shadow-2xl overflow-hidden relative group hover:border-[#3B82F6]/40 transition-colors duration-300">
              
              {/* Window Bar */}
              <div className="bg-[#020617] px-4 py-3 border-b border-[#1F2937] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-[10px] font-mono text-[#94A3B8] bg-[#020617] px-3 py-0.5 rounded border border-[#1F2937]">
                  app.medicall.ai/dashboard
                </div>
                <div className="w-6"></div>
              </div>

              {/* Window Content */}
              <div className="p-5 space-y-4">
                
                {/* 3 Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#020617]/55 p-3 rounded-xl border border-[#1F2937] hover:border-[#3B82F6]/20 transition-colors">
                    <span className="text-[10px] text-gray-500 block mb-0.5 font-bold uppercase tracking-wider">Calls Today</span>
                    <span className="text-xl font-extrabold text-white block">24</span>
                    <span className="text-[9px] text-[#10B981] block font-semibold">+8 today</span>
                  </div>
                  <div className="bg-[#020617]/55 p-3 rounded-xl border border-[#1F2937] hover:border-[#3B82F6]/20 transition-colors">
                    <span className="text-[10px] text-gray-500 block mb-0.5 font-bold uppercase tracking-wider">Bookings</span>
                    <span className="text-xl font-extrabold text-white block">17</span>
                    <span className="text-[9px] text-[#8B5CF6] block font-semibold">+5 today</span>
                  </div>
                  <div className="bg-[#020617]/55 p-3 rounded-xl border border-[#1F2937] hover:border-[#3B82F6]/20 transition-colors">
                    <span className="text-[10px] text-gray-500 block mb-0.5 font-bold uppercase tracking-wider">Conversion</span>
                    <span className="text-xl font-extrabold text-white block">71%</span>
                    <span className="text-[9px] text-[#3B82F6] block font-semibold">+3% today</span>
                  </div>
                </div>

                {/* Trend Bars chart */}
                <div className="bg-[#020617]/55 p-4 rounded-xl border border-[#1F2937]">
                  <div className="flex items-end justify-between h-20 gap-1 px-1 mb-2">
                    {[3, 4, 2, 5, 4, 6, 5, 8, 7, 9, 8, 12].map((val, idx) => (
                      <div 
                        key={idx} 
                        style={{ height: `${(val / 12) * 100}%` }}
                        className={`w-full rounded-t-sm transition-all duration-500 ${idx === 11 ? 'bg-gradient-to-t from-[#3B82F6] via-[#8B5CF6] to-[#EC4899]' : 'bg-[#1F2937]/30'}`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 font-mono tracking-wider uppercase">14-day conversation trend</span>
                    <span className="text-[9px] text-[#3B82F6] font-mono flex items-center gap-0.5"><Activity className="w-2.5 h-2.5" /> Live syncing</span>
                  </div>
                </div>

                {/* Active Live Call Panel */}
                <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center animate-pulse">
                      <PhoneCall className="w-4 h-4 text-[#3B82F6]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#2563eb] font-bold block tracking-wide">Live Call in Progress</span>
                      <span className="text-[10px] text-[#94A3B8] block">Cardiovascular consultation appointment booking</span>
                    </div>
                  </div>
                  
                  {/* Small equalizer sound wave animation */}
                  <div className="flex items-end gap-0.5 h-4 px-2">
                    <div className="w-[2.5px] bg-[#3B82F6] rounded-full h-2 animate-wave-1"></div>
                    <div className="w-[2.5px] bg-[#3B82F6] rounded-full h-3.5 animate-wave-2"></div>
                    <div className="w-[2.5px] bg-[#3B82F6] rounded-full h-1 animate-wave-3"></div>
                    <div className="w-[2.5px] bg-[#3B82F6] rounded-full h-3 animate-wave-4"></div>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>

        </div>
      </section>

      {/* STATS STRIP SECTION */}
      <section className="bg-[#111827]/80 backdrop-blur-md border-y border-[#1F2937] py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "24/7", label: "Availability" },
            { value: "<1s", label: "Voice Latency" },
            { value: "3x", label: "More Bookings" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-2"
            >
              <span className="text-3xl md:text-4xl font-extrabold text-white block mb-0.5 bg-gradient-to-r from-white via-[#94A3B8] to-[#EC4899] bg-clip-text text-transparent">{stat.value}</span>
              <span className="text-[10px] text-[#3B82F6] font-bold uppercase tracking-widest">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#3B82F6]/20 uppercase tracking-widest">
            ⚡ Platform Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-4 mb-4 tracking-tight">
            Everything your clinic needs to run
          </h2>
          <p className="text-[#94A3B8] text-xs md:text-sm leading-relaxed">
            Engineered exclusively for medical clinics & clinical offices. Connects directly to patient scheduling pipelines, with zero lag and secure clinical call logs.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          
          {/* Featured Large Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: "#3B82F6" }}
            className="md:col-span-2 bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group/card transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div>
              <span className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-md">
                🎙️ AI Core
              </span>
              <h3 className="text-2xl font-display font-extrabold text-white mt-4 mb-2">GPT-4o Realtime Voice Engine</h3>
              <p className="text-[#94A3B8] text-xs md:text-sm max-w-md leading-relaxed mb-6">
                Sub-second latency, natural turn-taking, and smart interruption handling. Customers have genuine conversations — not robotic option menus.
              </p>
            </div>
            
            {/* Waveform line visualization */}
            <div className="bg-[#020617]/85 border border-[#1F2937] rounded-xl p-4 flex items-center justify-between mt-4">
              <div className="flex gap-1 items-center h-12 w-full">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-[3px] bg-[#3B82F6] rounded-full" 
                    style={{ 
                      height: `${15 + Math.abs(Math.sin(i * 0.4)) * 75}%`,
                    }}
                  ></div>
                ))}
              </div>
              <span className="text-[10px] text-[#3B82F6] font-mono whitespace-nowrap ml-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
                Voice waveform
              </span>
            </div>
          </motion.div>

          {/* Feature 2: Smart Appointment Booking */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: "#8B5CF6" }}
            className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20 text-[#8B5CF6] mb-6 shadow-md shadow-purple-500/5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wide mb-1.5">Smart Booking Engine</h4>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                Checks live availability, reserves real time slots, and integrates directly with your schedule. No double-bookings ever.
              </p>
            </div>
          </motion.div>

          {/* Feature 3: Always On */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: "#F59E0B" }}
            className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center border border-[#F59E0B]/20 text-[#F59E0B] mb-6 shadow-md shadow-amber-500/5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wide mb-1.5">24/7 Availability</h4>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                Every call answered, even in the middle of the night or on weekends when your shop is closed.
              </p>
            </div>
          </motion.div>

          {/* Feature 4: Conversation Intelligence */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: "#3B82F6" }}
            className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20 text-[#3B82F6] mb-6 shadow-md shadow-blue-500/5">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wide mb-1.5">Intelligent Analytics</h4>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                Sentiment tracking, key topics, client preferences, and booking conversion rates are automatically recorded for every call.
              </p>
            </div>
          </motion.div>

          {/* Feature 5: Fully Configurable */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: "#EC4899" }}
            className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EC4899]/10 flex items-center justify-center border border-[#EC4899]/20 text-[#EC4899] mb-6 shadow-md shadow-orange-500/5">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wide mb-1.5">Tailored Knowledge</h4>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                Configure voice pitch, custom services, FAQ answers, and greeting notes. Train the agent on your exact shop business rules.
              </p>
            </div>
          </motion.div>

          {/* Feature 6: One Script Tag Setup */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: "#EC4899" }}
            className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EC4899]/10 flex items-center justify-center border border-[#EC4899]/20 text-[#EC4899] mb-6 shadow-md shadow-pink-500/5">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wide mb-1.5">Copypaste Embed</h4>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                Works instantly on WordPress, Wix, Webflow, Shopify, or custom HTML templates. Paste the script and let it run.
              </p>
            </div>
          </motion.div>

          {/* Feature 7: Enterprise Security */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: "#10B981" }}
            className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20 text-[#10B981] mb-6 shadow-md shadow-emerald-500/5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wide mb-1.5">Secure Sandbox</h4>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                Fully protected workspace settings, isolated user databases, client-side encryption, and complete transparency.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* QUICK SETUP */}
      <section id="how-it-works" className="py-24 bg-[#111827]/90 backdrop-blur-md border-y border-[#1F2937] relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-xl mx-auto mb-20">
            <span className="bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#3B82F6]/20 uppercase tracking-widest">
              🔄 Simple Process
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-4 mb-4 tracking-tight">
              Live in under 30 minutes
            </h2>
            <p className="text-[#94A3B8] text-xs md:text-sm">
              Absolutely no engineering background required. If you can copy and paste, you have all the skills needed to deploy this.
            </p>
          </div>

          {/* Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Visual connecting line for desktop */}
            <div className="hidden md:block absolute top-[28%] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent z-0"></div>

            {[
              { step: "01", category: "Business", title: "Set Up Your Profile", desc: "List your services, standard prices, business hours, and FAQs. Takes under 10 minutes." },
              { step: "02", category: "Config", title: "Personalize the AI", desc: "Select a custom voice, friendly tone, and unique greeting. The AI immediately compiles your files." },
              { step: "03", category: "Live", title: "Embed on Website", desc: "Paste a single lightweight script tag on your portal. Your AI receptionist begins answering live." },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-[#1F2937] flex items-center justify-center text-white mb-6 font-display font-extrabold text-2xl relative shadow-2xl shadow-black/40 group-hover:border-[#3B82F6]/30 transition-colors">
                  <span className="text-[#3B82F6]">{step.step}</span>
                  <span className="absolute -bottom-2 bg-emerald-500 text-black text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide shadow-md">{step.category}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* REVIEWS TESTIMONIALS */}
      <section id="reviews" className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl">
            <span className="bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#8B5CF6]/20 uppercase tracking-widest">
              ⭐ Success Stories
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-4 mb-2 tracking-tight">
              Shops that never look back
            </h2>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0 bg-[#111827] border border-[#1F2937] px-4 py-2.5 rounded-xl">
            <span className="text-2xl font-black text-white">4.9/5</span>
            <div className="flex gap-0.5 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current animate-pulse" />
              ))}
            </div>
            <span className="text-xs text-[#94A3B8] font-semibold ml-1">200+ verified ratings</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LANDING_REVIEWS.map((rev, idx) => (
            <motion.div 
              key={rev.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4, borderColor: "#3B82F6" }}
              className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-0.5 text-yellow-500">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                    {rev.badge}
                  </span>
                </div>
                <p className="text-[#94A3B8] text-xs italic leading-relaxed mb-6 font-medium">
                  "{rev.text}"
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-[#1F2937] pt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 text-[#3B82F6] flex items-center justify-center font-display font-extrabold text-xs border border-[#3B82F6]/20">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs">{rev.author}</h4>
                  <p className="text-[10px] text-[#94A3B8] font-medium">{rev.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SCRIPT EMBED INTEGRATION SECTION */}
      <section id="integration" className="py-24 bg-[#111827]/80 backdrop-blur-md border-t border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left instructions */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <span className="bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#3B82F6]/20 uppercase tracking-widest">
              ⚡ Integration
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-4 mb-4 tracking-tight">
              Add it to your site <br />
              in <span className="text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 rounded-md">30 seconds</span>
            </h2>
            <p className="text-[#94A3B8] text-xs md:text-sm leading-relaxed mb-6">
              Copy two lines. Paste before the closing body tag. Works on WordPress, Squarespace, Wix, Webflow, custom HTML — everything.
            </p>

            <ul className="space-y-3.5 mb-8">
              {[
                "Works on any website platform",
                "No server setup or configuration needed",
                "Business ID is public-safe — no keys exposed",
                "Fully customizable widget appearance"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
                  <CheckCircle className="w-4.5 h-4.5 text-[#3B82F6] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigator.clipboard.writeText(`<!-- MediCall Clinical AI Receptionist -->\n<script src="https://medicall.ai/api/widget-script" />\n<script>\n  MediCall.init({\n    clinicId: "demo-clinic-id",\n    position: "bottom-right"\n  });\n</script>`);
                alert("Integration code copied to clipboard!");
              }}
              className="bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#3B82F6] text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#7c3aed]/20 uppercase tracking-wider"
            >
              <Code className="w-4 h-4" /> Copy Embed Code
            </motion.button>
          </div>

          {/* Right HTML mockup panel */}
          <div className="lg:col-span-7">
            <div className="bg-[#111827] rounded-2xl border border-[#1F2937] shadow-2xl overflow-hidden">
              <div className="bg-[#020617] px-4 py-3 border-b border-[#1F2937] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-[10px] font-mono text-[#94A3B8]">index.html</div>
                <div className="w-6"></div>
              </div>
              <div className="p-5 font-mono text-[11px] leading-relaxed overflow-x-auto text-[#94A3B8] bg-[#020617]">
                <p className="text-gray-600">&lt;!-- Paste before &lt;/body&gt; --&gt;</p>
                <p>&nbsp;</p>
                <p>
                  <span className="text-red-400">&lt;script</span> <span className="text-orange-400">src</span>=<span className="text-emerald-400">"https://medicall.ai/api/widget-script"</span> <span className="text-red-400">/&gt;</span>
                </p>
                <p>
                  <span className="text-red-400">&lt;script&gt;</span>
                </p>
                <p className="pl-4">
                  <span className="text-blue-400">MediCall</span>.<span className="text-yellow-400">init</span>({'{'}
                </p>
                <p className="pl-8">
                  <span className="text-orange-400">clinicId</span>: <span className="text-emerald-400">"your-clinic-id"</span>,
                </p>
                <p className="pl-8">
                  <span className="text-orange-400">position</span>: <span className="text-emerald-400">"bottom-right"</span>,
                </p>
                <p className="pl-4">
                  {'})'}
                </p>
                <p>
                  <span className="text-red-400">&lt;/script&gt;</span>
                </p>
                <p className="mt-8 pt-4 border-t border-[#1F2937] text-[#94A3B8] flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping"></span>
                  Widget active — listening for calls
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* LIVE DEMO SECTION */}
      <section id="live-demo" className="py-24 bg-gradient-to-b from-gray-950/10 to-[#0B1120] relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left info column */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#3B82F6]/20 uppercase tracking-widest">
              🟢 Live Demo — No Login Required
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-4 mb-4 leading-tight tracking-tight">
              Talk to our AI <br />
              receptionist now
            </h2>
            <p className="text-[#94A3B8] text-xs md:text-sm leading-relaxed mb-8 max-w-lg">
              Click the green phone button on the right to start a simulated call immediately. Ask it about services, pricing, business hours, or try to book an appointment. See exactly what your customers will experience.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {[
                { icon: PhoneCall, title: "Natural voice conversation", desc: "Speaks and listens like a human receptionist." },
                { icon: Zap, title: "Sub-second response time", desc: "No awkward pauses — powered by ultra-fast TTS." },
                { icon: Calendar, title: "Can book appointments", desc: 'Try asking: "I need an oil change tomorrow."' },
                { icon: MessageSquare, title: "Full call transcripts", desc: "Every single word captured and fully logged." },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-3 hover:bg-white/[0.01] p-2 rounded-xl transition-colors duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20 text-[#3B82F6] shrink-0 shadow-md shadow-emerald-500/5">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs mb-1 tracking-wide">{item.title}</h4>
                      <p className="text-[#94A3B8] text-[11px] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right interactive dialer simulator */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-[#3B82F6]/5 rounded-3xl blur-3xl pointer-events-none -m-4"></div>
              <DialerSim 
                agentName="MediCall Support Assistant" 
                agentVoice="Alloy - Friendly & Warm"
                onAppointmentBooked={onAppointmentBooked}
              />
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1F2937] bg-[#020617] py-12 text-center text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2563eb]/10 flex items-center justify-center border border-[#2563eb]/20">
              <PhoneCall className="w-4 h-4 text-[#2563eb]" />
            </div>
            <span className="font-display font-extrabold text-white text-sm">Medi<span className="text-[#7c3aed]">Call</span></span>
          </div>
          <p className="text-[11px]">© 2026 MediCall AI. Fully interactive simulation with high-end premium clinical animations.</p>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors text-[#2563eb]">Support Desk</a>
          </div>
        </div>
      </footer>

      {/* Floating Receptionist Widget */}
      <FloatingChatWidget agents={agents} />

    </div>
  );
}
