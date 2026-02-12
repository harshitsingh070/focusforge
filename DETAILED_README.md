# FocusForge - Gamified Learning & Productivity Platform

## 📋 Project Overview

**FocusForge** is a comprehensive, full-stack web application designed to gamify learning and productivity through an interactive point system, goal tracking, leaderboards, challenges, and badge achievements. It combines modern web technologies with sophisticated backend services to create an engaging platform that motivates users to achieve their goals through gamification mechanics.

The platform transforms mundane tasks into exciting challenges by rewarding users with points, badges, streaks, and rankings on competitive leaderboards. Whether for personal development, team building, or educational purposes, FocusForge provides a structured environment to track progress and compete in a healthy, supportive community.

---

## 🎯 Core Features

### 1. **User Authentication & Management**
- **Secure Registration & Login**: JWT-based authentication with bcrypt password hashing
- **Profile Customization**: Users can manage their profiles with privacy settings
- **Privacy Controls**: Users control their profile visibility and data sharing preferences
- **Account Management**: Users can modify settings, change passwords, and manage account security

### 2. **Goal Management**
- **Create Goals**: Users set personal goals with titles, descriptions, and difficulty levels
- **Category-Based Organization**: Goals are organized by learning/activity categories (e.g., Programming, Fitness, Language Learning)
- **Flexible Goal Settings**:
  - Set daily minimum minutes required
  - Define start and end dates
  - Mark goals as public or private
  - Pause or activate goals as needed
- **Goal Progress Tracking**: Real-time tracking of activity against daily minimums

### 3. **Gamification & Points System**
- **Point Earning Mechanism**: Users earn points by completing activities
- **Dynamic Point Calculation**:
  - Base points for difficulty level (Easy: 10pts, Medium: 15pts, Hard: 20pts)
  - Time-based bonus points (extra 2 points per 10 minutes beyond threshold)
  - Streak multipliers (consecutive days increase points by up to 2x)
  - Diminishing returns to prevent exploitation
- **Daily Point Caps**: Maximum 100 points per day per user to maintain fairness
- **Point Ledger**: Complete transaction history of all points gained/lost
- **Bonus Rewards**: Weekly consistency bonuses for maintaining activity 5+ days per week

### 4. **Activity Logging**
- **Daily Activity Tracking**: Users log minutes spent on each goal daily
- **Activity Notes**: Add details and context to activities
- **Unique Constraint**: One entry per user-goal-date combination to prevent duplicates
- **Activity History**: Complete audit trail of all user activities with timestamps

### 5. **Streak System**
- **Consecutive Day Tracking**: Tracks consecutive active days for each user
- **Streak Bonuses**: Higher streaks provide increased point multipliers
- **Streak Loss**: Missing a day breaks the streak (reset to 0)
- **Visual Motivation**: Display streak counters prominently in the UI
- **Maximum Multiplier**: Capped at 21 days (2x points) to maintain balance

### 6. **Badge & Achievement System**
- **Multiple Badge Types**:
  - **Streak Badges**: Earned for maintaining consistent activity (e.g., "7-Day Warrior")
  - **Points Badges**: Earned when reaching point milestones (e.g., "500-Point Master")
  - **Consistency Badges**: Earned for activity frequency (e.g., "Week Warrior - 5 days")
  - **Category-Specific Badges**: Earned for achievements in specific learning domains
- **Badge Criteria Types**:
  - `STREAK`: Consecutive days active
  - `POINTS`: Total points accumulated
  - `CONSISTENCY`: Number of active days
  - `DAYS_ACTIVE`: Cumulative active days
- **Evaluation Scopes**:
  - **GLOBAL**: Badge earned across entire platform
  - **PER_GOAL**: Badge earned per individual goal
  - **PER_CATEGORY**: Badge earned within specific categories
- **Point Bonuses**: Some badges grant bonus points when earned
- **Visual Representation**: Each badge has an icon and description

### 7. **Leaderboard System**
- **Multiple Leaderboard Views**:
  - **Global Leaderboard**: Rankings across all users
  - **Category-Based Leaderboards**: Rankings within specific categories
  - **Weekly Snapshots**: Historical leaderboard data captured periodically
- **Ranking Metrics**:
  - Total points accumulated
  - Active streak count
  - Days active in current period
  - Achievement level (badges earned)
- **Intelligent Aggregation**: Automatic background job runs every 15 minutes
- **Leaderboard Snapshots**: Historical snapshots stored for trend analysis
- **Privacy Aware**: Respects user privacy settings when displaying rankings

### 8. **Anti-Cheat & Fraud Detection**
- **Suspicious Activity Detection**:
  - Detects abnormal activity patterns
  - Flags extreme point gains in short timeframes
  - Identifies pattern irregularities
- **Trust Score System**: Each user gets a trust score based on activity patterns
- **Automatic Flagging**: High-risk activities flagged for manual review
- **Validation**: Input validation for all activity submissions
- **Rate Limiting**: Prevents rapid successive submissions

### 9. **Notifications System**
- **Real-Time Alerts**: Notify users of:
  - Badge achievements
  - Leaderboard ranking changes
  - Goal completions
  - Streak milestones
  - Weekly summaries
- **Notification Types**: System-generated and customizable
- **Persistence**: Notifications stored for historical reference
- **User Preferences**: Users can enable/disable notification types

### 10. **Analytics & Dashboard**
- **Personal Dashboard**: Overview of key metrics:
  - Current streak count
  - Total points this week/month
  - Active goals count
  - Recent achievements
  - Next badge milestones
- **Detailed Analytics**:
  - Activity trends over time
  - Points distribution by category
  - Daily/weekly/monthly statistics
  - Goal progress visualization
  - Performance comparisons
- **Weekly Summaries**: Automatic generation of weekly performance summaries
- **Category Analysis**: Break down performance by learning category
- **Visual Charts**: Using Recharts for data visualization

### 11. **Settings & Preferences**
- **Privacy Settings**: Control profile visibility and data sharing
- **Notification Preferences**: Customize what notifications to receive
- **Goal-Related Settings**: Default difficulty, category preferences
- **Account Security**: Password management, session control
- **Theme Preferences**: Dark/light mode support

### 12. **Rules & Platform Guidelines**
- **Public Rules Page**: Display platform rules and gamification mechanics
- **Fair Play Guidelines**: Explains how the point system works
- **Anti-Cheat Policies**: Details on fraud detection and penalties
- **Community Standards**: Code of conduct for users
- **Scoring Transparency**: Complete breakdown of how points are calculated

---

## 🏗️ Architecture Overview

### Frontend Architecture
```
React (v19.2.4) with TypeScript
├── Redux Toolkit for State Management
├── React Router for Navigation
├── Tailwind CSS for Styling
├── Recharts for Data Visualization
└── Axios for API Communication
```

### Backend Architecture
```
Spring Boot 3.2.12 with Java 21
├── Spring Security (JWT Authentication)
├── Spring Data JPA (ORM)
├── Spring Data Redis (Caching)
├── PostgreSQL Database
├── Redis Cache Store
└── Flyway for Migrations
```

### Database Stack
```
PostgreSQL 15
├── Primary: User Data, Goals, Activities, Points
├── Leaderboard Snapshots
├── Badge Definitions & Achievements
└── Notification History
```

### Caching Layer
```
Redis 7
├── Session Management
├── Leaderboard Caching
├── Real-Time User Statistics
└── Leaderboard Aggregation Results
```

---

## 📁 Project File Structure & Detailed Breakdown

