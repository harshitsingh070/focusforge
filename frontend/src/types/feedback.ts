export type FeedbackTone = 'violet' | 'amber' | 'emerald' | 'slate';

export interface FeedbackToastInput {
  title: string;
  message?: string;
  icon?: string;
  tone?: FeedbackTone;
  durationMs?: number;
}

export interface FeedbackRewardInput {
  eyebrow?: string;
  title: string;
  message: string;
  icon?: string;
  tone?: FeedbackTone;
  durationMs?: number;
  statLabel?: string;
  statValue?: string;
}
