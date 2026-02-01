package com.focusforge.service;

import com.focusforge.dto.DashboardDTO;
import com.focusforge.model.*;
import com.focusforge.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DashboardService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private AntiCheatService antiCheatService;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardDTO getDashboard(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate global streak (consecutive days with any activity)
        int globalStreak = calculateGlobalStreak(userId);
        
        // Build response
        DashboardDTO.DashboardDTOBuilder builder = DashboardDTO.builder();
        builder.userId(userId);
        builder.username(user.getUsername());
        builder.totalPoints(gamificationService.getTotalPoints(userId));
        builder.globalStreak(globalStreak);
        builder.underReview(antiCheatService.isUserUnderReview(userId));

        // Active goals with progress
        List<Goal> goals = goalRepository.findActiveGoalsForUser(userId, LocalDate.now());
        List<DashboardDTO.GoalProgressDTO> goalProgress = goals.stream().map(goal -> {
            Streak streak = streakRepository.findByGoalId(goal.getId()).orElse(null);
            int currentStreak = streak != null ? streak.getCurrentStreak() : 0;
            
            // Check today's progress
            Integer todayMinutes = activityLogRepository.getTotalMinutesForDate(userId, LocalDate.now());
            int todayProgress = todayMinutes != null ? todayMinutes : 0;
            
            // Check if completed today
            boolean completedToday = activityLogRepository.findByUserIdAndGoalIdAndLogDate(
                    userId, goal.getId(), LocalDate.now()).isPresent();
            
            // Check if at risk (streak > 0 but no activity yesterday)
            boolean atRisk = false;
            if (streak != null && streak.getCurrentStreak() > 0 && !completedToday) {
                if (streak.getLastActivityDate() != null) {
                    long daysSince = ChronoUnit.DAYS.between(streak.getLastActivityDate(), LocalDate.now());
                    atRisk = daysSince >= 1;
                }
            }

            return DashboardDTO.GoalProgressDTO.builder()
                    .goalId(goal.getId())
                    .title(goal.getTitle())
                    .category(goal.getCategory().getName())
                    .categoryColor(goal.getCategory().getColorCode())
                    .currentStreak(currentStreak)
                    .longestStreak(streak != null ? streak.getLongestStreak() : 0)
                    .dailyTarget(goal.getDailyMinimumMinutes())
                    .todayProgress(todayProgress)
                    .completedToday(completedToday)
                    .atRisk(atRisk)
                    .build();
        }).collect(Collectors.toList());
        
        builder.activeGoals(goalProgress);

        // Recent activities (last 5)
        List<ActivityLog> recentLogs = activityLogRepository.findRecentByUserId(userId, PageRequest.of(0, 5));
        List<DashboardDTO.RecentActivityDTO> recentActivities = recentLogs.stream()
                .map(log -> DashboardDTO.RecentActivityDTO.builder()
                        .id(log.getId())
                        .goalTitle(log.getGoal().getTitle())
                        .categoryColor(log.getGoal().getCategory().getColorCode())
                        .minutes(log.getMinutesSpent())
                        .date(log.getLogDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .build())
                .collect(Collectors.toList());
        builder.recentActivities(recentActivities);

        // Recent badges (last 3)
        List<UserBadge> recentBadges = userBadgeRepository.findByUserIdOrderByAwardedAtDesc(userId).stream()
                .limit(3).collect(Collectors.toList());
        List<DashboardDTO.BadgeDTO> badgeDTOs = recentBadges.stream()
                .map(ub -> DashboardDTO.BadgeDTO.builder()
                        .name(ub.getBadge().getName())
                        .description(ub.getBadge().getDescription())
                        .iconUrl(ub.getBadge().getIconUrl())
                        .awardedAt(ub.getAwardedAt() != null ? 
                                ub.getAwardedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null)
                        .build())
                .collect(Collectors.toList());
        builder.recentBadges(badgeDTOs);

        // Weekly progress
        Map<String, Integer> weeklyProgress = getWeeklyProgress(userId);
        builder.weeklyProgress(weeklyProgress);

        // Generate insight
        String insight = generateInsight(goalProgress, weeklyProgress);
        builder.insight(insight);

        return builder.build();
    }

    private int calculateGlobalStreak(Long userId) {
        // Find consecutive days with any activity
        LocalDate today = LocalDate.now();
        int streak = 0;
        
        for (int i = 0; i < 365; i++) {
            LocalDate date = today.minus(i, ChronoUnit.DAYS);
            Integer minutes = activityLogRepository.getTotalMinutesForDate(userId, date);
            if (minutes != null && minutes > 0) {
                streak++;
            } else {
                if (i == 0) continue; // Allow today to be empty
                break;
            }
        }
        return streak;
    }

    private Map<String, Integer> getWeeklyProgress(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minus(6, ChronoUnit.DAYS);
        List<Object[]> dailyTotals = activityLogRepository.getDailyTotals(userId, weekAgo, today);
        
        Map<String, Integer> weeklyMap = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE");
        
        // Initialize with 0
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minus(i, ChronoUnit.DAYS);
            weeklyMap.put(date.format(formatter), 0);
        }
        
        // Fill actual data
        for (Object[] row : dailyTotals) {
            LocalDate date = (LocalDate) row[0];
            Long total = (Long) row[1];
            weeklyMap.put(date.format(formatter), total.intValue());
        }
        
        return weeklyMap;
    }

    private String generateInsight(List<DashboardDTO.GoalProgressDTO> goals, Map<String, Integer> weekly) {
        long completedToday = goals.stream().filter(DashboardDTO.GoalProgressDTO::isCompletedToday).count();
        long atRisk = goals.stream().filter(DashboardDTO.GoalProgressDTO::isAtRisk).count();
        
        if (completedToday == goals.size() && goals.size() > 0) {
            return "Perfect day! All goals completed. 🔥";
        } else if (atRisk > 0) {
            return String.format("%d goal(s) at risk of losing streak!", atRisk);
        } else if (completedToday > 0) {
            return "Good progress! Keep the momentum going.";
        } else {
            return "Start your day by logging your first activity.";
        }
    }

    @Autowired
    private GamificationService gamificationService;
}