### **Root Directory**
```
focusforge/
├── README.md                    # Quick start guide
├── DETAILED_README.md           # This comprehensive documentation
├── focusforge-backend/          # Java/Spring Boot backend
└── frontend/                    # React TypeScript frontend
```

---

## 🔙 Backend Structure (`focusforge-backend/`)

### **Configuration Files**
- **`pom.xml`**: Maven build configuration
  - Spring Boot 3.2.12 parent dependency
  - Java 21 target version
  - Key dependencies: Spring Security, Spring Data JPA, PostgreSQL, JWT (JJWT), Lombok, Redis
  - Build plugins for JAR compilation

- **`docker-compose.yml`**: Docker container orchestration
  - PostgreSQL 15 database container
  - Redis 7 cache container
  - PgAdmin 4 for database administration
  - Volume persistence for data

- **`application.properties` / `application.yml`**: Spring Boot configuration
  - Database connection settings
  - Redis configuration
  - JWT secret keys
  - Gamification parameters (point caps, base points, etc.)
  - Server port configuration

### **Java Source Code Structure** (`src/main/java/com/focusforge/`)

#### **Core Application Entry**
- **`FocusforgeBackendApplication.java`**
  - Main Spring Boot application class
  - Enables scheduling for background jobs
  - Enables async processing for long-running tasks
  - Starts the Spring context on port 8080

#### **Models/Entities** (`model/`)
Core data models representing business entities:

1. **`User.java`** - User account entity
   - Fields: `id`, `email`, `username`, `passwordHash`, `createdAt`, `updatedAt`, `isActive`
   - Privacy settings stored as JSON
   - Relationships: One-to-Many with Goals, Activities, Badges, Points

2. **`Goal.java`** - User learning/productivity goals
   - Fields: `id`, `userId`, `categoryId`, `title`, `description`, `difficulty`, `dailyMinimumMinutes`, `startDate`, `endDate`, `isActive`, `isPrivate`
   - Difficulty levels: 1-5 (affects point calculation)
   - Tracks progress metrics

3. **`Category.java`** - Goal categories for organization
   - Fields: `id`, `name`, `description`
   - Links multiple goals together

4. **`ActivityLog.java`** - Daily activity records
   - Fields: `id`, `userId`, `goalId`, `logDate`, `minutesSpent`, `notes`, `createdAt`
   - Unique constraint per user-goal-date
   - Used for streak calculation and analytics

5. **`PointLedger.java`** - Point transaction history
   - Fields: `id`, `userId`, `goalId`, `points`, `reason`, `referenceDate`, `timestamp`
   - Immutable transaction record for auditing
   - Reasons: ACTIVITY_COMPLETION, STREAK_BONUS, DIFFICULTY_ADJUSTMENT, MANUAL_AWARD, etc.

6. **`Streak.java`** - Streak tracking entity
   - Fields: `id`, `userId`, `currentStreak`, `longestStreak`, `lastActiveDate`
   - Updated automatically when activities logged
   - Resets on missed days

7. **`Badge.java`** - Badge definitions and achievements
   - Fields: `id`, `name`, `description`, `criteriaType`, `threshold`, `evaluationScope`, `pointsBonus`, `iconUrl`
   - Criteria Types: STREAK, POINTS, CONSISTENCY, DAYS_ACTIVE
   - Multiple scopes: GLOBAL, PER_GOAL, PER_CATEGORY

8. **`UserBadge.java`** - Link between users and earned badges
   - Fields: `id`, `userId`, `badgeId`, `awardedDate`, `awardedPoints`
   - Tracks which badges user has earned
   - (1:1 with Badge for each user achievement)

9. **`Notification.java`** - User notifications
   - Fields: `id`, `userId`, `type`, `title`, `message`, `isRead`, `createdAt`
   - Types: BADGE_EARNED, STREAK_MILESTONE, GOAL_COMPLETED, LEADERBOARD_CHANGE, WEEKLY_SUMMARY
   - Persistence for notification history

10. **`LeaderboardSnapshot.java`** - Historical leaderboard data
    - Fields: `id`, `userId`, `rank`, `points`, `category`, `snapshotDate`, `createdAt`
    - Captures leaderboard state at regular intervals
    - Used for trend analysis and historical comparison

11. **`DailyUserSummary.java`** - Daily performance aggregation
    - Fields: `id`, `userId`, `date`, `minutesSpent`, `pointsEarned`, `activitiesCount`, `streakCount`
    - Aggregated view of daily performance
    - Used for analytics and dashboard

12. **`WeeklyCategorySummary.java`** - Weekly category-based summary
    - Fields: `id`, `userId`, `category`, `week`, `minutesSpent`, `pointsEarned`
    - Category-specific weekly aggregation
    - Identifies category strengths/weaknesses

13. **`SuspiciousActivity.java`** - Fraud detection entity
    - Fields: `id`, `userId`, `activityId`, `riskScore`, `reason`, `flaggedDate`
    - Logged for manual review
    - Examples: Extreme point gains, unusual patterns

#### **Controllers** (`controller/`)
HTTP endpoints handling client requests:

1. **`AuthController.java`**
   - `POST /api/auth/register` - User registration with validation
   - `POST /api/auth/login` - JWT token generation
   - `POST /api/auth/refresh` - Token refresh
   - `POST /api/auth/logout` - Session cleanup

2. **`GoalController.java`**
   - `POST /api/goals` - Create new goal
   - `GET /api/goals` - List user's goals
   - `GET /api/goals/{id}` - Goal details
   - `PUT /api/goals/{id}` - Update goal
   - `DELETE /api/goals/{id}` - Delete goal
   - `PUT /api/goals/{id}/activate` - Activate goal
   - `PUT /api/goals/{id}/pause` - Pause goal

3. **`ActivityController.java`**
   - `POST /api/activities` - Log activity/minutes
   - `GET /api/activities` - List activities
   - `GET /api/activities/{goalId}` - Activities for specific goal
   - `GET /api/activities/date-range` - Activities in date range
   - `PUT /api/activities/{id}` - Update activity
   - `DELETE /api/activities/{id}` - Delete activity

4. **`BadgeController.java`**
   - `GET /api/badges` - List all available badges
   - `GET /api/badges/earned` - User's earned badges
   - `GET /api/badges/{id}` - Badge details
   - `POST /api/badges` - Create new badge (admin)
   - `GET /api/badges/progress` - Progress toward next badges

5. **`LeaderboardController.java`**
   - `GET /api/leaderboard` - Global rankings
   - `GET /api/leaderboard/category/{category}` - Category rankings
   - `GET /api/leaderboard/position` - User's current position
   - `GET /api/leaderboard/history` - Historical snapshots
   - `GET /api/leaderboard/nearby` - Users near current position

6. **`EnhancedLeaderboardController.java`**
   - `GET /api/leaderboard/enhanced` - Detailed leaderboard with stats
   - `GET /api/leaderboard/enhanced/friends` - Friends list rankings
   - `GET /api/leaderboard/enhanced/trending` - Trending movers
   - `GET /api/leaderboard/trends` - Leaderboard trends analysis

7. **`DashboardController.java`**
   - `GET /api/dashboard` - User dashboard data
   - `GET /api/dashboard/summary` - Quick stats
   - `GET /api/dashboard/goals-progress` - Goals status
   - `GET /api/dashboard/recent-achievements` - Recent badges

