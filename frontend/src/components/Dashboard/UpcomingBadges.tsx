import React from 'react';
import { Badge } from '../../types';
import styles from './Dashboard.module.css';

interface UpcomingBadgesProps {
  badges: Badge[];
}

const UpcomingBadges: React.FC<UpcomingBadgesProps> = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return (
      <div className={styles.sidebarCard}>
        <h3 className={styles.sidebarCardTitle}>Upcoming Badges</h3>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' }}>
          No badges available.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.sidebarCard}>
      <h3 className={styles.sidebarCardTitle}>Upcoming Badges</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {badges.slice(0, 3).map((badge) => (
          <div
            key={badge.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>{badge.iconUrl || '🏆'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                {badge.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.125rem 0 0 0' }}>
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingBadges;
