package com.focusforge.service;

import com.focusforge.model.Goal;
import com.focusforge.model.DailyUserSummary;
import com.focusforge.model.WeeklyCategorySummary;
import com.focusforge.repository.DailyUserSummaryRepository;
import com.focusforge.repository.GoalRepository;
import com.focusforge.repository.WeeklyCategorySummaryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AnalyticsService {

    @Autowired
    private DailyUserSummaryRepository dailyUserSummaryRepository;

    @Autowired
    private WeeklyCategorySummaryRepository weeklyCategorySummaryRepository;

    @Autowired
    private AnalyticsAggregationService analyticsAggregationService;

    @Autowired
    private TrustScoreService trustScoreService;

    @Autowired
    private GoalRepository goalRepository;

    public Map<String, Object> getUserAnalytics(Long userId) {
        try {
            ensureSummaries(userId);

            Map<String, Object> analytics = new HashMap<>();

            List<DailyUserSummary> last30 = getDailySummaries(userId, 30);
            List<Map<String, Object>> weeklyProgress = getWeeklyProgress(last30);
            analytics.put("weeklyProgress", weeklyProgress);

            List<Map<String, Object>> categoryBreakdown = getCategoryBreakdown(userId);
            analytics.put("categoryBreakdown", categoryBreakdown);

            Map<String, Object> consistencyMetrics = getConsistencyMetrics(last30);
            analytics.put("consistencyMetrics", consistencyMetrics);

            analytics.put("monthlyTrends", getMonthlyTrends(userId));
            analytics.put("streakHistory", getStreakHistory(last30));
            analytics.put("weeklyHeatmap", getWeeklyHeatmap(userId, 12));
            analytics.put("trustMetrics", trustScoreService.getTrustSummary(userId));
            analytics.put("insights", generateInsights(userId, last30, categoryBreakdown, consistencyMetrics));

            return analytics;
        } catch (Exception e) {
            log.error("Failed to build analytics for user {}: {}", userId, e.getMessage(), e);
            return buildFallbackAnalyticsPayload(userId);
        }
    }

    private void ensureSummaries(Long userId) {
        LocalDate today = LocalDate.now();
        List<DailyUserSummary> recent = dailyUserSummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                userId,
                today.minusDays(35),
                today);
        if (recent.isEmpty()) {
            analyticsAggregationService.rebuildUserSummaries(userId, 90);
        } else {
            analyticsAggregationService.updateAfterActivity(userId, today);
        }
    }

    private List<DailyUserSummary> getDailySummaries(Long userId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1L);
        return dailyUserSummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(userId, startDate, endDate);
    }

    private List<Map<String, Object>> getWeeklyProgress(List<DailyUserSummary> last30Days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        Map<LocalDate, DailyUserSummary> byDate = last30Days.stream()
                .collect(Collectors.toMap(DailyUserSummary::getSummaryDate, s -> s, (a, b) -> b));

        List<Map<String, Object>> weeklyData = new ArrayList<>(7);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            DailyUserSummary summary = byDate.get(date);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.format(formatter));
            dayData.put("points", summary != null ? safeInt(summary.getTotalPoints()) : 0);
            dayData.put("minutes", summary != null ? safeInt(summary.getTotalMinutes()) : 0);
            weeklyData.add(dayData);
        }

        return weeklyData;
    }

    private List<Map<String, Object>> getCategoryBreakdown(Long userId) {
        LocalDate weekStartLimit = LocalDate.now()
                .minusDays(27)
                .with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        List<WeeklyCategorySummary> recentCategorySummaries = weeklyCategorySummaryRepository
                .findByUserIdAndWeekStartBetweenOrderByWeekStartAsc(userId, weekStartLimit, LocalDate.now());

        if (recentCategorySummaries.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Integer> categoryMinutes = new HashMap<>();
        Map<String, Integer> categoryPoints = new HashMap<>();
        recentCategorySummaries.forEach(summary -> {
            categoryPoints.merge(summary.getCategoryName(), safeInt(summary.getTotalPoints()), Integer::sum);
            categoryMinutes.merge(summary.getCategoryName(), safeInt(summary.getTotalMinutes()), Integer::sum);
        });

        List<Map<String, Object>> breakdown = new ArrayList<>();
        int totalPoints = categoryPoints.values().stream().mapToInt(Integer::intValue).sum();
        int safeTotalPoints = totalPoints > 0 ? totalPoints : 1;

        categoryPoints.forEach((category, points) -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("category", category);
            entry.put("points", points);
            entry.put("minutes", categoryMinutes.getOrDefault(category, 0));
            entry.put("percentage", Math.round((points * 100.0) / safeTotalPoints));
            breakdown.add(entry);
        });

        breakdown.sort((a, b) -> ((Integer) b.get("points")).compareTo((Integer) a.get("points")));

        return breakdown;
    }

    private Map<String, Object> getConsistencyMetrics(List<DailyUserSummary> last30Days) {
        int totalDays = 30;
        int activeDays = (int) last30Days.stream().filter(s -> Boolean.TRUE.equals(s.getActiveFlag())).count();
        double consistencyRate = Math.round((activeDays * 100.0) / totalDays);
        int currentStreak = computeCurrentStreak(last30Days);
        int longestStreak = computeLongestStreak(last30Days);

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
        List<DailyUserSummary> summaries = dailyUserSummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                        userId,
                        today.minusMonths(6).withDayOfMonth(1),
                        today);

        Map<java.time.YearMonth, List<DailyUserSummary>> byMonth = summaries.stream()
                .collect(Collectors.groupingBy(s -> java.time.YearMonth.from(s.getSummaryDate())));

        List<Map<String, Object>> trends = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            java.time.YearMonth yearMonth = java.time.YearMonth.from(monthStart);
            List<DailyUserSummary> monthRows = byMonth.getOrDefault(yearMonth, Collections.emptyList());
            int monthPoints = monthRows.stream().mapToInt(r -> safeInt(r.getTotalPoints())).sum();
            int monthMinutes = monthRows.stream().mapToInt(r -> safeInt(r.getTotalMinutes())).sum();
            int activeDays = (int) monthRows.stream().filter(r -> Boolean.TRUE.equals(r.getActiveFlag())).count();
            int avgGoals = monthRows.isEmpty() ? 0 :
                    (int) Math.round(monthRows.stream().mapToInt(r -> safeInt(r.getActiveGoals())).average().orElse(0));

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(formatter));
            monthData.put("points", monthPoints);
            monthData.put("goals", avgGoals);
            monthData.put("minutes", monthMinutes);
            monthData.put("activeDays", activeDays);

            trends.add(monthData);
        }

        return trends;
    }

    private List<Map<String, Object>> getStreakHistory(List<DailyUserSummary> last30Days) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        List<Map<String, Object>> history = new ArrayList<>();

        int rollingStreak = 0;
        LocalDate expected = last30Days.isEmpty() ? null : last30Days.get(0).getSummaryDate();
        for (DailyUserSummary day : last30Days) {
            if (expected != null && !day.getSummaryDate().equals(expected)) {
                while (expected.isBefore(day.getSummaryDate())) {
                    rollingStreak = 0;
                    Map<String, Object> gap = new HashMap<>();
                    gap.put("date", expected.format(formatter));
                    gap.put("streak", rollingStreak);
                    history.add(gap);
                    expected = expected.plusDays(1);
                }
            }

            if (Boolean.TRUE.equals(day.getActiveFlag())) {
                rollingStreak++;
            } else {
                rollingStreak = 0;
            }

            Map<String, Object> point = new HashMap<>();
            point.put("date", day.getSummaryDate().format(formatter));
            point.put("streak", rollingStreak);
            history.add(point);
            expected = day.getSummaryDate().plusDays(1);
        }

        return history;
    }

    private List<Map<String, Object>> getWeeklyHeatmap(Long userId, int weeks) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays((weeks * 7L) - 1);
        List<DailyUserSummary> rows = dailyUserSummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(userId, startDate, endDate);

        Map<LocalDate, DailyUserSummary> byDate = rows.stream()
                .collect(Collectors.toMap(DailyUserSummary::getSummaryDate, s -> s, (a, b) -> b));
        List<Map<String, Object>> heatmap = new ArrayList<>(weeks * 7);
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("EEE");

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            DailyUserSummary summary = byDate.get(date);
            int minutes = summary != null ? safeInt(summary.getTotalMinutes()) : 0;
            int level = minutes == 0 ? 0 : minutes < 30 ? 1 : minutes < 60 ? 2 : minutes < 120 ? 3 : 4;

            Map<String, Object> cell = new HashMap<>();
            cell.put("date", date.toString());
            cell.put("label", labelFormatter.format(date));
            cell.put("minutes", minutes);
            cell.put("points", summary != null ? safeInt(summary.getTotalPoints()) : 0);
            cell.put("level", level);
            heatmap.add(cell);
        }

        return heatmap;
    }

    private List<String> generateInsights(
            Long userId,
            List<DailyUserSummary> last30Days,
            List<Map<String, Object>> categoryBreakdown,
            Map<String, Object> consistencyMetrics) {
        List<String> insights = new ArrayList<>();

        if (!categoryBreakdown.isEmpty()) {
            Map<String, Object> top = categoryBreakdown.get(0);
            insights.add(String.format("Your strongest category is %s (%d points recently).",
                    top.get("category"), top.get("points")));
        }

        int thisWeekMinutes = sumMinutes(last30Days, 0, 6);
        int lastWeekMinutes = sumMinutes(last30Days, 7, 13);
        if (lastWeekMinutes > 0) {
            double delta = ((thisWeekMinutes - lastWeekMinutes) * 100.0) / lastWeekMinutes;
            if (delta <= -20) {
                insights.add(String.format("Activity dropped %.0f%% this week. A short daily session can recover momentum.", Math.abs(delta)));
            } else if (delta >= 20) {
                insights.add(String.format("Great work: activity increased %.0f%% compared to last week.", delta));
            }
        }

        int currentStreak = (int) consistencyMetrics.getOrDefault("currentStreak", 0);
        if (currentStreak > 0 && currentStreak < 7) {
            insights.add(String.format("Maintaining your streak %d more day(s) can unlock Week Warrior.", 7 - currentStreak));
        }

        int consistencyRate = ((Number) consistencyMetrics.getOrDefault("consistencyRate", 0)).intValue();
        if (consistencyRate < 50) {
            insights.add("Consistency is below 50% in the last 30 days. Try a fixed daily time slot.");
        }

        Map<String, Object> trust = trustScoreService.getTrustSummary(userId);
        int trustScore = ((Number) trust.getOrDefault("score", 100)).intValue();
        if (trustScore < 70) {
            insights.add("Trust score is reduced due to suspicious patterns. Keep logs realistic to protect rankings.");
        }

        List<Goal> activeGoals = goalRepository.findActiveGoalsForUser(userId, LocalDate.now());
        int plannedDailyMinutes = activeGoals.stream()
                .mapToInt(goal -> safeInt(goal.getDailyMinimumMinutes()))
                .sum();
        int recentAvgMinutes = averageMinutes(last30Days, 7);
        if (plannedDailyMinutes > 0 && recentAvgMinutes < (int) (plannedDailyMinutes * 0.6)) {
            insights.add(String.format(
                    "Your plan targets %d min/day but current average is %d min/day. Consider adjusting goal difficulty.",
                    plannedDailyMinutes,
                    recentAvgMinutes));
        }

        if (insights.isEmpty()) {
            insights.add("You are maintaining steady progress. Keep logging daily to strengthen streaks and ranking.");
        }

        return insights;
    }

    private int computeCurrentStreak(List<DailyUserSummary> rows) {
        if (rows.isEmpty()) {
            return 0;
        }

        int streak = 0;
        for (int i = rows.size() - 1; i >= 0; i--) {
            DailyUserSummary day = rows.get(i);
            if (Boolean.TRUE.equals(day.getActiveFlag())) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    private int computeLongestStreak(List<DailyUserSummary> rows) {
        int longest = 0;
        int current = 0;
        for (DailyUserSummary day : rows) {
            if (Boolean.TRUE.equals(day.getActiveFlag())) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 0;
            }
        }
        return longest;
    }

    private int sumMinutes(List<DailyUserSummary> rows, int startOffset, int endOffset) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(endOffset);
        LocalDate end = today.minusDays(startOffset);
        return rows.stream()
                .filter(r -> !r.getSummaryDate().isBefore(start) && !r.getSummaryDate().isAfter(end))
                .mapToInt(r -> safeInt(r.getTotalMinutes()))
                .sum();
    }

    private int averageMinutes(List<DailyUserSummary> rows, int days) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(days - 1L);
        IntSummaryStatistics stats = rows.stream()
                .filter(r -> !r.getSummaryDate().isBefore(start) && !r.getSummaryDate().isAfter(today))
                .mapToInt(r -> safeInt(r.getTotalMinutes()))
                .summaryStatistics();
        if (stats.getCount() == 0) {
            return 0;
        }
        return (int) Math.round(stats.getAverage());
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private Map<String, Object> buildFallbackAnalyticsPayload(Long userId) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("weeklyProgress", buildFallbackWeeklyProgress());
        fallback.put("categoryBreakdown", Collections.emptyList());
        fallback.put("consistencyMetrics", Map.of(
                "totalDays", 30,
                "activeDays", 0,
                "consistencyRate", 0,
                "longestStreak", 0,
                "currentStreak", 0));
        fallback.put("monthlyTrends", buildFallbackMonthlyTrends());
        fallback.put("streakHistory", buildFallbackStreakHistory());
        fallback.put("weeklyHeatmap", buildFallbackHeatmap(12));
        fallback.put("trustMetrics", trustScoreService.getTrustSummary(userId));
        fallback.put("insights", List.of("Analytics are initializing. Log activity and refresh in a moment."));
        return fallback;
    }

    private List<Map<String, Object>> buildFallbackWeeklyProgress() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        List<Map<String, Object>> weeklyData = new ArrayList<>(7);
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.format(formatter));
            dayData.put("points", 0);
            dayData.put("minutes", 0);
            weeklyData.add(dayData);
        }
        return weeklyData;
    }

    private List<Map<String, Object>> buildFallbackMonthlyTrends() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        List<Map<String, Object>> trends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(formatter));
            monthData.put("points", 0);
            monthData.put("goals", 0);
            monthData.put("minutes", 0);
            monthData.put("activeDays", 0);
            trends.add(monthData);
        }
        return trends;
    }

    private List<Map<String, Object>> buildFallbackStreakHistory() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(29);

        List<Map<String, Object>> history = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date.format(formatter));
            entry.put("streak", 0);
            history.add(entry);
        }
        return history;
    }

    private List<Map<String, Object>> buildFallbackHeatmap(int weeks) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays((weeks * 7L) - 1);
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("EEE");

        List<Map<String, Object>> heatmap = new ArrayList<>(weeks * 7);
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            Map<String, Object> cell = new HashMap<>();
            cell.put("date", date.toString());
            cell.put("label", labelFormatter.format(date));
            cell.put("minutes", 0);
            cell.put("points", 0);
            cell.put("level", 0);
            heatmap.add(cell);
        }
        return heatmap;
    }
}
