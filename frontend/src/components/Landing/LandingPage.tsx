import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

interface FeatureHighlight {
  label: string;
  title: string;
  description: string;
}

interface WorkflowStep {
  title: string;
  description: string;
  detail: string;
}

interface PlatformStat {
  value: string;
  label: string;
}

const featureHighlights: FeatureHighlight[] = [
  {
    label: 'Daily Focus',
    title: 'Build momentum with structured goals',
    description:
      'Break big ambitions into daily commitments, monitor completion, and keep your next action visible.',
  },
  {
    label: 'Fair Leaderboards',
    title: 'Compete with quality, not noise',
    description:
      'Rankings favor consistency, streak health, and meaningful progress so the scoreboard stays trustworthy.',
  },
  {
    label: 'Progress Intelligence',
    title: 'See what is improving and what is slipping',
    description:
      'Use analytics, activity logs, and milestone trends to quickly adjust your effort before momentum drops.',
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    title: 'Create your goal system',
    description: 'Set targets, effort windows, and difficulty for each goal.',
    detail: 'Designed for coding, fitness, study, and multi-category habits.',
  },
  {
    title: 'Track work every day',
    description: 'Log focused minutes and protect your streaks with clear proof of effort.',
    detail: 'Your dashboard keeps all active goals and daily progress in one place.',
  },
  {
    title: 'Climb with consistency',
    description: 'Turn daily execution into badges, improved ranks, and measurable growth.',
    detail: 'Compete fairly while staying accountable to your own targets.',
  },
];

const platformStats: PlatformStat[] = [
  { value: '3x', label: 'Faster clarity on daily priorities' },
  { value: '24/7', label: 'Progress visibility across all goals' },
  { value: '1', label: 'Unified place for goals, rankings, and streaks' },
];

