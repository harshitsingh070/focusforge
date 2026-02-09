package com.focusforge.service;

import com.focusforge.model.Goal;
import com.focusforge.model.PointLedger;
import com.focusforge.model.User;
import com.focusforge.repository.PointLedgerRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Slf4j
public class GamificationService {

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

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

        return finalPoints;
    }

    public Integer getTotalPoints(Long userId) {
        Integer total = pointLedgerRepository.getTotalPointsByUserId(userId);
        return total != null ? total : 0;
    }
}
