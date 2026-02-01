package com.focusforge.service;

import com.focusforge.model.ActivityLog;
import com.focusforge.model.Goal;
import com.focusforge.model.Streak;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.GoalRepository;
import com.focusforge.repository.PointLedgerRepository;
import com.focusforge.repository.StreakRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private StreakRepository streakRepository;

    public Map<String, Object> getUserAnalytics(Long userId) {
        Map<String, Object> analytics = new HashMap<>();

        // Weekly progress (last 7 days)
        analytics.put("weeklyProgress", getWeeklyProgress(userId));

        // Category breakdown
        analytics.put("categoryBreakdown", getCategoryBreakdown(userId));

        // Consistency metrics
        analytics.put("consistencyMetrics", getConsistencyMetrics(userId));

        // Monthly trends (last 6 months)
        analytics.put("monthlyTrends", getMonthlyTrends(userId));

        return analytics;
    }

    private List<Map<String, Object>> getWeeklyProgress(Long userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        List<Map<String, Object>> weeklyData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDate currentDate = date;

            List<ActivityLog> dayActivities = activityLogRepository
                    .findByUserIdAndLogDate(userId, currentDate);

            int totalMinutes = dayActivities.stream()
                    .mapToInt(ActivityLog::getMinutesSpent)
                    .sum();

            Integer points = pointLedgerRepository.getPointsForDate(userId, currentDate);

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", currentDate.format(formatter));
            dayData.put("points", points != null ? points : 0);
            dayData.put("minutes", totalMinutes);

            weeklyData.add(dayData);
        }

        return weeklyData;
    }

    private List<Map<String, Object>> getCategoryBreakdown(Long userId) {
        // Get all user goals grouped by category
        List<Goal> userGoals = goalRepository.findByUserId(userId);

        Map<String, Integer> categoryPoints = new HashMap<>();

        for (Goal goal : userGoals) {
            String category = goal.getCategory().getName();

            // Get all activity logs for this goal
            List<ActivityLog> goalActivities = activityLogRepository.findByUserIdAndLogDate(userId, null);
            int goalPoints = 0;

            for (ActivityLog activity : goalActivities) {
                if (activity.getGoal().getId().equals(goal.getId())) {
                    Integer dayPoints = pointLedgerRepository.getPointsForDate(userId, activity.getLogDate());
                    goalPoints += (dayPoints != null ? dayPoints : 0);
                }
            }

            if (goalPoints > 0) {
                categoryPoints.merge(category, goalPoints, Integer::sum);
            }
        }

        List<Map<String, Object>> breakdown = new ArrayList<>();
        int totalPoints = categoryPoints.values().stream().mapToInt(Integer::intValue).sum();
        final int finalTotalPoints = totalPoints > 0 ? totalPoints : 1;

        categoryPoints.forEach((category, points) -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("category", category);
            entry.put("points", points);
            entry.put("percentage", Math.round((points * 100.0) / finalTotalPoints));
            breakdown.add(entry);
        });

        breakdown.sort((a, b) -> ((Integer) b.get("points")).compareTo((Integer) a.get("points")));

        return breakdown;
    }

    private Map<String, Object> getConsistencyMetrics(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(29);

        // Get all activity dates in the period
        List<ActivityLog> activities = activityLogRepository.findByUserIdAndLogDateBetween(
                userId, startDate, today);

        Set<LocalDate> activeDates = new HashSet<>();
        for (ActivityLog activity : activities) {
            activeDates.add(activity.getLogDate());
        }

        int totalDays = 30;
        int activeDays = activeDates.size();
        double consistencyRate = Math.round((activeDays * 100.0) / totalDays);

        // Get longest streak from all user goals
        List<Goal> userGoals = goalRepository.findByUserId(userId);
        int longestStreak = 0;
        int currentStreak = 0;

        for (Goal goal : userGoals) {
            Optional<Streak> streakOpt = streakRepository.findByGoalId(goal.getId());
            if (streakOpt.isPresent()) {
                Streak streak = streakOpt.get();
                longestStreak = Math.max(longestStreak, streak.getLongestStreak());
                currentStreak = Math.max(currentStreak, streak.getCurrentStreak());
            }
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalDays", totalDays);
        metrics.put("activeDays", activeDays);
        metrics.put("consistencyRate", consistencyRate);
        metrics.put("longestStreak", longestStreak);
        metrics.put("currentStreak", currentStreak);

        return metrics;
    }

    private List<Map<String, Object>> getMonthlyTrends(Long userId) {
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> trends = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

            // Get activities for the month
            List<ActivityLog> monthActivities = activityLogRepository
                    .findByUserIdAndLogDateBetween(userId, monthStart, monthEnd);

            // Sum points for all activities
            int monthPoints = 0;
            for (ActivityLog activity : monthActivities) {
                Integer points = pointLedgerRepository.getPointsForDate(userId, activity.getLogDate());
                monthPoints += (points != null ? points : 0);
            }

            // Get unique goals
            Set<Long> uniqueGoals = new HashSet<>();
            for (ActivityLog activity : monthActivities) {
                uniqueGoals.add(activity.getGoal().getId());
            }

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(formatter));
            monthData.put("points", monthPoints);
            monthData.put("goals", uniqueGoals.size());

            trends.add(monthData);
        }

        return trends;
    }
}
