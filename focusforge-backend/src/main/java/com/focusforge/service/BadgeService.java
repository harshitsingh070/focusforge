package com.focusforge.service;

import com.focusforge.model.Badge;
import com.focusforge.model.UserBadge;
import com.focusforge.repository.BadgeRepository;
import com.focusforge.repository.UserBadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private com.focusforge.repository.PointLedgerRepository pointLedgerRepository;

    @Autowired
    private com.focusforge.repository.StreakRepository streakRepository;

    @Autowired
    private com.focusforge.repository.ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getUserBadges(Long userId) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdOrderByAwardedAtDesc(userId);

        List<Map<String, Object>> badges = userBadges.stream()
                .map(ub -> {
                    Map<String, Object> badgeInfo = new HashMap<>();
                    badgeInfo.put("id", ub.getBadge().getId());
                    badgeInfo.put("name", ub.getBadge().getName());
                    badgeInfo.put("description", ub.getBadge().getDescription());
                    badgeInfo.put("iconUrl", ub.getBadge().getIconUrl());
                    badgeInfo.put("category", ub.getBadge().getCategory());
                    badgeInfo.put("earnedAt", ub.getAwardedAt());
                    badgeInfo.put("earnedReason", ub.getEarnedReason()); // NEW
                    return badgeInfo;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("badges", badges);
        response.put("totalCount", badges.size());
        return response;
    }

    /**
     * Get all badges with progress tracking for locked badges
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAllBadgesWithProgress(Long userId) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> earnedBadges = userBadgeRepository.findByUserId(userId);

        Set<Long> earnedBadgeIds = earnedBadges
                .stream()
                .map(ub -> ub.getBadge().getId())
                .collect(Collectors.toSet());

        Map<Long, UserBadge> earnedBadgeById = earnedBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub, (existing, ignored) -> existing));

        List<Map<String, Object>> badgesWithProgress = allBadges.stream()
                .map(badge -> {
                    Map<String, Object> badgeInfo = new HashMap<>();
                    badgeInfo.put("id", badge.getId());
                    badgeInfo.put("name", badge.getName());
                    badgeInfo.put("description", badge.getDescription());
                    badgeInfo.put("category", badge.getCategory());
                    badgeInfo.put("criteriaType", badge.getCriteriaType());
                    badgeInfo.put("threshold", badge.getThreshold());
                    badgeInfo.put("iconUrl", badge.getIconUrl());
                    badgeInfo.put("pointsBonus", badge.getPointsBonus());

                    boolean earned = earnedBadgeIds.contains(badge.getId());
                    badgeInfo.put("earned", earned);

                    if (!earned) {
                        // Calculate progress for locked badges
                        BadgeProgress progress = calculateProgress(badge, userId);
                        badgeInfo.put("currentValue", progress.getCurrentValue());
                        badgeInfo.put("requiredValue", badge.getThreshold());
                        badgeInfo.put("progressPercentage", progress.getPercentage());
                    } else {
                        // Get earned metadata
                        UserBadge userBadge = earnedBadgeById.get(badge.getId());

                        if (userBadge != null) {
                            badgeInfo.put("earnedAt", userBadge.getAwardedAt());
                            badgeInfo.put("earnedReason", userBadge.getEarnedReason());
                        }
                    }

                    return badgeInfo;
                })
                .collect(Collectors.toList());

        // Group by category
        Map<String, List<Map<String, Object>>> grouped = badgesWithProgress.stream()
                .collect(Collectors.groupingBy(b -> (String) b.getOrDefault("category", "Other")));

        Map<String, Object> response = new HashMap<>();
        response.put("badges", badgesWithProgress);
        response.put("badgesByCategory", grouped);
        response.put("totalBadges", allBadges.size());
        response.put("earnedCount", earnedBadges.size());

        return response;
    }

    /**
     * Calculate progress for a badge
     */
    private BadgeProgress calculateProgress(Badge badge, Long userId) {
        int currentValue = 0;

        switch (badge.getCriteriaType()) {
            case "POINTS":
                currentValue = Optional.ofNullable(pointLedgerRepository.getTotalPointsByUserId(userId)).orElse(0);
                break;
            case "STREAK":
                // Get max current streak
                currentValue = Optional.ofNullable(streakRepository.findMaxCurrentStreakByUserId(userId)).orElse(0);
                break;
            case "DAYS_ACTIVE":
                // Count distinct activity dates
                currentValue = Optional.ofNullable(activityLogRepository.countDistinctActiveDaysByUserId(userId))
                        .orElse(0L)
                        .intValue();
                break;
            case "CONSISTENCY":
                // Calculate longest consecutive streak
                currentValue = calculateLongestConsecutiveStreak(userId);
                break;
        }

        int percentage = badge.getThreshold() > 0
                ? Math.min(100, (int) ((currentValue * 100.0) / badge.getThreshold()))
                : 0;

        return new BadgeProgress(currentValue, percentage);
    }

    /**
     * Calculate longest consecutive streak for consistency badges
     */
    private int calculateLongestConsecutiveStreak(Long userId) {
        List<LocalDate> activeDates = activityLogRepository.findDistinctLogDatesByUserIdOrderByLogDate(userId);

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
     * Helper class for badge progress
     */
    private static class BadgeProgress {
        private final int currentValue;
        private final int percentage;

        public BadgeProgress(int currentValue, int percentage) {
            this.currentValue = currentValue;
            this.percentage = percentage;
        }

        public int getCurrentValue() {
            return currentValue;
        }

        public int getPercentage() {
            return percentage;
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAllBadges() {
        List<Badge> allBadges = badgeRepository.findAll();

        List<Map<String, Object>> badges = allBadges.stream()
                .map(badge -> {
                    Map<String, Object> badgeInfo = new HashMap<>();
                    badgeInfo.put("id", badge.getId());
                    badgeInfo.put("name", badge.getName());
                    badgeInfo.put("description", badge.getDescription());
                    badgeInfo.put("iconUrl", badge.getIconUrl());
                    badgeInfo.put("category", badge.getCategory());
                    badgeInfo.put("criteriaType", badge.getCriteriaType());
                    badgeInfo.put("threshold", badge.getThreshold());
                    return badgeInfo;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("badges", badges);
        return response;
    }
}
