package com.focusforge.service;

import com.focusforge.dto.ActivityRequest;
import com.focusforge.dto.ActivityResponse;
import com.focusforge.dto.BadgeAwardDTO;
import com.focusforge.event.ActivityLoggedEvent;
import com.focusforge.exception.BadRequestException;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.model.ActivityLog;
import com.focusforge.model.Goal;
import com.focusforge.model.Streak;
import com.focusforge.model.User;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.GoalRepository;
import com.focusforge.repository.StreakRepository;
import com.focusforge.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ActivityService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private StreakService streakService;

    @Autowired
    private GamificationService gamificationService;

    @Autowired
    private AntiCheatService antiCheatService;

    @Autowired
    private LeaderboardAggregationService leaderboardAggregationService;

    @Autowired
    private BadgeEvaluationService badgeEvaluationService;

    @Autowired
    private AnalyticsAggregationService analyticsAggregationService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Value("${activity.max-past-days:30}")
    private int maxPastDays;

    @Transactional
    public ActivityResponse logActivity(ActivityRequest request, Long userId) {
        // Validate goal ownership
        Goal goal = goalRepository.findByIdAndUserId(request.getGoalId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found or access denied"));

        validateActivityRequest(request, goal, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!antiCheatService.validateActivity(userId, request.getMinutesSpent(), request.getLogDate())) {
            antiCheatService.flagSuspiciousActivity(
                    user,
                    "INVALID_ACTIVITY",
                    String.format("Rejected activity for goalId=%d minutes=%d date=%s",
                            request.getGoalId(), request.getMinutesSpent(), request.getLogDate()),
                    "high");
            throw new BadRequestException("Activity failed validation checks");
        }

        boolean duplicatePatternSuspicious = antiCheatService.detectDuplicatePattern(
                userId,
                request.getGoalId(),
                request.getMinutesSpent(),
                request.getLogDate());
        if (duplicatePatternSuspicious) {
            antiCheatService.flagSuspiciousActivity(
                    user,
                    "REPEATED_PATTERN",
                    String.format("Repeated minutes=%d on goalId=%d", request.getMinutesSpent(), request.getGoalId()),
                    "medium");
        }

        // Save activity
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(user);
        activityLog.setGoal(goal);
        activityLog.setLogDate(request.getLogDate());
        activityLog.setMinutesSpent(request.getMinutesSpent());
        activityLog.setNotes(request.getNotes());
        activityLogRepository.save(activityLog);

        // Update streak
        Streak streak = streakService.updateStreak(goal, request.getLogDate());

        // Calculate points
        int points = gamificationService.calculateAndAwardPoints(user, goal,
                request.getMinutesSpent(), streak.getCurrentStreak(), request.getLogDate());

        boolean isSuspicious = duplicatePatternSuspicious
                || antiCheatService.isSuspiciousEntry(userId, request.getMinutesSpent(), request.getLogDate());

        // Evaluate badges after activity, points, and streak are updated
        List<BadgeAwardDTO> newlyEarnedBadges = Collections.emptyList();
        try {
            List<BadgeEvaluationService.BadgeAward> awardedBadges = badgeEvaluationService
                    .evaluateAndAwardBadgesDetailed(userId);

            if (!awardedBadges.isEmpty()) {
                log.info("User {} earned {} badge(s) from this activity", userId, awardedBadges.size());
                awardedBadges.forEach(award -> log.debug("  - {}", award.getBadge().getName()));
            }

            newlyEarnedBadges = awardedBadges.stream()
                    .map(award -> BadgeAwardDTO.builder()
                            .id(award.getBadge().getId())
                            .name(award.getBadge().getName())
                            .description(award.getBadge().getDescription())
                            .iconUrl(award.getBadge().getIconUrl())
                            .earnedReason(award.getReason())
                            .pointsBonus(award.getBadge().getPointsBonus())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Badge evaluation failed for user {}: {}", userId, e.getMessage(), e);
            // Don't fail activity logging if badge evaluation fails
        }

        try {
            analyticsAggregationService.updateAfterActivity(userId, request.getLogDate());
        } catch (Exception e) {
            log.error("Analytics aggregation failed for user {}: {}", userId, e.getMessage(), e);
        }

        try {
            if (notificationService != null) {
                notificationService.autoGenerateNotifications(userId);
            }
        } catch (Exception e) {
            log.error("Notification generation failed for user {}: {}", userId, e.getMessage(), e);
        }

        try {
            String categoryName = goal.getCategory() != null ? goal.getCategory().getName() : null;
            eventPublisher.publishEvent(new ActivityLoggedEvent(categoryName, request.getLogDate()));
        } catch (Exception e) {
            log.error("Leaderboard refresh event publish failed for user {}: {}", userId, e.getMessage(), e);
        }

        return ActivityResponse.builder()
                .id(activityLog.getId())
                .goalId(goal.getId())
                .goalTitle(goal.getTitle())
                .logDate(request.getLogDate())
                .minutesSpent(request.getMinutesSpent())
                .pointsEarned(points)
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .totalPoints(gamificationService.getTotalPoints(userId))
                .notes(request.getNotes())
                .suspicious(isSuspicious)
                .message(isSuspicious ? "Activity logged but flagged for review" : "Activity logged successfully")
                .newlyEarnedBadges(newlyEarnedBadges)
                .build();
    }

    private void validateActivityRequest(ActivityRequest request, Goal goal, Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate earliestAllowedDate = today.minusDays(Math.max(0, maxPastDays));

        if (request.getLogDate().isAfter(today)) {
            throw new BadRequestException("Cannot log activity in the future");
        }

        if (request.getLogDate().isBefore(earliestAllowedDate)) {
            throw new BadRequestException("Activity date is too far in the past");
        }

        if (request.getMinutesSpent() == null || request.getMinutesSpent() < 10 || request.getMinutesSpent() > 600) {
            throw new BadRequestException("Minutes spent must be between 10 and 600");
        }

        if (goal.getStartDate() != null && request.getLogDate().isBefore(goal.getStartDate())) {
            throw new BadRequestException("Activity date cannot be before goal start date");
        }

        if (goal.getEndDate() != null && request.getLogDate().isAfter(goal.getEndDate())) {
            throw new BadRequestException("Activity date cannot be after goal end date");
        }

        if (!Boolean.TRUE.equals(goal.getIsActive())) {
            throw new BadRequestException("Cannot log activity for inactive goal");
        }

        if (activityLogRepository.findByUserIdAndGoalIdAndLogDate(userId, request.getGoalId(), request.getLogDate())
                .isPresent()) {
            throw new BadRequestException("Activity already logged for this goal on this date");
        }
    }
}