8. **`AnalyticsController.java`**
   - `GET /api/analytics/summary` - Overall stats
   - `GET /api/analytics/daily` - Daily breakdown
   - `GET /api/analytics/weekly` - Weekly aggregation
   - `GET /api/analytics/category` - Category analysis
   - `GET /api/analytics/trends` - Historical trends

9. **`NotificationController.java`**
   - `GET /api/notifications` - List user notifications
   - `GET /api/notifications/unread` - Unread count
   - `PUT /api/notifications/{id}/read` - Mark as read
   - `DELETE /api/notifications/{id}` - Delete notification
   - `PUT /api/notifications/preferences` - Notification settings

10. **`SettingsController.java`**
    - `GET /api/settings/profile` - User profile
    - `PUT /api/settings/profile` - Update profile
    - `GET /api/settings/privacy` - Privacy settings
    - `PUT /api/settings/privacy` - Update privacy
    - `PUT /api/settings/password` - Change password
    - `GET /api/settings/preferences` - User preferences

11. **`LeaderboardAdminController.java`** (Admin endpoints)
    - `POST /api/admin/leaderboard/trigger-aggregation` - Manual aggregation
    - `POST /api/admin/leaderboard/reset` - Reset leaderboard data
    - `GET /api/admin/leaderboard/diagnostics` - Leaderboard health checks

12. **`DiagnosticController.java`** (Debugging)
    - `GET /api/diagnostic/health` - System health
    - `GET /api/diagnostic/cache-stats` - Cache statistics
    - `GET /api/diagnostic/db-stats` - Database statistics

13. **`DebugController.java`** (Development)
    - Various endpoints for testing and debugging

#### **Services** (`service/`)
Business logic and core application functionality:

1. **`AuthService.java`**
   - User registration with email validation
   - Password hashing with bcrypt
   - JWT token generation/validation
   - User session management

2. **`UserService.java`**
   - User profile management
   - Privacy settings handling
   - User lookup and retrieval

3. **`GoalService.java`**
   - Goal CRUD operations
   - Goal validation and business rules
   - Goal activation/deactivation
   - Category management

4. **`ActivityService.java`**
   - Activity logging and validation
   - Activity history retrieval
   - Date range queries
   - Activity updates and deletions

5. **`PointLedgerService.java`**
   - Point transaction recording
   - Point balance calculations
   - Transaction history queries
   - Point-related analytics

6. **`GamificationService.java`** (Complex logic)
   - **Point Calculation Algorithm**:
     ```
     Base Points = 10 × Difficulty Multiplier
     Time Bonus = Extra Minutes / 10 (if > 20 min threshold)
     Streak Bonus = Streak Count × 2 (max 21 days = 42 points)
     Diminishing Factor = 1.0 - (Daily Submissions × 0.05)
     Final Points = (Base + Time + Streak) × Diminishing × Min(Cap)
     ```
   - Weekly consistency bonus awarding
   - Daily point cap enforcement
   - Diminishing returns calculation

7. **`StreakService.java`**
   - Streak tracking and updates
   - Streak reset on missed days
   - Longest streak records
   - Streak milestone notifications

8. **`BadgeEvaluationService.java`**
   - Badge criteria evaluation
   - Automatic badge awarding
   - Achievement checking per submission
   - Event-driven badge updates

9. **`BadgeService.java`**
   - Badge definition management
   - Badge retrieval and listing
   - User badge queries
   - Badge progress calculation

10. **`LeaderboardService.java`**
    - Rank calculations
    - Position queries
    - Nearby user retrieval
    - Leaderboard filtering

11. **`LeaderboardAggregationService.java`**
    - Periodic aggregation (every 15 minutes)
    - Snapshot creation
    - Redis cache updates
    - Rank computations

12. **`EnhancedLeaderboardService.java`**
    - Advanced leaderboard queries
    - Multi-criteria sorting
    - Trend analysis
    - Friend list comparisons

13. **`AnalyticsService.java`**
    - Statistics aggregation
    - Trend analysis
    - Performance metrics
    - Category breakdown analysis

14. **`AnalyticsAggregationService.java`**
    - Daily summary creation
    - Weekly aggregation
    - Category-based summaries
    - Automatic background aggregation

15. **`DashboardService.java`**
    - Dashboard data compilation
    - Quick statistics
    - Recent achievements
    - Goal progress overview

16. **`NotificationService.java`**
    - Notification creation
    - Notification retrieval
    - Read status management
    - User preference enforcement

17. **`AntiCheatService.java`**
    - Suspicious activity detection
    - Pattern analysis
    - Anomaly scoring
    - Fraud flagging

18. **`TrustScoreService.java`**
    - User trust score calculation
    - Activity pattern analysis
    - Risk assessment
    - Score updates

#### **Repositories** (`repository/`)
Spring Data JPA repository interfaces for database queries:

- **`UserRepository.java`** - User queries by email, username, ID
- **`GoalRepository.java`** - Goal queries by user, category, status
- **`ActivityLogRepository.java`** - Activity queries with filters
- **`PointLedgerRepository.java`** - Point history queries, balance calculations
- **`StreakRepository.java`** - Streak queries and updates
- **`BadgeRepository.java`** - Badge lookups and filters
- **`UserBadgeRepository.java`** - User badge queries
- **`NotificationRepository.java`** - Notification queries and management
- **`LeaderboardSnapshotRepository.java`** - Snapshot queries and aggregation
- **`DailyUserSummaryRepository.java`** - Daily stats queries
- **`SuspiciousActivityRepository.java`** - Fraud detection queries

#### **Security** (`security/`)
JWT and Spring Security configuration:

1. **`JwtTokenProvider.java`**
   - JWT token generation
   - Token validation and parsing
   - Claims extraction
   - Token expiration handling

2. **`JwtAuthenticationEntryPoint.java`**
   - Handles unauthorized access
   - Returns 401 responses with error details

3. **`SecurityConfig.java`**
   - Spring Security configuration
   - JWT filter setup
   - CORS policy configuration
   - Endpoint authentication rules

#### **Configuration** (`config/`)
Application-level configuration:

1. **`RedisConfig.java`** - Redis connection and caching setup
2. **`ApplicationConfig.java`** - General application beans
3. **`JwtConfig.java`** - JWT-specific configurations

#### **Scheduler** (`scheduler/`)
Background scheduled tasks:

1. **`LeaderboardAggregationScheduler.java`**
   - Runs every 15 minutes
   - Aggregates leaderboard rankings
   - Creates snapshots
   - Updates Redis cache

2. **`AnalyticsScheduler.java`**
   - Runs daily at midnight
   - Generates daily summaries
   - Aggregates weekly statistics
   - Cleans up old data

3. **`NotificationScheduler.java`**
   - Generates weekly summary notifications
   - Sends milestone notifications
   - Cleanup of old notifications

#### **Exceptions** (`exception/`)
Custom exception classes:

1. **`ResourceNotFoundException.java`** - 404 errors
2. **`BadRequestException.java`** - Validation failures
3. **`UnauthorizedException.java`** - Auth failures
4. **`GlobalExceptionHandler.java`** - Centralized exception handling

#### **Events** (`event/`)
Event-driven architecture:

1. **`ActivitySubmittedEvent.java`** - Triggers badge evaluation, point calculation
2. **`AchievementUnlockedEvent.java`** - Notification generation
3. **`StreakMilestoneEvent.java`** - Milestone notifications

### **Resources** (`src/main/resources/`)
- **`application.properties`**: Spring Boot configuration
- **SQL Scripts**: Database schema initialization and diagnostic queries
- **Migration Scripts**: Flyway migration files for schema management

---

