import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

interface FeatureHighlight {
  label: string;
  title: string;
  description: string;
}

interface WorkflowStep {
  id: 'setup' | 'track' | 'climb';
  title: string;
  description: string;
}

interface PlatformStat {
  value: string;
  label: string;
  detail: string;
  tone: 'mint' | 'sky' | 'violet';
}

interface SnapshotProgress {
  label: string;
  value: string;
  tone: 'mint' | 'orange' | 'blue';
}

const featureHighlights: FeatureHighlight[] = [
  {
    label: 'Daily Dashboard',
    title: 'Track every active goal from one clean screen',
    description:
      'Monitor streak safety, completion pace, and effort logs without switching views or losing context.',
  },
  {
    label: 'Activity Intelligence',
    title: 'Catch streak risk before momentum drops',
    description:
      'Understand weekly rhythm, low-output windows, and completion trends so adjustments happen early.',
  },
  {
    label: 'Fair Leaderboards',
    title: 'Compete on consistency, not noisy activity',
    description:
      'Rankings reward meaningful progress and protect high-quality effort across different goal categories.',
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    id: 'setup',
    title: 'Set your goal system',
    description: 'Define targets, effort windows, and difficulty for coding, fitness, study, or mixed routines.',
  },
  {
    id: 'track',
    title: 'Log focused work daily',
    description: 'Record real effort, keep your dashboard current, and maintain streak reliability over time.',
  },
  {
    id: 'climb',
    title: 'Review and improve weekly',
    description: 'Use progress signals, badges, and leaderboard movement to refine your execution system.',
  },
];

const platformStats: PlatformStat[] = [
  {
    value: '3x',
    label: 'Faster clarity on daily priorities',
    detail: 'Set targets and effort windows to remove uncertainty from each day.',
    tone: 'mint',
  },
  {
    value: '24/7',
    label: 'Progress visibility across all goals',
    detail: 'View coding, fitness, and study progress in one reliable dashboard.',
    tone: 'sky',
  },
  {
    value: '1',
    label: 'Unified place for goals, rankings, and streaks',
    detail: 'Stop switching tools and keep accountability inside one workflow.',
    tone: 'violet',
  },
];

const snapshotProgress: SnapshotProgress[] = [
  { label: 'Coding Goal', value: '82%', tone: 'mint' },
  { label: 'Fitness Goal', value: '61%', tone: 'orange' },
  { label: 'Study Goal', value: '74%', tone: 'blue' },
];

const landingVisuals = {
  hero: '/images/landing/focusforge-hero-timer.png',
  analytics: '/images/landing/focusforge-analytics-laptop.png',
  streak: '/images/landing/focusforge-streak-leaderboard.png',
  firstBlock: '/images/landing/first-block.png',
};

