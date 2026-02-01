package com.focusforge.service;

import com.focusforge.model.*;
import com.focusforge.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class GamificationService {

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private AntiCheatService antiCheatService;

    @Value("${gamification.daily-point-cap}")
    private int dailyPointCap;

    @Transactional
    public int calculateAndAwardPoints(User user, Goal goal, int minutesSpent, int streakCount) {
        // Validate against anti-cheat
        if (!antiCheatService.validateActivity(user.getId(), minutesSpent)) {
            antiCheatService.flagSuspiciousActivity(user, "EXCESSIVE_TIME", 
                    String.format("Minutes: %d", minutesSpent));
            // Cap the minutes for calculation
            minutesSpent = Math.min(minutesSpent, 480);
        }

        // Check daily cap
        LocalDate today = LocalDate.now();
        Integer pointsToday = pointLedgerRepository.getPointsForDate(user.getId(), today);
        int currentDailyTotal = pointsToday != null ? pointsToday : 0;

        if (currentDailyTotal >= dailyPointCap) {
            log.info("Daily cap reached for user {}", user.getId());
            return 0;
        }

        // Calculate points: base * difficulty * streak_multiplier
        double basePoints = Math.min(minutesSpent, goal.getDailyMinimumMinutes());
        double difficultyMultiplier = 1.0 + (goal.getDifficulty() - 1) * 0.25; // 1.0 to 2.0
        double streakMultiplier = Math.min(1.0 + (streakCount * 0.1), 2.0); // 1.0 to 2.0

        int calculatedPoints = (int) (basePoints * difficultyMultiplier * streakMultiplier);
        int remainingCap = dailyPointCap - currentDailyTotal;
        int finalPoints = Math.min(calculatedPoints, remainingCap);

        // Save to ledger
        PointLedger entry = new PointLedger();
        entry.setUser(user);
        entry.setGoal(goal);
        entry.setPoints(finalPoints);
        entry.setReason("ACTIVITY_COMPLETION");
        entry.setReferenceDate(today);
        pointLedgerRepository.save(entry);

        log.info("Awarded {} points to user {} for goal {}", finalPoints, user.getId(), goal.getId());

        // Check and award badges
        checkAndAwardBadges(user, goal, streakCount);

        return finalPoints;
    }

    @Transactional
    protected void checkAndAwardBadges(User user, Goal goal, int currentStreak) {
        // Check streak badges
        List<Badge> streakBadges = badgeRepository.findByCriteriaTypeAndThresholdLessThanEqual("STREAK", currentStreak);
        for (Badge badge : streakBadges) {
            if (!userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
                awardBadge(user, badge, goal);
            }
        }

        // Check points badges
        Integer totalPoints = pointLedgerRepository.getTotalPointsByUserId(user.getId());
        if (totalPoints != null && totalPoints > 0) {
            List<Badge> pointBadges = badgeRepository.findByCriteriaTypeAndThresholdLessThanEqual("POINTS", totalPoints);
            for (Badge badge : pointBadges) {
                if (!userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
                    awardBadge(user, badge, null);
                }
            }
        }
    }

    private void awardBadge(User user, Badge badge, Goal relatedGoal) {
        UserBadge assignment = new UserBadge();
        assignment.setUser(user);
        assignment.setBadge(badge);
        assignment.setRelatedGoal(relatedGoal);
        userBadgeRepository.save(assignment);

        // Award bonus points for badge
        if (badge.getPointsBonus() > 0) {
            PointLedger bonusEntry = new PointLedger();
            bonusEntry.setUser(user);
            bonusEntry.setPoints(badge.getPointsBonus());
            bonusEntry.setReason("BADGE_BONUS:" + badge.getName());
            bonusEntry.setReferenceDate(LocalDate.now());
            pointLedgerRepository.save(bonusEntry);
        }

        log.info("Awarded badge {} to user {}", badge.getName(), user.getId());
    }

    public Integer getTotalPoints(Long userId) {
        Integer total = pointLedgerRepository.getTotalPointsByUserId(userId);
        return total != null ? total : 0;
    }
}