## 🎨 Frontend Structure (`frontend/`)

### **Configuration Files**
- **`package.json`**: NPM dependencies and scripts
  - React 19.2.4, Redux Toolkit, React Router, Tailwind CSS
  - Build scripts: start, build, test, eject

- **`tsconfig.json`**: TypeScript compiler configuration
- **`tailwind.config.js`**: Tailwind CSS customization
- **`.env` / `.env.local`**: Environment configuration (API endpoints)

### **Source Code** (`src/`)

#### **Main Application File**
- **`App.tsx`**: Main routing configuration
  - Public routes: `/login`, `/register`, `/rules`
  - Protected routes: `/dashboard`, `/goals/new`, `/leaderboard`, `/badges`, `/analytics`, `/settings`
  - Route protection with PrivateRoute component

#### **Redux Store** (`store/`)
Centralized state management using Redux Toolkit:

1. **`index.ts`** - Store configuration with all slices

2. **`authSlice.ts`** - Authentication state
   - `user`: Current logged-in user
   - `token`: JWT token
   - `isAuthenticated`: Auth status
   - `loading`: Request loading state
   - Actions: login, signup, logout, refreshToken

3. **`goalsSlice.ts`** - Goals management state
   - `goals`: Array of user goals
   - `selectedGoal`: Currently selected goal
   - `loading`: Loading state
   - Actions: fetchGoals, createGoal, updateGoal, deleteGoal, setSelectedGoal

4. **`dashboardSlice.ts`** - Dashboard data
   - `dashboardData`: User statistics
   - `recentActivities`: Recent submissions
   - `nextBadges`: Upcoming badge milestones
   - Actions: fetchDashboard, updateDashboard

5. **`activitySlice.ts`** - Activity logs state
   - `activities`: User activities
   - `filters`: Applied filters (date range, goal)
   - Actions: fetchActivities, logActivity, updateActivity, deleteActivity

6. **`leaderboardSlice.ts`** - Basic leaderboard state
   - `rankings`: User rankings
   - `userPosition`: Current user's rank
   - `selectedCategory`: Chosen category
   - Actions: fetchLeaderboard, fetchUserPosition

7. **`enhancedLeaderboardSlice.ts`** - Advanced leaderboard
   - `leaderboard`: Detailed ranking data with stats
   - `trends`: Ranking trends
   - `friends`: Friend list rankings
   - Actions: fetchEnhancedLeaderboard, fetchTrends

8. **`badgesSlice.ts`** - Badge system state
   - `badges`: Available badges
   - `earnedBadges`: User's acquired badges
   - `progress`: Progress toward badges
   - Actions: fetchBadges, fetchEarnedBadges, fetchProgress

9. **`analyticsSlice.ts`** - Analytics data
   - `dailyStats`: Daily performance data
   - `weeklyStats`: Weekly aggregation
   - `categoryStats`: Category breakdown
   - Actions: fetchAnalytics, fetchCategoryStats

10. **`settingsSlice.ts`** - User settings
    - `privacy`: Privacy settings
    - `preferences`: User preferences
    - `profile`: User profile info
    - Actions: updateSettings, fetchSettings

11. **`notificationsSlice.ts`** - Notifications state
    - `notifications`: List of notifications
    - `unreadCount`: Unread notification count
    - `preferences`: Notification preferences
    - Actions: fetchNotifications, markAsRead, updatePreferences

#### **Components** (`components/`)
Reusable React components organized by feature:

1. **`Auth/` - Authentication Components**
   - **`Login.tsx`**: Login form with email/password
   - **`Register.tsx`**: Registration form with validation
   - **`ForgotPassword.tsx`**: Password reset flow

2. **`Dashboard/` - Main Dashboard**
   - **`Dashboard.tsx`**: Main dashboard page
   - **`StatCard.tsx`**: Stat display component
   - **`RecentActivities.tsx`**: Recent submission list
   - **`UpcomingBadges.tsx`**: Next milestones display
   - **`StreakCounter.tsx`**: Current streak display

3. **`Goals/` - Goal Management**
   - **`NewGoal.tsx`**: Create new goal form
   - **`GoalsList.tsx`**: Display all goals
   - **`GoalCard.tsx`**: Individual goal card with daily progress
   - **`GoalDetail.tsx`**: Detailed goal view
   - **`EditGoal.tsx`**: Goal modification form
   - **`LogActivity.tsx`**: Log time spent on goal

4. **`Leaderboard/` - Leaderboard Display**
   - **`EnhancedLeaderboard.tsx`**: Main leaderboard view
   - **`LeaderboardTable.tsx`**: Ranking table
   - **`UserRankCard.tsx`**: Individual rank card
   - **`FilterBar.tsx`**: Category and period filters
   - **`TrendChart.tsx`**: Ranking trend visualization

5. **`Badges/` - Badge System**
   - **`Badges.tsx`**: Main badge page
   - **`BadgeGrid.tsx`**: Grid of all badges
   - **`BadgeCard.tsx`**: Individual badge with progress
   - **`EarnedBadges.tsx`**: User's acquired badges
   - **`Progress.tsx`**: Progress toward badges

6. **`Analytics/` - Analytics & Statistics**
   - **`Analytics.tsx`**: Main analytics view
   - **`DailyChart.tsx`**: Daily performance chart
   - **`WeeklyChart.tsx`**: Weekly aggregation chart
   - **`CategoryBreakdown.tsx`**: Category analysis pie chart
   - **`TrendAnalysis.tsx`**: Historical trend lines

7. **`Activity/` - Activity Tracking**
   - **`ActivityLog.tsx`**: Activity history view
   - **`ActivityEntry.tsx`**: Single activity row
   - **`ActivityForm.tsx`**: Submit activity form
   - **`DateRangeFilter.tsx`**: Activity filter component

8. **`Settings/` - User Settings**
   - **`Settings.tsx`**: Settings page
   - **`PrivacySettings.tsx`**: Privacy controls
   - **`Preferences.tsx`**: User preferences
   - **`ProfileSettings.tsx`**: Profile management
   - **`SecuritySettings.tsx`**: Password and security

9. **`Rules/` - Platform Rules**
   - **`PlatformRules.tsx`**: Rules and guidelines display
   - **`ScoringBreakdown.tsx`**: How points are calculated
   - **`FairPlayGuidelines.tsx`**: Fair play policy

10. **`Layout/` - Layout Components**
    - **`Header.tsx`**: Top navigation bar
    - **`Sidebar.tsx`**: Side navigation menu
    - **`Layout.tsx`**: Main layout wrapper
    - **`PrivateRoute.tsx`**: Auth-protected route wrapper
    - **`Footer.tsx`**: Footer component

### **Services** (`services/`)
- **`api.ts`**: Axios instance and API request functions
  - Centralized API endpoint configuration
  - Request/response interceptors
  - Authentication header injection
  - Error handling

### **Types** (`types/`)
- **`index.ts`**: TypeScript interfaces and types
  - User interface
  - Goal interface
  - Activity interface
  - Leaderboard interface
  - Badge interface
  - And more...

### **Styling**
- **`App.css`**: Global styles
- **`index.css`**: Root styles with Tailwind imports
- **`tailwind.config.js`**: Tailwind customization

### **Testing**
- **`setupTests.ts`**: Jest configuration
- **`App.test.tsx`**: Basic app tests
- **Component tests** (optional): Individual component test files

### **Public Assets** (`public/`)
- **`index.html`**: HTML template
- **`manifest.json`**: PWA manifest
- **`robots.txt`**: SEO robots file

