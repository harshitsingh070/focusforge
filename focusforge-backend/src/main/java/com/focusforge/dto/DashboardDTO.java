package com.focusforge.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardDTO {
    private Long userId;
    private String username;
    private Integer totalPoints;
    private Integer globalStreak;
    private List<GoalProgressDTO> activeGoals;
    private List<RecentActivityDTO> recentActivities;
    private List<BadgeDTO> recentBadges;
    private Map<String, Integer> weeklyProgress;
    private boolean underReview;
    private String insight;

    @Data
    @Builder
    public static class GoalProgressDTO {
        private Long goalId;
        private String title;
        private String category;
        private String categoryColor;
        private Integer currentStreak;
        private Integer longestStreak;
        private Integer dailyTarget;
        private Integer todayProgress;
        private boolean completedToday;
        private boolean atRisk;
    }

    @Data
    @Builder
    public static class RecentActivityDTO {
        private Long id;
        private String goalTitle;
        private String categoryColor;
        private Integer minutes;
        private String date;
        private Integer points;
    }

    @Data
    @Builder
    public static class BadgeDTO {
        private String name;
        private String description;
        private String iconUrl;
        private String awardedAt;
    }
}