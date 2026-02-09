package com.focusforge.service;

import com.focusforge.model.*;
import com.focusforge.repository.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Centralized service for badge evaluation and awarding.
 * This is the ONLY place where badges should be evaluated and awarded.
 * 
 * Called after:
 * - Activity logging
 * - Points awarding
 * - Streak updates
 */
@Service
@Slf4j
public class BadgeEvaluationService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Evaluate all badges for a user and award any newly earned ones.
     * Returns list of newly earned badges (for notification purposes).
     */
    @Transactional
    public List<Badge> evaluateAndAwardBadges(Long userId) {
        log.debug("Evaluating badges for user: {}", userId);

        List<Badge> newlyEarnedBadges = new ArrayList<>();
        BadgeMetrics metrics = loadBadgeMetrics(userId);

        // Get all badges user doesn't have yet
        List<Badge> allBadges = badgeRepository.findAll();
        Set<Long> earnedBadgeIds = userBadgeRepository.findByUserId(userId)
                .stream()
                .map(ub -> ub.getBadge().getId())
                .collect(Collectors.toSet());

        List<Badge> unearnedBadges = allBadges.stream()
                .filter(b -> !earnedBadgeIds.contains(b.getId()))
                .collect(Collectors.toList());

        log.debug("User {} has {} unearned badges to evaluate", userId, unearnedBadges.size());

        // Evaluate each unearned badge
        for (Badge badge : unearnedBadges) {
            BadgeEvaluationResult result = evaluateBadge(badge, metrics);

            if (result.isEarned()) {
                awardBadge(userId, badge, result.getReason(), result.getRelatedGoalId());
                newlyEarnedBadges.add(badge);
                log.info("Badge earned: {} by user {}, reason: {}", badge.getName(), userId, result.getReason());
            }
        }

        if (!newlyEarnedBadges.isEmpty()) {
            log.info("User {} earned {} new badge(s)", userId, newlyEarnedBadges.size());
        }

        return newlyEarnedBadges;
    }

    /**
     * Backfill badges for all users.
     * Evaluates all existing users against all badges and awards any they qualify
     * for.
     * Used when new badges are added to the system.
     * 
     * @return Map of userId to list of newly earned badges
     */
    @Transactional
    public Map<Long, List<Badge>> backfillAllUserBadges() {
        log.info("Starting badge backfill for all users...");

        List<User> allUsers = userRepository.findAll();
        Map<Long, List<Badge>> userBadgesMap = new HashMap<>();

        int totalBadgesAwarded = 0;

        for (User user : allUsers) {
            try {
                List<Badge> newBadges = evaluateAndAwardBadges(user.getId());
                if (!newBadges.isEmpty()) {
                    userBadgesMap.put(user.getId(), newBadges);
                    totalBadgesAwarded += newBadges.size();
                }
            } catch (Exception e) {
                log.error("Failed to evaluate badges for user {}: {}", user.getId(), e.getMessage());
            }
        }

        log.info("Badge backfill complete: {} badges awarded to {} users",
                totalBadgesAwarded, userBadgesMap.size());

        return userBadgesMap;
    }

    /**
     * Evaluate a single badge for a user.
     */
    private BadgeEvaluationResult evaluateBadge(Badge badge, BadgeMetrics metrics) {
        switch (badge.getCriteriaType()) {
            case "POINTS":
                return evaluatePointsBadge(badge, metrics);
            case "STREAK":
                return evaluateStreakBadge(badge, metrics);
            case "DAYS_ACTIVE":
                return evaluateDaysActiveBadge(badge, metrics);
            case "CONSISTENCY":
                return evaluateConsistencyBadge(badge, metrics);
            default:
                log.warn("Unknown criteria type: {} for badge: {}", badge.getCriteriaType(), badge.getName());
                return BadgeEvaluationResult.notEarned();
        }
    }

    /**
     * Evaluate POINTS-based badges (e.g., "Century Club" - 100 points)
     */
    private BadgeEvaluationResult evaluatePointsBadge(Badge badge, BadgeMetrics metrics) {
        int totalPoints = metrics.getTotalPoints();

        if (totalPoints >= badge.getThreshold()) {
            String reason = String.format("Reached %d total points", totalPoints);
            return BadgeEvaluationResult.earned(reason, null);
        }

        return BadgeEvaluationResult.notEarned();
    }

    /**
     * Evaluate STREAK-based badges (e.g., "Week Warrior" - 7 day streak)
     */
    private BadgeEvaluationResult evaluateStreakBadge(Badge badge, BadgeMetrics metrics) {
        List<Streak> streaks = metrics.getUserStreaks();

        if ("PER_GOAL".equals(badge.getEvaluationScope())) {
            // Check if ANY goal has streak >= threshold
            Optional<Streak> bestStreak = streaks.stream()
                    .filter(s -> s.getCurrentStreak() != null && s.getCurrentStreak() >= badge.getThreshold())
                    .max(Comparator.comparingInt(Streak::getCurrentStreak));

            if (bestStreak.isPresent()) {
                Streak streak = bestStreak.get();
                String goalTitle = streak.getGoal().getTitle();
                String reason = String.format("Maintained %d-day streak on %s goal",
                        streak.getCurrentStreak(), goalTitle);
                return BadgeEvaluationResult.earned(reason, streak.getGoal().getId());
            }
        } else {
            // GLOBAL - any streak across all goals
            int maxStreak = streaks.stream()
                    .map(Streak::getCurrentStreak)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0);

            if (maxStreak >= badge.getThreshold()) {
                String reason = String.format("Achieved %d-day streak", maxStreak);
                return BadgeEvaluationResult.earned(reason, null);
            }
        }

        return BadgeEvaluationResult.notEarned();
    }

    /**
     * Evaluate DAYS_ACTIVE badges (e.g., "30 Day Challenge" - active for 30 days)
     */
    private BadgeEvaluationResult evaluateDaysActiveBadge(Badge badge, BadgeMetrics metrics) {
        long distinctDays = metrics.getDistinctDays();

        if (distinctDays >= badge.getThreshold()) {
            String reason = String.format("Logged activity on %d different days", distinctDays);
            return BadgeEvaluationResult.earned(reason, null);
        }

        return BadgeEvaluationResult.notEarned();
    }

    /**
     * Evaluate CONSISTENCY badges (e.g., "Consistency King" - 30 consecutive days
     * with activity)
     */
    private BadgeEvaluationResult evaluateConsistencyBadge(Badge badge, BadgeMetrics metrics) {
        int longestConsecutiveStreak = metrics.getLongestConsecutiveStreak();
        if (longestConsecutiveStreak <= 0) {
            return BadgeEvaluationResult.notEarned();
        }

        if (longestConsecutiveStreak >= badge.getThreshold()) {
            String reason = String.format("Logged activity for %d consecutive days", longestConsecutiveStreak);
            return BadgeEvaluationResult.earned(reason, null);
        }

        return BadgeEvaluationResult.notEarned();
    }

    private BadgeMetrics loadBadgeMetrics(Long userId) {
        int totalPoints = Optional.ofNullable(pointLedgerRepository.getTotalPointsByUserId(userId)).orElse(0);
        List<Streak> userStreaks = streakRepository.findByGoalUserIdOrderByCurrentStreakDesc(userId);
        List<LocalDate> activeDates = activityLogRepository.findDistinctLogDatesByUserIdOrderByLogDate(userId);
        long distinctDays = activeDates.size();
        int longestConsecutiveStreak = calculateLongestConsecutiveStreak(activeDates);

        return new BadgeMetrics(totalPoints, userStreaks, distinctDays, longestConsecutiveStreak);
    }

    private int calculateLongestConsecutiveStreak(List<LocalDate> activeDates) {
        if (activeDates.isEmpty()) {
            return 0;
        }

        int longestStreak = 0;
        int currentStreak = 1;

        for (int i = 1; i < activeDates.size(); i++) {
            if (activeDates.get(i - 1).plusDays(1).equals(activeDates.get(i))) {
                currentStreak++;
            } else {
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1;
            }
        }

        return Math.max(longestStreak, currentStreak);
    }

    /**
     * Award a badge to a user.
     */
    private void awardBadge(Long userId, Badge badge, String reason, Long relatedGoalId) {
        if (userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        UserBadge userBadge = new UserBadge();
        userBadge.setUser(user);
        userBadge.setBadge(badge);
        userBadge.setEarnedReason(reason);

        if (relatedGoalId != null) {
            goalRepository.findById(relatedGoalId).ifPresent(userBadge::setRelatedGoal);
        }

        userBadgeRepository.save(userBadge);

        // Award bonus points if specified
        if (badge.getPointsBonus() != null && badge.getPointsBonus() > 0) {
            PointLedger bonusPoints = new PointLedger();
            bonusPoints.setUser(user);
            bonusPoints.setPoints(badge.getPointsBonus());
            bonusPoints.setReason("Badge bonus: " + badge.getName());
            bonusPoints.setReferenceDate(LocalDate.now());
            pointLedgerRepository.save(bonusPoints);

            log.debug("Awarded {} bonus points for badge: {}", badge.getPointsBonus(), badge.getName());
        }
    }

    @Data
    @AllArgsConstructor
    private static class BadgeMetrics {
        private int totalPoints;
        private List<Streak> userStreaks;
        private long distinctDays;
        private int longestConsecutiveStreak;
    }

    /**
     * Helper class to store badge evaluation results.
     */
    @Data
    @AllArgsConstructor
    public static class BadgeEvaluationResult {
        private boolean earned;
        private String reason;
        private Long relatedGoalId;

        public static BadgeEvaluationResult earned(String reason, Long relatedGoalId) {
            return new BadgeEvaluationResult(true, reason, relatedGoalId);
        }

        public static BadgeEvaluationResult notEarned() {
            return new BadgeEvaluationResult(false, null, null);
        }
    }
}