---

## 🚀 Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.4 | UI framework |
| TypeScript | 4.9.5 | Type safety |
| Redux Toolkit | 2.11.2 | State management |
| React Router | 7.13.0 | Routing and navigation |
| Tailwind CSS | 3.4.16 | Styling and theming |
| Recharts | 3.7.0 | Data visualization |
| Axios | 1.13.4 | HTTP client |
| date-fns | 4.1.0 | Date manipulation |

### **Backend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 3.2.12 | Framework |
| Java | 21 | Language |
| Spring Security | Latest | JWT authentication |
| Spring Data JPA | Latest | ORM and database |
| Spring Data Redis | Latest | Caching layer |
| PostgreSQL | 15 | Primary database |
| Redis | 7 | Cache store |
| JJWT | 0.12.5 | JWT token handling |
| Lombok | 1.18.42 | Code generation |
| Flyway | Latest | Database migrations |

### **Infrastructure**
| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Maven | Build automation |
| npm | Node package management |
| Git | Version control |

---

## � Frontend-Backend Integration & Communication Architecture

This section explains how the React frontend communicates with the Spring Boot backend, including the complete data flow, authentication mechanism, and state management integration.

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (Port 3000)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Components                         │ │
│  │  (Dashboard, Goals, Leaderboard, Badges, etc.)            │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │           Redux Toolkit State Management                   │ │
│  │  (authSlice, goalsSlice, dashboardSlice, etc.)           │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │  Async Thunks (createAsyncThunk)                          │ │
│  │  - API calls dispatched here                              │ │
│  │  - Pending/Fulfilled/Rejected states                      │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │           API Service Layer (api.ts)                       │ │
│  │  - Axios instance with baseURL                            │ │
│  │  - Request/Response Interceptors                          │ │
│  │  - JWT Token Management                                   │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │ HTTP/REST API
                              │ (JSON payloads)
                              │ (Bearer Token in headers)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                SPRING BOOT BACKEND (Port 8080)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   Controller Layer (13 REST Controllers)                  │ │
│  │   - @RequestMapping("/api/...")                           │ │
│  │   - Request validation                                    │ │
│  │   - Response mapping                                      │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │  Security & Filters                                        │ │
│  │  - JwtAuthenticationFilter                                │ │
│  │  - User authentication via token                          │ │
│  │  - SecurityContext setup                                  │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │           Service Layer (17 Services)                      │ │
│  │  - Business logic execution                               │ │
│  │  - Data transformation                                    │ │
│  │  - Complex operations (calculations, aggregations)        │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │  Repository Layer (JPA Repositories)                      │ │
│  │  - Database queries                                       │ │
│  │  - CRUD operations                                        │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │     Caching Layer (Redis)                                 │ │
│  │  - Leaderboard cache                                      │ │
│  │  - User statistics cache                                  │ │
│  │  - Session management                                     │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │          PostgreSQL Database                              │ │
│  │  - All persistent data                                    │ │
│  │  - User accounts, goals, activities, points, etc.         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Background Services:                                           │
│  - LeaderboardAggregationScheduler (every 15 mins)            │
│  - AnalyticsScheduler (daily at 2 AM)                         │
│  - NotificationScheduler                                       │
│  - Anti-cheat monitoring                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### **1. API Communication Layer**

#### **Axios API Instance Setup** (`src/services/api.ts`)

```typescript
// Create Axios instance with base URL and default headers
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Key Configuration:**
- **Base URL**: All API requests point to `http://localhost:8080/api`
- **Content-Type**: JSON for request/response bodies
- **Cache Control**: Headers prevent default browser caching

#### **Request Interceptor** (Adds Authentication)

```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Add JWT token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

**What it does:**
- Intercepts every outgoing request
- Retrieves JWT token from localStorage
- Adds `Authorization: Bearer <token>` header
- Enables backend to identify and authenticate user

#### **Response Interceptor** (Handles Errors)

```typescript
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**What it does:**
- Catches all responses and errors
- If 401 (Unauthorized): user is redirected to login
- Token is cleared from localStorage
- Forces user to re-authenticate

---

### **2. Authentication Flow**

#### **Step-by-Step Login Process**

```
1. User enters email and password on Login page
   ↓
2. Login component dispatches login() async thunk
   ↓
3. authSlice.ts calls authAPI.login(email, password)
   ↓
4. axios POST request sent to /api/auth/login
   ↓
5. Request interceptor adds JWT token (if exists)
   ↓
6. Backend AuthController.login() processes request
   ↓
7. Backend validates credentials against database
   ↓
8. Backend generates JWT token with user info
   ↓
9. Backend returns { token, userId, username, email }
   ↓
10. Frontend stores token in localStorage
    ↓
11. Redux auth state updated (isAuthenticated = true)
    ↓
12. User redirected to /dashboard
```

#### **Code Example: Login Flow**

**Frontend - Login Component:**
```typescript
// components/Auth/Login.tsx
const handleLogin = async (email: string, password: string) => {
  dispatch(login({ email, password }));
  // Redux action triggers async thunk
};
```

**Frontend - Redux Thunk:**
```typescript
// store/authSlice.ts
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // API call via interceptor
      const response = await authAPI.login(credentials.email, credentials.password);
      const { token, userId, username, email } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Return user data
      return { token, user: { id: userId, username, email } };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);
```

**Backend - AuthController:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Validate credentials
    User user = userRepository.findByEmail(request.getEmail());
    if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
        return ResponseEntity.status(401).body("Invalid credentials");
    }
    
    // Generate JWT token
    String token = jwtTokenProvider.generateToken(user);
    
    // Return response
    LoginResponse response = new LoginResponse(
        token,
        user.getId(),
        user.getUsername(),
        user.getEmail()
    );
    return ResponseEntity.ok(response);
}
```

**JWT Token Validation in Backend:**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractTokenFromRequest(request);
            
            if (token != null && jwtTokenProvider.validateToken(token)) {
                // Extract user info from token
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                User user = userRepository.findById(userId).orElse(null);
                
                // Set user in SecurityContext for this request
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(user, null, null);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            logger.error("JWT authentication failed", e);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

### **3. State Management & Data Flow**

#### **Redux Slices Pattern**

Each major feature has a Redux slice that manages:
- **State**: Data from backend
- **Async Thunks**: API calls
- **Reducers**: State updates

**Example: Goals Feature**

```typescript
// store/goalsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface GoalsState {
  goals: Goal[];
  selectedGoal: Goal | null;
  loading: boolean;
  error: string | null;
}

