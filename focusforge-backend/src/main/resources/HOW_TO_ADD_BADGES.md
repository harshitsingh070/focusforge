# How to Add Sample Badges to Your Database

## Option 1: Using pgAdmin or Database Tool

1. Open your PostgreSQL database tool (pgAdmin, DBeaver, etc.)
2. Connect to the `focusforge` database
3. Open and execute this file: `focusforge-backend/src/main/resources/sample_badges.sql`

## Option 2: Using psql Command Line

If you have PostgreSQL command line tools installed:

```bash
# Windows (adjust path to your PostgreSQL bin directory)
"C:\Program Files\PostgreSQL\XX\bin\psql.exe" -U postgres -d focusforge -f "src\main\resources\sample_badges.sql"

# Or navigate to the file location
cd c:\Users\harsh\Desktop\focusforge\focusforge-backend\src\main\resources
"C:\Program Files\PostgreSQL\XX\bin\psql.exe" -U postgres -d focusforge -f sample_badges.sql
```

## Option 3: Copy-Paste SQL

Copy the contents of `sample_badges.sql` and paste directly into your database query tool.

## What This Will Create

**17 Sample Badges:**

### Points Badges (5 badges) ⭐
- First Steps (10 points)
- Rising Star (50 points)
- Century Club (100 points)
- Points Master (500 points)
- Millennium Master (1000 points)

### Streak Badges (4 badges) 🔥
- Three Day Fire (3 day streak)
- Week Warrior (7 day streak)
- Two Week Titan (14 day streak)
- Month Master (30 day streak)

### Consistency Badges (3 badges) 💪
- Dedication (7 consecutive days)
- Persistence (14 consecutive days)
- Consistency King (30 consecutive days)

### Milestones (5 badges) 📅
- Getting Started (5 active days)
- Committed (15 active days)
- 30 Day Challenge (30 active days)
- 100 Day Club (100 active days)

## After Adding Badges

1. Refresh your badges page
2. You should see:
   - "0 / 17 Earned" 
   - "17 Locked"
   - All badges organized by category
   - Progress bars showing your current progress

## To Test Badge Earning

Log some activities to earn your first badges:

1. Go to Dashboard
2. Log an activity (e.g., 30 minutes of Coding)
3. You'll automatically earn badges if you qualify
4. Check backend logs for: "User X earned Y badge(s)"
5. Refresh badges page to see earned badges with reasons!
