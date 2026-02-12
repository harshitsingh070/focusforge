package com.focusforge.service;

import com.focusforge.model.ActivityLog;
import com.focusforge.model.DailyUserSummary;
import com.focusforge.model.User;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.DailyUserSummaryRepository;
import com.focusforge.repository.PointLedgerRepository;
import com.focusforge.repository.StreakRepository;
import com.focusforge.repository.UserRepository;
import com.focusforge.repository.WeeklyCategorySummaryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AnalyticsAggregationService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private DailyUserSummaryRepository dailyUserSummaryRepository;

    @Autowired
    private WeeklyCategorySummaryRepository weeklyCategorySummaryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrustScoreService trustScoreService;

    @Autowired
    @Lazy
    private AnalyticsAggregationService analyticsAggregationServiceProxy;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateAfterActivity(Long userId, LocalDate logDate) {
        recomputeDailySummary(userId, logDate);
        recomputeWeeklyCategorySummary(userId, logDate);
    }

    @Transactional
    public void recomputeDailySummary(Long userId, LocalDate summaryDate) {
        List<ActivityLog> dayLogs = activityLogRepository.findByUserIdAndLogDate(userId, summaryDate);

        int totalMinutes = dayLogs.stream().mapToInt(log -> safeInt(log.getMinutesSpent())).sum();
        int activitiesCount = dayLogs.size();
        int activeGoals = (int) dayLogs.stream()
                .map(ActivityLog::getGoal)
                .filter(g -> g != null && g.getId() != null)
                .map(g -> g.getId())
                .distinct()
                .count();

        int totalPoints = Optional.ofNullable(pointLedgerRepository.getPointsForDate(userId, summaryDate)).orElse(0);
        int maxStreak = Optional.ofNullable(streakRepository.findMaxCurrentStreakByUserId(userId)).orElse(0);
        int trustScore = trustScoreService.getTrustScore(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        DailyUserSummary summary = dailyUserSummaryRepository.findByUserIdAndSummaryDate(userId, summaryDate)
                .orElseGet(DailyUserSummary::new);
        summary.setUser(user);
        summary.setSummaryDate(summaryDate);
        summary.setTotalMinutes(totalMinutes);
        summary.setTotalPoints(totalPoints);
        summary.setActivitiesCount(activitiesCount);
        summary.setActiveGoals(activeGoals);
        summary.setActiveFlag(activitiesCount > 0);
        summary.setMaxStreakSnapshot(maxStreak);
        summary.setTrustScoreSnapshot(trustScore);

        dailyUserSummaryRepository.save(summary);
    }

    @Transactional
    public void recomputeWeeklyCategorySummary(Long userId, LocalDate referenceDate) {
        LocalDate weekStart = referenceDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        List<ActivityLog> weekLogs = activityLogRepository.findByUserIdAndLogDateBetween(userId, weekStart, weekEnd);
        Map<String, List<ActivityLog>> logsByCategory = weekLogs.stream()
                .filter(log -> log.getGoal() != null && log.getGoal().getCategory() != null)
                .collect(Collectors.groupingBy(log -> log.getGoal().getCategory().getName()));

        if (logsByCategory.isEmpty()) {
            weeklyCategorySummaryRepository.deleteByUserIdAndWeekStart(userId, weekStart);
            return;
        }

        for (Map.Entry<String, List<ActivityLog>> entry : logsByCategory.entrySet()) {
            String categoryName = entry.getKey();
            List<ActivityLog> categoryLogs = entry.getValue();

            int totalMinutes = categoryLogs.stream().mapToInt(log -> safeInt(log.getMinutesSpent())).sum();
            int activitiesCount = categoryLogs.size();
            int activeDays = (int) categoryLogs.stream().map(ActivityLog::getLogDate).distinct().count();
            int totalPoints = Optional.ofNullable(pointLedgerRepository.getPointsForUserCategoryAndDateRange(
                    userId,
                    categoryName,
                    weekStart,
                    weekEnd)).orElse(0);
            weeklyCategorySummaryRepository.upsertSummary(
                    userId,
                    weekStart,
                    weekEnd,
                    categoryName,
                    totalMinutes,
                    totalPoints,
                    activeDays,
                    activitiesCount);
        }

        weeklyCategorySummaryRepository.deleteByUserIdAndWeekStartAndCategoryNameNotIn(
                userId,
                weekStart,
                logsByCategory.keySet().stream().toList());
    }

    @Transactional
    public void rebuildUserSummaries(Long userId, int daysBack) {
        LocalDate today = LocalDate.now();
        for (int offset = daysBack; offset >= 0; offset--) {
            LocalDate date = today.minusDays(offset);
            recomputeDailySummary(userId, date);
        }

        Set<LocalDate> weeks = java.util.stream.IntStream.rangeClosed(0, Math.max(0, daysBack))
                .mapToObj(offset -> today.minusDays(offset).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)))
                .collect(Collectors.toSet());
        for (LocalDate weekStart : weeks) {
            recomputeWeeklyCategorySummary(userId, weekStart);
        }
    }

    @Scheduled(cron = "0 15 * * * *")
    public void scheduledAggregation() {
        LocalDate today = LocalDate.now();
        List<User> users = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .toList();

        for (User user : users) {
            try {
                analyticsAggregationServiceProxy.updateAfterActivity(user.getId(), today);
            } catch (Exception ex) {
                log.error("Failed to aggregate analytics for user {}: {}", user.getId(), ex.getMessage(), ex);
            }
        }
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

}