// Async Thunk: Fetch all goals from backend
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      // API call (interceptor adds token)
      const response = await api.get('/goals');
      return response.data; // Array of goals from backend
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Async Thunk: Create new goal
export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData: CreateGoalRequest, { rejectWithValue }) => {
    try {
      // POST goal data to backend
      const response = await api.post('/goals', goalData);
      return response.data; // New goal from backend
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchGoals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload; // Update state with backend data
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle createGoal
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload); // Add new goal to state
      });
  },
});
```

---

### **4. Component-to-API Request Flow**

#### **Complete Example: Logging Activity**

**Step 1: User submits activity on Dashboard**
```typescript
// Dashboard component
const handleSubmitActivity = async (goalId: number, minutes: number) => {
  dispatch(logActivity({ goalId, minutes }));
};
```

**Step 2: Redux dispatches async thunk**
```typescript
// activitySlice.ts
export const logActivity = createAsyncThunk(
  'activity/logActivity',
  async (data: { goalId: number; minutes: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/activities', {
        goalId: data.goalId,
        minutesSpent: data.minutes,
        logDate: new Date().toISOString().split('T')[0],
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

**Step 3: Request interceptor adds token**
```
Outgoing Request:
POST /api/activities
Headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
  'Content-Type': 'application/json'
}
Body: {
  "goalId": 5,
  "minutesSpent": 45,
  "logDate": "2026-02-12"
}
```

**Step 4: Backend processes request**
```java
@PostMapping("/activities")
public ResponseEntity<?> logActivity(@RequestBody ActivityLogRequest request) {
    // Extract user from SecurityContext (set by JwtAuthenticationFilter)
    User currentUser = (User) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
    
    // Validate goal belongs to user
    Goal goal = goalRepository.findById(request.getGoalId())
        .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
    
    if (!goal.getUser().getId().equals(currentUser.getId())) {
        return ResponseEntity.status(403).body("Unauthorized");
    }
    
    // Run anti-cheat checks
    antiCheatService.validateActivity(currentUser, goal, request.getMinutesSpent());
    
    // Create activity log
    ActivityLog activity = new ActivityLog();
    activity.setUser(currentUser);
    activity.setGoal(goal);
    activity.setMinutesSpent(request.getMinutesSpent());
    activity.setLogDate(LocalDate.parse(request.getLogDate()));
    
    // Save to database
    ActivityLog savedActivity = activityLogRepository.save(activity);
    
    // Calculate and award points
    int pointsAwarded = gamificationService.calculateAndAwardPoints(
        currentUser, goal, request.getMinutesSpent(), streakCount, LocalDate.now()
    );
    
    // Check badge criteria
    badgeEvaluationService.evaluateBadges(currentUser);
    
    // Update leaderboard cache
    leaderboardService.updateUserRankInCache(currentUser.getId());
    
    // Return result
    return ResponseEntity.ok(new ActivityResponse(
        savedActivity.getId(),
        pointsAwarded,
        true
    ));
}
```

**Step 5: Frontend receives response & updates state**
```typescript
// Redux reducer handles fulfillment
.addCase(logActivity.fulfilled, (state, action) => {
  state.activities.push(action.payload);
  state.pointsAwarded = action.payload.pointsAwarded;
  state.loading = false;
})
```

**Step 6: UI re-renders with new data**
```
Component receives updated state → UI updates with:
- Activity added to list
- Points increased
- Streak updated
- New badge notifications
```

---

### **5. Request/Response Examples**

#### **Example 1: Get User's Goals**

**Frontend Request:**
```typescript
// components/Goals/GoalsList.tsx
useEffect(() => {
  dispatch(fetchGoals());
}, []);
```

**HTTP Request:**
```
GET /api/goals HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Backend Response:**
```json
[
  {
    "id": 1,
    "userId": 10,
    "categoryId": 5,
    "title": "Learn React",
    "description": "Master React hooks and state management",
    "difficulty": 3,
    "dailyMinimumMinutes": 60,
    "startDate": "2026-01-01",
    "endDate": "2026-06-30",
    "isActive": true,
    "isPrivate": false,
    "createdAt": "2026-01-01T10:30:00",
    "updatedAt": "2026-02-12T15:45:00"
  },
  {
    "id": 2,
    "userId": 10,
    "categoryId": 7,
    "title": "Daily Fitness",
    "description": "40 mins cardio exercise",
    "difficulty": 2,
    "dailyMinimumMinutes": 40,
    "startDate": "2026-01-15",
    "endDate": null,
    "isActive": true,
    "isPrivate": true,
    "createdAt": "2026-01-15T08:00:00",
    "updatedAt": "2026-02-10T18:20:00"
  }
]
```

**Frontend State Update:**
```typescript
// Redux state after response
{
  goals: [
    { id: 1, title: "Learn React", ... },
    { id: 2, title: "Daily Fitness", ... }
  ],
  loading: false,
  error: null
}
```

#### **Example 2: Create New Goal**

**Frontend Request:**
```typescript
const newGoal = {
  title: "Python Mastery",
  description: "Learn Python for data science",
  categoryId: 3,
  difficulty: 4,
  dailyMinimumMinutes: 90,
  startDate: "2026-02-15",
  endDate: "2026-08-15",
  isPrivate: false
};
dispatch(createGoal(newGoal));
```

**HTTP Request:**
```json
POST /api/goals HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Python Mastery",
  "description": "Learn Python for data science",
  "categoryId": 3,
  "difficulty": 4,
  "dailyMinimumMinutes": 90,
  "startDate": "2026-02-15",
  "endDate": "2026-08-15",
  "isPrivate": false
}
```

**Backend Creates Goal & Returns:**
```json
{
  "id": 103,
  "userId": 10,
  "categoryId": 3,
  "title": "Python Mastery",
  "description": "Learn Python for data science",
  "difficulty": 4,
  "dailyMinimumMinutes": 90,
  "startDate": "2026-02-15",
  "endDate": "2026-08-15",
  "isActive": true,
  "isPrivate": false,
  "createdAt": "2026-02-12T16:00:00",
  "updatedAt": "2026-02-12T16:00:00"
}
```

---

### **6. Data Flow Diagram: Complete User Action**

```
┌─────────────────────────────────────────────────────────────────┐
│ USER CLICKS "LOG 45 MINUTES ON GOAL"                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ React Component        │
        │ (Dashboard.tsx)        │
        │ Calls:                 │
        │ handleSubmitActivity() │
        └─────────┬──────────────┘
                  │
                  ▼
        ┌────────────────────────────┐
        │ Redux Async Thunk          │
        │ logActivity()              │
        │ Sets state: loading=true   │
        └─────────┬──────────────────┘
                  │
                  ▼
        ┌────────────────────────────┐
        │ API Service (api.ts)       │
        │ post('/activities', {...}) │
        └─────────┬──────────────────┘
                  │
                  ▼
        ┌────────────────────────────┐
        │ Request Interceptor        │
        │ Adds Authorization header  │
        │ Bearer token added         │
        └─────────┬──────────────────┘
                  │
                  ▼
        ┌────────────────────────────────────────┐
        │ HTTP POST REQUEST TO BACKEND           │
        │ POST /api/activities                   │
        │ Headers: Authorization, Content-Type   │
        │ Body: goalId, minutesSpent, logDate    │
        └─────────┬──────────────────────────────┘
                  │
    ══════════════╬══════════════════════════════════ NETWORK ════
                  │
                  ▼
        ┌────────────────────────────────┐
        │ Spring Boot Backend            │
        │ ActivityController.logActivity │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ JwtAuthenticationFilter        │
        │ Validates token               │
        │ Sets SecurityContext          │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ ActivityService.saveActivity() │
        │ Validates input data           │
        │ Checks authorization           │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ AntiCheatService.validate()    │
        │ Detects suspicious patterns    │
        │ Calculates trust score         │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ ActivityLogRepository.save()   │
        │ INSERT INTO activity_logs      │
        │ Returns saved entity to DB     │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ GamificationService            │
        │ Calculate points:              │
        │ - Base points (difficulty)     │
        │ - Time bonus                   │
        │ - Streak bonus                 │
        │ - Apply diminishing returns    │
        │ - Enforce daily cap            │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ PointLedgerRepository.save()   │
        │ Record point transaction       │
        │ INSERT INTO point_ledgers      │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ StreakService.updateStreak()   │
        │ Update user's streak count     │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ BadgeEvaluationService         │
        │ Check ALL badge criteria       │
        │ Award badges if criteria met   │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ NotificationService.create()   │
        │ Create badges earned notif     │
        │ Create milestone notifications │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ LeaderboardService.updateRank()│
        │ Recalculate user's rank        │
        │ Update Redis cache             │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────────────┐
        │ HTTP 200 OK Response                   │
        │ Body:                                  │
        │ {                                      │
        │   "activityId": 5042,                  │
        │   "pointsAwarded": 35,                 │
        │   "streakCount": 12,                   │
        │   "success": true                      │
        │ }                                      │
        └─────────┬──────────────────────────────┘
                  │
    ══════════════╬══════════════════════════════════ NETWORK ════
                  │
                  ▼
        ┌────────────────────────────────┐
        │ Response Interceptor (api.ts)  │
        │ Returns response successfully  │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ Redux Reducer                  │
        │ .addCase(fulfilled)            │
        │ Update state:                  │
        │ - Add activity to list         │
        │ - Update points               │
        │ - Update streak               │
        │ - Update badges               │
        └─────────┬──────────────────────┘
                  │
                  ▼
        ┌────────────────────────────────┐
        │ React Component Re-renders     │
        │ Displays:                      │
        │ - Confirmation message         │
        │ - Points increased             │
        │ - New streak count             │
        │ - Badge notifications          │
        └─────────────────────────────────┘
```

---

### **7. Error Handling Flow**

#### **Scenario: Invalid Activity (Minutes Exceed Limit)**

```
Frontend submits activity with 500 minutes (unusual)
      │
      ▼
Backend AntiCheatService.validate() detects anomaly
      │
      ▼
Risk score > threshold
      │
      ▼
Exception thrown: SuspiciousActivityException
      │
      ▼
GlobalExceptionHandler catches exception
      │
      ▼
HTTP 400 Response sent back:
{
  "status": 400,
  "message": "Suspicious activity detected. Submission rejected.",
  "details": "Minutes submitted exceed maximum safe threshold"
}
      │
      ▼
Response Interceptor receives error
      │
      ▼
Redux reducer handles rejected case:
.addCase(logActivity.rejected, (state, action) => {
  state.error = action.payload;
  state.loading = false;
})
      │
      ▼
Component displays error to user:
"Activity submission rejected due to suspicious pattern"
```

---

### **8. Real-Time Updates**

While FocusForge uses traditional REST API (not WebSocket), real-time feel is achieved through:

1. **Polling**: Frontend periodically fetches updated data
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       dispatch(fetchDashboard()); // Fetch every 30 seconds
     }, 30000);
     return () => clearInterval(interval);
   }, []);
   ```

2. **Background Jobs**: Backend updates data regularly
   - Leaderboard aggregates every 15 minutes
   - Dashboard data refreshes on user interactions
   - Analytics computed nightly

3. **Cache Invalidation**: When user acts, cache is immediately updated
   - LogActivity triggers LeaderboardService.updateRank()
   - Redis cache invalidated and refreshed immediately
   - Next fetch gets fresh data

---

### **9. Security at Each Layer**

```
Layer 1: Frontend
├─ HTTPS/TLS encryption
├─ JWT token stored in localStorage
├─ Token sent in Authorization header
└─ CORS policy enforcement

Layer 2: Request Interceptor
├─ Token injection
├─ Request validation
└─ Error handling

Layer 3: Network
├─ TLS encryption in transit
└─ Secure headers (HSTS, CSP, etc.)

Layer 4: Backend Filter
├─ Extract token from header
├─ Validate JWT signature
├─ Verify token expiration
├─ Extract user information
└─ Set SecurityContext

Layer 5: Controller
├─ Request validation (@Valid)
├─ Authorization checks
├─ Input sanitization
└─ Permission verification

Layer 6: Service Layer
├─ Business logic validation
├─ Anti-cheat checks
├─ Data integrity verification
└─ Audit logging

Layer 7: Database
├─ Parameterized queries (prevent SQL injection)
├─ Row-level security
├─ Data encryption at rest
└─ Transaction management
```

---

### **10. Example: Complete Leaderboard Flow**

**Frontend:**
```typescript
// Component requests leaderboard
dispatch(fetchLeaderboard({ category: 'programming' }));
```

**Redux Thunk:**
```typescript
export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetch',
  async ({ category }, { rejectWithValue }) => {
    const response = await api.get('/leaderboard', {
      params: { category }  // Query parameter
    });
    return response.data;
  }
);
```

**HTTP Request:**
```
GET /api/leaderboard?category=programming HTTP/1.1
Authorization: Bearer token...
```

**Backend:**
```java
@GetMapping
public ResponseEntity<?> getLeaderboard(
    @RequestParam(required = false) String category) {
    
    User currentUser = getCurrentUser();
    
    // Try to get from Redis cache first
    List<LeaderboardEntry> cached = leaderboardService
        .getFromCache(category);
    
    if (cached != null) {
        return ResponseEntity.ok(cached);
    }
    
    // If not cached, query database
    List<LeaderboardEntry> rankings = 
        leaderboardService.calculateRankings(category);
    
    // Store in Redis cache
    leaderboardService.cacheRankings(category, rankings);
    
    return ResponseEntity.ok(rankings);
}
```

**Response:**
```json
[
  {
    "rank": 1,
    "userId": 45,
    "username": "john_doe",
    "points": 15420,
    "streak": 28,
    "badgesCount": 12,
    "daysActive": 65
  },
  {
    "rank": 2,
    "userId": 10,
    "username": "harsh_dev",
    "points": 12890,
    "streak": 15,
    "badgesCount": 9,
    "daysActive": 52
  }
]
```

**Frontend Updates:**
```typescript
// Redux state updated with leaderboard data
state.leaderboard = action.payload;

// Component re-renders with rankings
<LeaderboardTable rankings={state.leaderboard} />
```

---

## �💾 Database Schema

### **Key Tables**

#### `users`
```sql
- id (PK)
- email (UNIQUE)
- username (UNIQUE)
- password_hash
- created_at, updated_at
- is_active
- privacy_settings (JSON)
```

#### `goals`
```sql
- id (PK)
- user_id (FK -> users)
- category_id (FK -> categories)
- title, description
- difficulty (1-5)
- daily_minimum_minutes
- start_date, end_date
- is_active, is_private
- created_at, updated_at
```

#### `activity_logs`
```sql
- id (PK)
- user_id (FK -> users)
- goal_id (FK -> goals)
- log_date
- minutes_spent
- notes
- created_at
- UNIQUE(user_id, goal_id, log_date)
```

#### `point_ledgers`
```sql
- id (PK)
- user_id (FK -> users)
- goal_id (FK -> goals)
- points
- reason
- reference_date
- created_at
```

#### `streaks`
```sql
- id (PK)
- user_id (FK -> users)
- current_streak
- longest_streak
- last_active_date
```

#### `badges`
```sql
- id (PK)
- name (UNIQUE)
- description
- criteria_type (STREAK, POINTS, CONSISTENCY, DAYS_ACTIVE)
- threshold
- evaluation_scope (GLOBAL, PER_GOAL, PER_CATEGORY)
- points_bonus
- icon_url
```

#### `user_badges`
```sql
- id (PK)
- user_id (FK -> users)
- badge_id (FK -> badges)
- awarded_date
- awarded_points
```

#### `leaderboard_snapshots`
```sql
- id (PK)
- user_id (FK -> users)
- rank
- points
- category
- snapshot_date
- created_at
```

#### `notifications`
```sql
- id (PK)
- user_id (FK -> users)
- type
- title, message
- is_read
- created_at
```

#### `suspicious_activities`
```sql
- id (PK)
- user_id (FK -> users)
- activity_id (FK -> activity_logs)
- risk_score
- reason
- flagged_date
```

---

## 🔄 Key Workflows

### **Activity Submission Workflow**
```
1. User logs activity (minutes on goal)
   ↓
2. System validates input
   ↓
3. Anti-cheat check (TrustScore, anomaly detection)
   ↓
4. GamificationService calculates points
   ↓
5. Points awarded with caps and diminishing returns
   ↓
6. Streak updated
   ↓
7. BadgeEvaluationService checks badge criteria
   ↓
8. Badges awarded if criteria met
   ↓
9. Notifications generated
   ↓
10. Analytics updated
```

### **Leaderboard Aggregation Workflow** (Every 15 mins)
```
1. Fetch all users' current points
   ↓
2. Calculate rankings by category
   ↓
3. Create leaderboard snapshots
   ↓
4. Update Redis cache
   ↓
5. Trigger leaderboard change notifications
```

### **Analytics Aggregation Workflow** (Daily at midnight)
```
1. Calculate daily summaries per user
   ↓
2. Generate weekly category breakdowns
   ↓
3. Create category-specific summaries
   ↓
4. Archive old aggregations
   ↓
5. Prepare dashboard data
```

---

## 📊 API Endpoints Summary

### **Authentication**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### **Goals**
- `POST /api/goals` - Create
- `GET /api/goals` - List
- `GET /api/goals/{id}` - Get
- `PUT /api/goals/{id}` - Update
- `DELETE /api/goals/{id}` - Delete
- `PUT /api/goals/{id}/activate`
- `PUT /api/goals/{id}/pause`

### **Activities**
- `POST /api/activities` - Log activity
- `GET /api/activities` - List
- `GET /api/activities/{goalId}` - Goal activities
- `GET /api/activities/date-range` - Range query
- `PUT /api/activities/{id}` - Update
- `DELETE /api/activities/{id}` - Delete

### **Points & Streaks**
- `GET /api/points/balance` - Current points
- `GET /api/points/history` - Transaction history
- `GET /api/streaks` - Current streak info
- `GET /api/streaks/history` - Streak history

### **Badges**
- `GET /api/badges` - All badges
- `GET /api/badges/earned` - Earned badges
- `GET /api/badges/{id}` -Badge details
- `GET /api/badges/progress` - Progress info

### **Leaderboard**
- `GET /api/leaderboard` - Global rankings
- `GET /api/leaderboard/category/{category}` - Category rankings
- `GET /api/leaderboard/position` - User position
- `GET /api/leaderboard/nearby` - Nearby users
- `GET /api/leaderboard/history` - Snapshots

### **Dashboard & Analytics**
- `GET /api/dashboard` - Dashboard data
- `GET /api/analytics/summary` - Overall stats
- `GET /api/analytics/daily` - Daily breakdown
- `GET /api/analytics/category` - Category analysis

### **Notifications**
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread` - Unread count
- `PUT /api/notifications/{id}/read` - Mark read
- `DELETE /api/notifications/{id}` - Delete

### **Settings**
- `GET /api/settings/profile` - Profile
- `PUT /api/settings/profile` - Update profile
- `GET /api/settings/privacy` - Privacy settings
- `PUT /api/settings/privacy` - Update privacy
- `PUT /api/settings/password` - Change password

---

## 🔧 Setup & Installation

### **Prerequisites**
- Java 21 JDK
- Node.js 18+ and npm
- PostgreSQL 15
- Redis 7
- Maven 3.8+
- Docker & Docker Compose (for containerized setup)

### **Backend Setup**

1. **Clone Repository**
   ```bash
   cd focusforge-backend
   ```

2. **Configure Database** (in `application.properties`)
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/focusforge
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   spring.jpa.hibernate.ddl-auto=validate
   spring.jpa.show-sql=false
   ```

3. **Configure Redis** (in `application.properties`)
   ```properties
   spring.redis.host=localhost
   spring.redis.port=6379
   ```

4. **Build Project**
   ```bash
   mvn clean install
   ```

5. **Run Application**
   ```bash
   mvn spring-boot:run
   ```
   Backend runs on `http://localhost:8080`

### **Frontend Setup**

1. **Navigate to Frontend**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure API Endpoint** (create `.env.local`)
   ```
   REACT_APP_API_URL=http://localhost:8080
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3000`

### **Using Docker Compose**

1. **Start Infrastructure**
   ```bash
   cd focusforge-backend
   docker-compose up -d
   ```
   - PostgreSQL: `localhost:5712`
   - Redis: `localhost:6379`
   - PgAdmin: `localhost:5050`

2. **Run Backend**
   ```bash
   mvn spring-boot:run
   ```

3. **Run Frontend**
   ```bash
   cd frontend
   npm start
   ```

---

## 📈 Performance Considerations

### **Caching Strategy**
- Leaderboard rankings cached in Redis (15-min TTL)
- User statistics cached per session
- Badge definitions cached application-wide
- Category-based leaderboards separately cached

### **Database Optimization**
- Indexes on frequently queried columns (user_id, goal_id, log_date)
- Partitioning activity_logs and point_ledgers by date
- Composite indexes for common filter combinations
- Connection pooling with HikariCP

### **Background Jobs**
- Leaderboard aggregation runs every 15 minutes (off-peak optimized)
- Analytics aggregation runs nightly at 2 AM
- Async processing for notification sending
- Batch operations for bulk updates

### **Frontend Optimization**
- Code splitting with React Router
- Lazy loading component bundles
- Memoization of Redux selectors
- Debouncing of search and filter operations

---

## 🔐 Security Features

### **Authentication & Authorization**
- JWT token-based authentication
- bcrypt password hashing
- Token expiration and refresh mechanism
- Role-based access control (RBAC)

### **Data Protection**
- HTTPS/TLS encryption in transit
- Password hashing with bcrypt
- SQL injection prevention via parameterized queries
- XSS protection via React's built-in sanitization

### **Anti-Fraud Measures**
- Suspicious activity detection algorithm
- Trust score calculation per user
- Diminishing returns on points to prevent grinding
- Daily point caps per user
- Rate limiting on submissions

---

## 📝 License & Support

This project is designed for personal development, team learning, and educational purposes. For support, bug reports, or feature requests, contact the development team.

---

## 🎓 Learning Outcomes

By using FocusForge, users benefit from:
- **Self-Discipline**: Structured goal setting and tracking
- **Motivation**: Gamification mechanics drive engagement
- **Community**: Leaderboards foster healthy competition
- **Analytics**: Insights into personal productivity patterns
- **Achievement**: Badge system celebrates milestones

---

## 📞 Developer Notes

### **Common Administrative Commands**

```bash
# Manually trigger leaderboard aggregation
curl -X POST http://localhost:8080/api/admin/leaderboard/trigger-aggregation

# Check system health
curl -X GET http://localhost:8080/api/diagnostic/health

# View cache statistics
curl -X GET http://localhost:8080/api/diagnostic/cache-stats
```

### **Debugging Tips**
- Enable debug logging in `application.properties`: `logging.level.com.focusforge=DEBUG`
- Check PostgreSQL with PgAdmin on `localhost:5050`
- Monitor Redis with `redis-cli`
- Review error logs in `/target/logs/`

---

**Last Updated**: February 12, 2026
**Version**: 1.0.0-SNAPSHOT
**Status**: Active Development
