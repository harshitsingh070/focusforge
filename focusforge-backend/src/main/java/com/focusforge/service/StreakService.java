package com.focusforge.service;

import com.focusforge.model.ActivityLog;
import com.focusforge.model.Goal;
import com.focusforge.model.Streak;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.StreakRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class StreakService {

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Transactional
    public Streak updateStreak(Goal goal, LocalDate activityDate) {
        Streak streak = streakRepository.findByGoalId(goal.getId())
                .orElseGet(() -> createNewStreak(goal));

        List<ActivityLog> goalLogs = activityLogRepository.findByGoalIdOrderByLogDateAsc(goal.getId());
        if (goalLogs.isEmpty()) {
            streak.setCurrentStreak(0);
            streak.setLongestStreak(0);
            streak.setLastActivityDate(null);
            return streakRepository.save(streak);
        }

        int minimumMinutes = goal.getDailyMinimumMinutes() != null ? goal.getDailyMinimumMinutes() : 0;
        Map<LocalDate, Integer> minutesByDate = goalLogs.stream()
                .filter(log -> log.getLogDate() != null)
                .collect(Collectors.toMap(
                        ActivityLog::getLogDate,
                        log -> safeInt(log.getMinutesSpent()),
                        (existing, replacement) -> replacement));

        int longestStreak = calculateLongestStreak(minutesByDate, minimumMinutes);
        int currentStreak = calculateCurrentStreak(minutesByDate, minimumMinutes);
        LocalDate lastActivityDate = minutesByDate.keySet().stream().max(Comparator.naturalOrder()).orElse(null);

        streak.setCurrentStreak(currentStreak);
        streak.setLongestStreak(Math.max(safeInt(streak.getLongestStreak()), longestStreak));
        streak.setLastActivityDate(lastActivityDate);

        log.debug("Recomputed streak for goal {} on {} => current={}, longest={}",
                goal.getId(), activityDate, currentStreak, streak.getLongestStreak());
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

    private int calculateLongestStreak(Map<LocalDate, Integer> minutesByDate, int minimumMinutes) {
        if (minutesByDate.isEmpty()) {
            return 0;
        }

        List<LocalDate> sortedDates = minutesByDate.keySet().stream()
                .sorted()
                .toList();

        int longest = 0;
        int running = 0;
        LocalDate previousQualifiedDate = null;

        for (LocalDate date : sortedDates) {
            int minutes = safeInt(minutesByDate.get(date));
            boolean qualifies = minutes >= minimumMinutes;

            if (!qualifies) {
                running = 0;
                previousQualifiedDate = null;
                continue;
            }

            if (previousQualifiedDate != null && previousQualifiedDate.plusDays(1).equals(date)) {
                running++;
            } else {
                running = 1;
            }

            longest = Math.max(longest, running);
            previousQualifiedDate = date;
        }

        return longest;
    }

    private int calculateCurrentStreak(Map<LocalDate, Integer> minutesByDate, int minimumMinutes) {
        if (minutesByDate.isEmpty()) {
            return 0;
        }

        LocalDate latestDate = minutesByDate.keySet().stream().max(Comparator.naturalOrder()).orElse(null);
        if (latestDate == null) {
            return 0;
        }

        if (latestDate.isBefore(LocalDate.now().minusDays(1))) {
            return 0;
        }

        int latestMinutes = safeInt(minutesByDate.get(latestDate));
        if (latestMinutes < minimumMinutes) {
            return 0;
        }

        int streak = 0;
        LocalDate cursor = latestDate;
        while (cursor != null) {
            Integer minutes = minutesByDate.get(cursor);
            if (minutes == null || minutes < minimumMinutes) {
                break;
            }
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }
}
