package com.focusforge.service;

import com.focusforge.model.Goal;
import com.focusforge.model.Streak;
import com.focusforge.repository.StreakRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@Slf4j
public class StreakService {

    @Autowired
    private StreakRepository streakRepository;

    @Transactional
    public Streak updateStreak(Goal goal, LocalDate activityDate) {
        Streak streak = streakRepository.findByGoalId(goal.getId())
                .orElseGet(() -> createNewStreak(goal));

        LocalDate lastDate = streak.getLastActivityDate();

        if (lastDate == null) {
            streak.incrementStreak();
            log.debug("Started new streak for goal {}", goal.getId());
        } else {
            long daysBetween = ChronoUnit.DAYS.between(lastDate, activityDate);
            
            if (daysBetween == 0) {
                // Same day, don't update streak but update last activity
                log.debug("Same day activity for goal {}", goal.getId());
                return streak;
            } else if (daysBetween == 1) {
                // Consecutive day
                streak.incrementStreak();
                log.debug("Streak incremented for goal {}: {}", goal.getId(), streak.getCurrentStreak());
            } else {
                // Streak broken
                streak.resetStreak();
                streak.incrementStreak();
                log.debug("Streak reset and started new for goal {}", goal.getId());
            }
        }

        streak.setLastActivityDate(activityDate);
        return streakRepository.save(streak);
    }

    private Streak createNewStreak(Goal goal) {
        Streak streak = new Streak();
        streak.setGoal(goal);
        streak.setCurrentStreak(0);
        streak.setLongestStreak(0);
        return streak;
    }

    public boolean isStreakAtRisk(Streak streak) {
        if (streak == null || streak.getLastActivityDate() == null) {
            return false;
        }
        long daysSinceLastActivity = ChronoUnit.DAYS.between(streak.getLastActivityDate(), LocalDate.now());
        return daysSinceLastActivity >= 1;
    }
}