const LandingPage: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="landing-page page-shell">
      <div className="landing-glow landing-glow-one" aria-hidden="true" />
      <div className="landing-glow landing-glow-two" aria-hidden="true" />

      <header className="landing-nav-wrap">
        <div className="landing-nav">
          <Link to="/" className="landing-brand">
            <span className="landing-brand-mark" aria-hidden="true">
              FF
            </span>
            <span className="landing-brand-name">FocusForge</span>
          </Link>

          <nav className="landing-nav-links" aria-label="Landing sections">
            <a href="#features" className="landing-nav-link">
              Features
            </a>
            <a href="#how-it-works" className="landing-nav-link">
              How It Works
            </a>
            <a href="#community" className="landing-nav-link">
              Results
            </a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="btn-secondary landing-nav-btn">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary landing-nav-btn">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-kicker reveal">Goal tracking for disciplined growth</p>
            <h1 className="landing-title reveal reveal-delay-1">Forge consistency with purpose-driven goals.</h1>
            <p className="landing-subtitle reveal reveal-delay-2">
              FocusForge helps you plan daily effort, protect streaks, and compete on transparent leaderboards so you
              can convert intention into measurable execution.
            </p>

            <div className="landing-hero-actions reveal reveal-delay-3">
              <Link to="/register" className="btn-primary landing-cta-primary">
                Create Free Account
              </Link>
              <Link to="/login" className="btn-secondary landing-cta-secondary">
                Sign In
              </Link>
            </div>

            <p className="landing-footnote reveal reveal-delay-4">
              New to the platform? Review{' '}
              <Link to="/rules" className="landing-footnote-link">
                platform rules
              </Link>{' '}
              before you join public rankings.
            </p>
          </div>

          <aside className="landing-hero-panel reveal reveal-delay-2" aria-label="Platform snapshot">
            <div className="landing-status-row">
              <span className="landing-status-dot" aria-hidden="true" />
              <span>Live Consistency Snapshot</span>
            </div>

            <ul className="landing-panel-list">
              <li>
                <strong>Daily dashboard:</strong> Track active goals without tab-hopping.
              </li>
              <li>
                <strong>Activity intelligence:</strong> Detect streak risks before they break.
              </li>
              <li>
                <strong>Leaderboard context:</strong> Understand rank changes over time.
              </li>
            </ul>

            <div className="landing-progress-grid">
              <div className="landing-progress-card">
                <p className="landing-progress-label">Coding Goal</p>
                <div className="landing-progress-track">
                  <span className="landing-progress-fill progress-coding" />
                </div>
              </div>

              <div className="landing-progress-card">
                <p className="landing-progress-label">Fitness Goal</p>
                <div className="landing-progress-track">
                  <span className="landing-progress-fill progress-fitness" />
                </div>
              </div>
            </div>

            <div className="landing-badge-row">
              <span className="landing-mini-chip">Streak Safe</span>
              <span className="landing-mini-chip">Fair Play</span>
              <span className="landing-mini-chip">Weekly Wins</span>
            </div>
          </aside>
        </section>

        <section id="features" className="landing-section">
          <header className="landing-section-header">
            <p className="landing-section-kicker">Why FocusForge</p>
            <h2 className="landing-section-title">Everything you need to stay accountable</h2>
            <p className="landing-section-subtitle">
              Built for people who want clean execution systems, transparent scoring, and long-term habit growth.
            </p>
          </header>

          <div className="landing-feature-grid">
            {featureHighlights.map((feature, index) => (
              <article
                key={feature.title}
                className="landing-feature-card reveal"
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                <p className="landing-feature-label">{feature.label}</p>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-text">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="landing-section">
          <header className="landing-section-header">
            <p className="landing-section-kicker">How It Works</p>
            <h2 className="landing-section-title">From setup to measurable progress in three steps</h2>
          </header>

          <div className="landing-steps">
            {workflowSteps.map((step, index) => (
              <article key={step.title} className="landing-step-card reveal" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <span className="landing-step-index">{index + 1}</span>
                <h3 className="landing-step-title">{step.title}</h3>
                <p className="landing-step-description">{step.description}</p>
                <p className="landing-step-detail">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="community" className="landing-section landing-community">
          <div className="landing-community-grid">
            <div className="landing-stats">
              {platformStats.map((stat) => (
                <article key={stat.label} className="landing-stat-card reveal">
                  <p className="landing-stat-value">{stat.value}</p>
                  <p className="landing-stat-label">{stat.label}</p>
                </article>
              ))}
            </div>

            <div className="landing-quote-grid">
              <article className="landing-quote-card reveal reveal-delay-2">
                <p className="landing-quote-text">
                  "I finally have one clean system for habits, progress, and leaderboard motivation."
                </p>
                <p className="landing-quote-author">Product Builder</p>
              </article>
              <article className="landing-quote-card reveal reveal-delay-3">
                <p className="landing-quote-text">
                  "The daily tracking view made it obvious where my routine was failing."
                </p>
                <p className="landing-quote-author">Engineering Student</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-cta-band reveal">
          <h2 className="landing-cta-title">Ready to turn plans into consistent output?</h2>
          <p className="landing-cta-copy">
            Create your account to start tracking goals, earning badges, and climbing fair leaderboards.
          </p>
          <div className="landing-cta-actions">
            <Link to="/register" className="btn-primary landing-cta-primary">
              Start with Sign Up
            </Link>
            <Link to="/login" className="btn-secondary landing-cta-secondary">
              I already have an account
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <p className="landing-footer-logo">FocusForge</p>
            <p className="landing-footer-copy">
              Goal tracking and consistency intelligence for people who execute daily.
            </p>
          </div>

          <div className="landing-footer-links">
            <p className="landing-footer-heading">Product</p>
            <Link to="/register">Create Account</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/rules">Platform Rules</Link>
          </div>

          <div className="landing-footer-links">
            <p className="landing-footer-heading">Explore</p>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#community">Results</a>
          </div>
        </div>

        <p className="landing-footer-legal">(c) {currentYear} FocusForge. Build habits one day at a time.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