const StepIcon: React.FC<{ id: WorkflowStep['id'] }> = ({ id }) => {
  if (id === 'setup') {
    return (
      <svg viewBox="0 0 24 24" className="landing-step-icon-svg" aria-hidden="true" focusable="false">
        <path
          d="M12 7.2a4.8 4.8 0 1 0 0 9.6a4.8 4.8 0 0 0 0-9.6Zm0-4.2l1 2.2a7.4 7.4 0 0 1 1.8.8L17 4.8l2.2 2.2l-1.2 2.2c.3.6.6 1.2.8 1.8l2.2 1v3l-2.2 1a7.4 7.4 0 0 1-.8 1.8l1.2 2.2L17 22.2l-2.2-1.2c-.6.3-1.2.6-1.8.8l-1 2.2H9l-1-2.2a7.4 7.4 0 0 1-1.8-.8L4 22.2L1.8 20l1.2-2.2a7.4 7.4 0 0 1-.8-1.8L0 15v-3l2.2-1c.2-.6.5-1.2.8-1.8L1.8 7L4 4.8l2.2 1.2c.6-.3 1.2-.6 1.8-.8L9 3h3Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (id === 'track') {
    return (
      <svg viewBox="0 0 24 24" className="landing-step-icon-svg" aria-hidden="true" focusable="false">
        <path
          d="M12 1.5a10.5 10.5 0 1 0 10.5 10.5A10.5 10.5 0 0 0 12 1.5Zm0 3a1.2 1.2 0 0 1 1.2 1.2v5.3l3.5 2.1a1.2 1.2 0 1 1-1.2 2.1L11 12.5a1.2 1.2 0 0 1-.6-1V5.7A1.2 1.2 0 0 1 12 4.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="landing-step-icon-svg" aria-hidden="true" focusable="false">
      <path
        d="M3 18.2V15l8.2-8.2l3.2 3.2L6.2 18.2H3Zm12.7-9.8l1.8-1.8l2.5 2.5l-1.8 1.8l-2.5-2.5ZM7 20h14v2H7z"
        fill="currentColor"
      />
    </svg>
  );
};

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
            <a href="#results" className="landing-nav-link">
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
            <p className="landing-kicker reveal">How It Works</p>
            <h1 className="landing-title reveal reveal-delay-1">From setup to measurable progress in three steps</h1>
            <p className="landing-subtitle reveal reveal-delay-2">
              FocusForge helps you plan daily effort, protect streaks, and compete on transparent leaderboards so you
              can convert intention into measurable execution.
            </p>

            <div className="landing-hero-actions reveal reveal-delay-3">
              <Link to="/register" className="btn-primary landing-cta-primary">
                Create Free Account
              </Link>
              <Link to="/login" className="landing-cta-tertiary">
                Sign In
              </Link>
            </div>

            <p className="landing-footnote reveal reveal-delay-4">
              New to the platform? Review{' '}
              <Link to="/rules" className="landing-footnote-link">
                platform rules
              </Link>{' '}
              before joining public rankings.
            </p>

            <figure className="landing-first-block-media reveal reveal-delay-4">
              <img
                src={landingVisuals.firstBlock}
                alt="FocusForge setup to progress illustration"
                className="landing-first-block-image"
                loading="eager"
              />
            </figure>
          </div>

          <aside className="landing-hero-panel reveal reveal-delay-2" aria-label="Platform snapshot">
            <div className="landing-status-row">
              <span className="landing-status-dot" aria-hidden="true" />
              <span>Live Consistency Snapshot</span>
            </div>

            <div className="landing-panel-copy">
              <p className="landing-panel-line">
                <strong>Daily dashboard:</strong> Track active goals in one view.
              </p>
              <p className="landing-panel-line">
                <strong>Activity intelligence:</strong> Catch streak risk early.
              </p>
              <p className="landing-panel-line">
                <strong>Leaderboard context:</strong> See ranking changes quickly.
              </p>
            </div>

            <div className="landing-progress-grid">
              {snapshotProgress.map((item) => (
                <div
                  key={item.label}
                  className={`landing-progress-card${item.label === 'Coding Goal' ? ' landing-progress-card-highlight' : ''}`}
                >
                  <div className="landing-progress-head">
                    <p className="landing-progress-label">{item.label}</p>
                    <span className="landing-progress-value">{item.value}</span>
                  </div>
                  <div className="landing-progress-track">
                    <span className={`landing-progress-fill progress-${item.tone}`} style={{ width: item.value }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="landing-badge-row">
              <span className="landing-mini-chip landing-mini-chip-highlight">Streak Safe</span>
              <span className="landing-mini-chip">Fair Play</span>
              <span className="landing-mini-chip">Weekly Wins</span>
            </div>

            <figure className="landing-hero-media">
              <img
                src={landingVisuals.hero}
                alt="FocusForge timer on mobile with productivity dashboard on laptop"
                className="landing-hero-media-image"
                loading="eager"
              />
              <div className="landing-hero-media-focus">
                <div className="landing-hero-focus-chip">Streak Safe</div>
                <div className="landing-hero-focus-progress">
                  <span className="landing-hero-focus-progress-label">Coding Progress</span>
                  <span className="landing-hero-focus-progress-track" aria-hidden="true">
                    <span className="landing-hero-focus-progress-fill" />
                  </span>
                </div>
              </div>
            </figure>
          </aside>
        </section>

        <section id="features" className="landing-section">
          <header className="landing-section-header">
            <p className="landing-section-kicker">Why FocusForge</p>
            <h2 className="landing-section-title">Purpose-built for consistency-driven execution</h2>
            <p className="landing-section-subtitle">
              The app theme, components, and interactions stay aligned so the public landing experience matches the
              product feel users see after sign-in.
            </p>
          </header>

          <div className="landing-feature-grid">
            {featureHighlights.map((feature, index) => (
              <article
                key={feature.title}
                className="landing-feature-card reveal"
                style={{ animationDelay: `${0.12 + index * 0.08}s` }}
              >
                <p className="landing-feature-label">{feature.label}</p>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-text">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="landing-section landing-steps-section">
          <header className="landing-section-header">
            <p className="landing-section-kicker">How It Works</p>
            <h2 className="landing-section-title">Simple loop: setup, track, and climb</h2>
            <p className="landing-section-subtitle">
              Focus on execution while FocusForge keeps progress, streak status, and momentum signals visible.
            </p>
          </header>
          <div className="landing-steps">
            {workflowSteps.map((step, index) => (
              <article
                key={step.title}
                className="landing-step-card reveal"
                style={{ animationDelay: `${0.2 + index * 0.08}s` }}
              >
                <span className={`landing-step-icon-wrap landing-step-icon-${step.id}`}>
                  <StepIcon id={step.id} />
                </span>
                <span className="landing-step-index">{index + 1}</span>
                <h3 className="landing-step-title">{step.title}</h3>
                <p className="landing-step-description">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="results" className="landing-section landing-results">
          <header className="landing-section-header">
            <p className="landing-section-kicker">Results</p>
            <h2 className="landing-section-title">Consistent visuals with measurable value</h2>
            <p className="landing-section-subtitle">
              The layout below mirrors your reference image style while staying inside FocusForge colors and component
              language.
            </p>
          </header>

          <div className="landing-stats-grid">
            {platformStats.map((stat, index) => (
              <article key={stat.label} className="landing-stat-card reveal" style={{ animationDelay: `${0.15 + index * 0.1}s` }}>
                <span className={`landing-stat-icon stat-icon-${stat.tone}`} aria-hidden="true" />
                <p className="landing-stat-value">{stat.value}</p>
                <p className="landing-stat-label">{stat.label}</p>
                <p className="landing-stat-detail">{stat.detail}</p>
              </article>
            ))}
          </div>

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

          <div className="landing-preview-grid">
            <figure className="landing-preview-image-card reveal">
              <img
                src={landingVisuals.analytics}
                alt="FocusForge analytics dashboard with goal trends and weak area insights"
                className="landing-preview-image"
                loading="lazy"
              />
              <figcaption className="landing-preview-caption">
                Analytics view: detect momentum shifts and weak areas before streaks break.
              </figcaption>
            </figure>

            <figure className="landing-preview-image-card reveal reveal-delay-1">
              <img
                src={landingVisuals.streak}
                alt="FocusForge streak rewards and leaderboard progress on mobile and desktop"
                className="landing-preview-image"
                loading="lazy"
              />
              <figcaption className="landing-preview-caption">
                Streak view: celebrate daily wins and climb the leaderboard with consistent effort.
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <p className="landing-footer-logo">FocusForge</p>
            <p className="landing-footer-copy">
              Goal tracking and consistency intelligence for people who execute every day.
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
            <a href="#results">Results</a>
          </div>
        </div>

        <p className="landing-footer-legal">(c) {currentYear} FocusForge. Build habits one day at a time.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
