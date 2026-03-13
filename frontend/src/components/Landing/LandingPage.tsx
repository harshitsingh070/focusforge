import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const currentYear = new Date().getFullYear();

const features = [
  {
    icon: '🎯',
    label: 'Daily Dashboard',
    title: 'Track every active goal from one screen',
    desc: 'Monitor streak safety, completion pace, and effort logs without switching views or losing context.',
  },
  {
    icon: '📊',
    label: 'Activity Intelligence',
    title: 'Catch streak risk before momentum drops',
    desc: 'Understand weekly rhythm, low-output windows, and completion trends so adjustments happen early.',
  },
  {
    icon: '🏆',
    label: 'Fair Leaderboards',
    title: 'Compete on consistency, not noisy activity',
    desc: 'Rankings reward meaningful progress and protect high-quality effort across goal categories.',
  },
  {
    icon: '🔥',
    label: 'Streak Protection',
    title: 'Never lose momentum unintentionally',
    desc: 'Smart alerts and daily check-ins protect the streaks that matter most to your progress.',
  },
  {
    icon: '🏅',
    label: 'Milestone Badges',
    title: 'Unlock recognition as you level up',
    desc: 'Visual badges and milestone scoring keep motivation high across weeks and months.',
  },
  {
    icon: '⚡',
    label: 'Instant Visibility',
    title: 'Know exactly where you stand daily',
    desc: 'One unified view for goals, rankings, and streaks — stop switching between tools.',
  },
];

const steps = [
  { step: '01', title: 'Set your goals', desc: 'Define targets, effort windows, and difficulty for any routine you want to build.' },
  { step: '02', title: 'Log daily effort', desc: 'Record real work every day to keep your dashboard accurate and streaks protected.' },
  { step: '03', title: 'Review & improve', desc: 'Use progress signals, badges, and leaderboard movement to refine your execution.' },
];

const stats = [
  { value: '3x', label: 'Faster clarity on priorities', sub: 'Remove uncertainty from each day', color: 'from-violet-500 to-purple-600' },
  { value: '24/7', label: 'Progress visibility', sub: 'Across all your goals at once', color: 'from-blue-500 to-indigo-600' },
  { value: '100%', label: 'Transparent rankings', sub: 'Compete on real consistency', color: 'from-emerald-500 to-teal-600' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white [font-family:'Inter',sans-serif] overflow-x-hidden">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <span className="text-xs font-bold text-white">FF</span>
            </div>
            <span className="text-base font-bold text-white">FocusForge</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-500 transition-all duration-200">
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
            <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          </div>

          <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400 mb-8">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              Goal tracking, reimagined
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              Build habits that{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  actually stick
                </span>
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-slate-400 leading-relaxed mb-10">
              Track daily effort, protect your streaks, and compete on transparent leaderboards.
              FocusForge is the productivity platform built for people who execute every day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200"
              >
                Start for free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-2xl border border-white/10 px-8 py-4 text-base font-semibold text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-200"
              >
                Sign in
              </Link>
            </div>

            {/* Hero stats cards */}
            <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left">
                  <p className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                  <p className="text-sm font-semibold text-white mt-2">{s.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="relative py-24 border-t border-white/5">
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-[80%] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-3">Features</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Everything you need to execute</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">One platform for goals, streaks, analytics, and leaderboards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/5 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="relative z-10">
                    <div className="text-2xl mb-4">{f.icon}</div>
                    <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">{f.label}</p>
                    <h3 className="text-lg font-bold text-white mb-3 leading-snug">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="relative py-24 border-t border-white/5">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-3">How it works</p>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                  Three steps to<br />daily momentum
                </h2>
                <p className="text-slate-400 text-lg mb-10">A simple, repeatable system that builds compound progress over time.</p>

                <div className="space-y-6">
                  {steps.map((s, i) => (
                    <div key={s.step} className="flex gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-violet-500/25">
                        {s.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/10 blur-3xl" />
                <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-white">Today's Progress</h4>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">On track</span>
                  </div>
                  {[
                    { label: 'Coding Goal', pct: 82, color: 'bg-violet-500' },
                    { label: 'Fitness Goal', pct: 61, color: 'bg-blue-500' },
                    { label: 'Study Goal', pct: 74, color: 'bg-emerald-500' },
                  ].map((g) => (
                    <div key={g.label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-300">{g.label}</span>
                        <span className="font-bold text-white">{g.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className={`h-2 rounded-full ${g.color} transition-all duration-1000`} style={{ width: `${g.pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                    <div className="text-orange-400 text-2xl">🔥</div>
                    <div>
                      <p className="text-sm font-bold text-white">21-day streak</p>
                      <p className="text-xs text-slate-400">Keep it going!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative py-24 border-t border-white/5">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-violet-600/15 blur-[100px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-8 text-center">
            <p className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-4">Ready?</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Start building momentum today</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Join thousands who track daily effort and compete on transparent leaderboards.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500 hover:scale-[1.02] transition-all duration-200"
              >
                Create free account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <Link to="/rules" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                View platform rules →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <span className="text-xs font-bold text-white">FF</span>
                </div>
                <span className="text-base font-bold text-white">FocusForge</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Goal tracking and consistency intelligence for people who execute every day.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Product</p>
              <div className="space-y-3">
                <Link to="/register" className="block text-sm text-slate-500 hover:text-white transition-colors">Create Account</Link>
                <Link to="/login" className="block text-sm text-slate-500 hover:text-white transition-colors">Sign In</Link>
                <Link to="/rules" className="block text-sm text-slate-500 hover:text-white transition-colors">Platform Rules</Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Explore</p>
              <div className="space-y-3">
                <a href="#features" className="block text-sm text-slate-500 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="block text-sm text-slate-500 hover:text-white transition-colors">How It Works</a>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-xs text-slate-600">© {currentYear} FocusForge. Build habits one day at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
