import React from 'react';
import { RecentActivity } from '../../types';
import styles from './Dashboard.module.css';

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className={styles.sidebarCard}>
        <h3 className={styles.sidebarCardTitle}>Recent Activity</h3>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' }}>
          No activity yet.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.sidebarCard}>
      <h3 className={styles.sidebarCardTitle}>Recent Activity</h3>

      <div className={styles.activityList}>
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>📝</div>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>{activity.goalTitle}</p>
              <p className={styles.activityTime}>{activity.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
