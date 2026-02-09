package com.focusforge.service;

import com.focusforge.dto.ActivityRequest;
import com.focusforge.dto.ActivityResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

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

    @Transactional
    public ActivityResponse logActivity(ActivityRequest request, Long userId) {
        // Validate goal ownership
        Goal goal = goalRepository.findByIdAndUserId(request.getGoalId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found or access denied"));

        // Check for duplicate
        if (activityLogRepository.findByUserIdAndGoalIdAndLogDate(userId, request.getGoalId(), request.getLogDate())
                .isPresent()) {
            throw new BadRequestException("Activity already logged for this goal on this date");
        }

        // Validate date not in future
        if (request.getLogDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Cannot log future dates");
        }

        // Validate goal is active
        if (!goal.getIsActive()) {
            throw new BadRequestException("Cannot log activity for inactive goal");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
                request.getMinutesSpent(), streak.getCurrentStreak());

        boolean isSuspicious = !antiCheatService.validateActivity(userId, request.getMinutesSpent());

        // Evaluate badges after activity, points, and streak are updated
        try {
            List<com.focusforge.model.Badge> newlyEarnedBadges = badgeEvaluationService.evaluateAndAwardBadges(userId);
            if (!newlyEarnedBadges.isEmpty()) {
                log.info("User {} earned {} badge(s) from this activity", userId, newlyEarnedBadges.size());
                newlyEarnedBadges.forEach(badge -> log.debug("  - {}", badge.getName()));
            }
        } catch (Exception e) {
            log.error("Badge evaluation failed for user {}: {}", userId, e.getMessage(), e);
            // Don't fail activity logging if badge evaluation fails
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
                .build();
    }
}