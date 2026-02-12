package com.focusforge.service;

import com.focusforge.model.ActivityLog;
import com.focusforge.model.Goal;
import com.focusforge.model.PointLedger;
import com.focusforge.model.User;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.PointLedgerRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GamificationService {

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Value("${gamification.daily-point-cap:100}")
    private int dailyPointCap;

    @Value("${gamification.base-points:10}")
    private int basePoints;

    @Value("${gamification.time-bonus-threshold-minutes:20}")
    private int timeBonusThresholdMinutes;

    @Value("${gamification.time-bonus-step-minutes:10}")
    private int timeBonusStepMinutes;

    @Value("${gamification.weekly-consistency-min-days:5}")
    private int weeklyConsistencyMinDays;

    @Value("${gamification.weekly-consistency-bonus:50}")
    private int weeklyConsistencyBonusPoints;

    @Transactional
    public int calculateAndAwardPoints(User user, Goal goal, int minutesSpent, int streakCount, LocalDate activityDate) {
        Integer activityPointsToday = pointLedgerRepository.getActivityPointsForDate(user.getId(), activityDate);
        int currentDailyTotal = activityPointsToday != null ? activityPointsToday : 0;

        int difficultyPoints = (int) Math.round(basePoints * getDifficultyMultiplier(goal.getDifficulty()));
        int extraMinutes = Math.max(0, minutesSpent - timeBonusThresholdMinutes);
        int timeBonus = timeBonusStepMinutes > 0 ? (extraMinutes / timeBonusStepMinutes) : 0;
        int streakBonus = Math.min(Math.max(streakCount, 0), 21) * 2;
        int dailyPoints = difficultyPoints + timeBonus + streakBonus;

        double diminishingMultiplier = getDiminishingMultiplier(user.getId(), goal.getId(), minutesSpent, activityDate);
        int adjustedPoints = (int) Math.floor(dailyPoints * diminishingMultiplier);

        int remainingCap = Math.max(0, dailyPointCap - currentDailyTotal);
        int activityPointsAwarded = Math.min(adjustedPoints, remainingCap);

        if (activityPointsAwarded > 0) {
            PointLedger entry = new PointLedger();
            entry.setUser(user);
            entry.setGoal(goal);
            entry.setPoints(activityPointsAwarded);
            entry.setReason("ACTIVITY_COMPLETION");
            entry.setReferenceDate(activityDate);
            pointLedgerRepository.save(entry);
        } else {
            log.info("No activity points awarded due to daily cap. userId={}, date={}", user.getId(), activityDate);
        }

        int weeklyBonus = awardWeeklyConsistencyBonusIfEligible(user, activityDate);
        int totalAwarded = activityPointsAwarded + weeklyBonus;

        log.info("Points awarded userId={}, goalId={}, date={}, activityPoints={}, weeklyBonus={}, total={}",
                user.getId(), goal.getId(), activityDate, activityPointsAwarded, weeklyBonus, totalAwarded);

        return totalAwarded;
    }

    public Integer getTotalPoints(Long userId) {
        Integer total = pointLedgerRepository.getTotalPointsByUserId(userId);
        return total != null ? total : 0;
    }

    private double getDifficultyMultiplier(Integer difficultyLevel) {
        int difficulty = difficultyLevel != null ? difficultyLevel : 1;

        if (difficulty <= 2) {
            return 1.0;
        }
        if (difficulty <= 4) {
            return 1.5;
        }
        return 2.0;
    }

    private double getDiminishingMultiplier(Long userId, Long goalId, int currentMinutes, LocalDate activityDate) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdAndGoalIdOrderByLogDateDesc(userId, goalId);
        if (logs.isEmpty()) {
            return 1.0;
        }

        Map<LocalDate, Integer> minutesByDate = logs.stream()
                .filter(log -> log.getLogDate() != null && log.getMinutesSpent() != null)
                .collect(Collectors.toMap(
                        ActivityLog::getLogDate,
                        ActivityLog::getMinutesSpent,
                        (existing, replacement) -> replacement));

        int consecutiveSimilarDays = 0;
        LocalDate cursor = activityDate;
        while (true) {
            Integer minutes = minutesByDate.get(cursor);
            if (minutes == null || !isSimilarDuration(minutes, currentMinutes)) {
                break;
            }

            consecutiveSimilarDays++;
            cursor = cursor.minusDays(1);
        }

        return consecutiveSimilarDays >= 4 ? 0.8 : 1.0;
    }

    private boolean isSimilarDuration(int minutesA, int minutesB) {
        return Math.abs(minutesA - minutesB) <= 10;
    }

    private int awardWeeklyConsistencyBonusIfEligible(User user, LocalDate activityDate) {
        LocalDate weekStart = activityDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        long activeDays = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), weekStart, weekEnd)
                .stream()
                .map(ActivityLog::getLogDate)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();

        if (activeDays < weeklyConsistencyMinDays) {
            return 0;
        }

        String weeklyBonusReason = "WEEKLY_CONSISTENCY_BONUS:" + weekStart;
        if (pointLedgerRepository.existsByUserIdAndReason(user.getId(), weeklyBonusReason)) {
            return 0;
        }

        PointLedger weeklyBonus = new PointLedger();
        weeklyBonus.setUser(user);
        weeklyBonus.setGoal(null);
        weeklyBonus.setPoints(weeklyConsistencyBonusPoints);
        weeklyBonus.setReason(weeklyBonusReason);
        weeklyBonus.setReferenceDate(activityDate);
        pointLedgerRepository.save(weeklyBonus);

        log.info("Awarded weekly consistency bonus. userId={}, weekStart={}, bonus={}",
                user.getId(), weekStart, weeklyConsistencyBonusPoints);

        return weeklyConsistencyBonusPoints;
    }
}
