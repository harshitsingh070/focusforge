package com.focusforge.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.focusforge.model.*;
import com.focusforge.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnhancedLeaderboardService {

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private LeaderboardSnapshotRepository snapshotRepository;

    public Map<String, Object> getLeaderboard(String categoryName, String period) {
        LocalDate[] dates = getPeriodDates(period);
        LocalDate startDate = dates[0];
        LocalDate endDate = dates[1];

        List<Map<String, Object>> rankings;

        if (categoryName == null || categoryName.equals("overall")) {
            rankings = getOverallLeaderboard(startDate, endDate, period);
        } else {
            rankings = getCategoryLeaderboard(categoryName, startDate, endDate, period);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("rankings", rankings);
        response.put("period", period);
        response.put("categoryName", categoryName);
        response.put("startDate", startDate.toString());
        response.put("endDate", endDate.toString());

        return response;
    }

    private List<Map<String, Object>> getCategoryLeaderboard(
            String categoryName, LocalDate startDate, LocalDate endDate, String period) {

        // Get all users with public goals in this category
        List<Goal> publicGoals = goalRepository.findPublicGoalsByCategory(categoryName);

        Map<Long, UserLeaderboardData> userDataMap = new HashMap<>();

        for (Goal goal : publicGoals) {
            User user = goal.getUser();

            // Check privacy settings - skip if user opted out
            if (!isUserEligibleForLeaderboard(user)) {
                continue;
            }

            // Check activity requirement
            List<ActivityLog> userActivities = activityLogRepository
                    .findByUserIdAndLogDateBetween(user.getId(), startDate, endDate);

            if (userActivities.isEmpty()) {
                continue; // No activity in period
            }

            // Get or create user data
            UserLeaderboardData userData = userDataMap.computeIfAbsent(
                    user.getId(),
                    k -> new UserLeaderboardData(user));

            // Calculate raw points for this goal
            Integer goalPoints = pointLedgerRepository.getPointsForDateRange(
                    user.getId(), startDate, endDate);
            userData.rawPoints += (goalPoints != null ? goalPoints : 0);

            // Calculate consistency bonus
            long daysActive = userActivities.stream()
                    .map(ActivityLog::getLogDate)
                    .distinct()
                    .count();
            userData.daysActive = Math.max(userData.daysActive, (int) daysActive);

            // Get streak bonus
            Optional<Streak> streakOpt = streakRepository.findByGoalId(goal.getId());
            if (streakOpt.isPresent()) {
                userData.maxStreak = Math.max(userData.maxStreak, streakOpt.get().getCurrentStreak());
            }
        }

        // Normalize scores within category
        return normalizeAndRank(userDataMap.values(), categoryName, period, startDate, endDate);
    }

    private List<Map<String, Object>> getOverallLeaderboard(
            LocalDate startDate, LocalDate endDate, String period) {

        // Get all users with any public goals
        List<User> users = userRepository.findAll();
        Map<Long, UserLeaderboardData> userDataMap = new HashMap<>();

        for (User user : users) {
            if (!isUserEligibleForLeaderboard(user)) {
                continue;
            }

            List<Goal> userPublicGoals = goalRepository.findPublicGoalsByUser(user.getId());
            if (userPublicGoals.isEmpty()) {
                continue;
            }

            // Check activity requirement
            List<ActivityLog> userActivities = activityLogRepository
                    .findByUserIdAndLogDateBetween(user.getId(), startDate, endDate);

            if (userActivities.isEmpty()) {
                continue;
            }

            UserLeaderboardData userData = new UserLeaderboardData(user);

            // Get total points
            Integer totalPoints = pointLedgerRepository.getPointsForDateRange(
                    user.getId(), startDate, endDate);
            userData.rawPoints = (totalPoints != null ? totalPoints : 0);

            // Calculate consistency
            long daysActive = userActivities.stream()
                    .map(ActivityLog::getLogDate)
                    .distinct()
                    .count();
            userData.daysActive = (int) daysActive;

            // Get max streak across all goals
            for (Goal goal : userPublicGoals) {
                Optional<Streak> streakOpt = streakRepository.findByGoalId(goal.getId());
                if (streakOpt.isPresent()) {
                    userData.maxStreak = Math.max(userData.maxStreak, streakOpt.get().getCurrentStreak());
                }
            }

            userDataMap.put(user.getId(), userData);
        }

        return normalizeAndRank(userDataMap.values(), null, period, startDate, endDate);
    }

    private List<Map<String, Object>> normalizeAndRank(
            Collection<UserLeaderboardData> userDataCollection,
            String categoryName,
            String period,
            LocalDate startDate,
            LocalDate endDate) {

        if (userDataCollection.isEmpty()) {
            return new ArrayList<>();
        }

        List<UserLeaderboardData> userDataList = new ArrayList<>(userDataCollection);

        // Find min/max for normalization
        int maxPoints = userDataList.stream().mapToInt(u -> u.rawPoints).max().orElse(1);
        int maxStreak = userDataList.stream().mapToInt(u -> u.maxStreak).max().orElse(1);
        int maxDaysActive = userDataList.stream().mapToInt(u -> u.daysActive).max().orElse(1);

        // Calculate normalized scores
        for (UserLeaderboardData userData : userDataList) {
            double pointsScore = maxPoints > 0 ? (userData.rawPoints * 100.0) / maxPoints : 0;
            double streakScore = maxStreak > 0 ? (userData.maxStreak * 100.0) / maxStreak : 0;
            double consistencyScore = maxDaysActive > 0 ? (userData.daysActive * 100.0) / maxDaysActive : 0;

            // Weighted composite score (consistency is weighted highest)
            userData.normalizedScore = (pointsScore * 0.4) + (streakScore * 0.3) + (consistencyScore * 0.3);
        }

        // Sort by normalized score
        userDataList.sort((a, b) -> Double.compare(b.normalizedScore, a.normalizedScore));

        // Convert to response format with ranks and movement
        List<Map<String, Object>> rankings = new ArrayList<>();
        int rank = 1;

        for (UserLeaderboardData userData : userDataList) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("rank", rank);
            entry.put("userId", userData.user.getId());
            entry.put("username", userData.user.getUsername());
            entry.put("score", Math.round(userData.normalizedScore * 10) / 10.0);
            entry.put("rawPoints", userData.rawPoints);
            entry.put("streak", userData.maxStreak);
            entry.put("daysActive", userData.daysActive);

            // Get rank movement
            Integer previousRank = getPreviousRank(
                    userData.user.getId(), categoryName, period, startDate, endDate);

            if (previousRank != null) {
                int movement = previousRank - rank; // Positive = moved up
                entry.put("rankMovement", movement);
                entry.put("previousRank", previousRank);
            } else {
                entry.put("rankMovement", 0);
                entry.put("isNew", true);
            }

            rankings.add(entry);

            // Save current snapshot for future comparisons
            saveSnapshot(userData.user.getId(), categoryName, period, startDate, endDate, rank,
                    userData.normalizedScore, userData.rawPoints);

            rank++;
        }

        return rankings;
    }

    private boolean isUserEligibleForLeaderboard(User user) {
        String privacySettingsJson = user.getPrivacySettings();

        if (privacySettingsJson == null || privacySettingsJson.trim().isEmpty()) {
            return true; // Default to visible
        }

        // Parse JSON string to Map
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> privacySettings = mapper.readValue(
                    privacySettingsJson,
                    new TypeReference<Map<String, Object>>() {
                    });

            // Check if user opted out of leaderboards
            Object showLeaderboard = privacySettings.get("showLeaderboard");
            if (showLeaderboard instanceof Boolean) {
                return (Boolean) showLeaderboard;
            }
        } catch (Exception e) {
            // If parsing fails, default to visible
            return true;
        }

        return true; // Default to visible
    }

    private Integer getPreviousRank(
            Long userId, String categoryName, String period, LocalDate startDate, LocalDate endDate) {

        Optional<LeaderboardSnapshot> snapshotOpt;

        if (categoryName == null) {
            snapshotOpt = snapshotRepository.findPreviousOverallRank(
                    userId, period, startDate, endDate);
        } else {
            snapshotOpt = snapshotRepository.findPreviousRank(
                    userId, categoryName, period, startDate, endDate);
        }

        return snapshotOpt.map(LeaderboardSnapshot::getRankPosition).orElse(null);
    }

    private void saveSnapshot(
            Long userId, String categoryName, String period,
            LocalDate startDate, LocalDate endDate,
            int rank, double score, int rawPoints) {

        LeaderboardSnapshot snapshot = new LeaderboardSnapshot();
        snapshot.setUser(userRepository.findById(userId).orElse(null));
        snapshot.setCategoryName(categoryName);
        snapshot.setPeriodType(period);
        snapshot.setPeriodStart(startDate);
        snapshot.setPeriodEnd(endDate);
        snapshot.setRankPosition(rank);
        snapshot.setScore(score);
        snapshot.setRawPoints(rawPoints);
        snapshot.setSnapshotDate(LocalDate.now());

        snapshotRepository.save(snapshot);
    }

    private LocalDate[] getPeriodDates(String period) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        switch (period.toUpperCase()) {
            case "WEEKLY":
                startDate = endDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                endDate = startDate.plusDays(6);
                break;
            case "MONTHLY":
                startDate = endDate.withDayOfMonth(1);
                endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());
                break;
            case "ALL_TIME":
                startDate = LocalDate.of(2020, 1, 1); // Platform start
                break;
            default: // Default to last 30 days
                startDate = endDate.minusDays(29);
        }

        return new LocalDate[] { startDate, endDate };
    }

    // Helper class for aggregating user data
    private static class UserLeaderboardData {
        User user;
        int rawPoints = 0;
        int maxStreak = 0;
        int daysActive = 0;
        double normalizedScore = 0.0;

        UserLeaderboardData(User user) {
            this.user = user;
        }
    }

    public Map<String, Object> getUserRankContext(Long userId, String categoryName, String period) {
        Map<String, Object> leaderboard = getLeaderboard(categoryName, period);
        List<Map<String, Object>> rankings = (List<Map<String, Object>>) leaderboard.get("rankings");

        // Find user's position
        int userIndex = -1;
        Map<String, Object> userEntry = null;

        for (int i = 0; i < rankings.size(); i++) {
            Map<String, Object> entry = rankings.get(i);
            if (entry.get("userId").equals(userId)) {
                userIndex = i;
                userEntry = entry;
                break;
            }
        }

        Map<String, Object> context = new HashMap<>();

        if (userEntry != null) {
            context.put("myRank", userEntry);

            // Add users immediately above and below
            if (userIndex > 0) {
                context.put("aboveMe", rankings.get(userIndex - 1));
            }
            if (userIndex < rankings.size() - 1) {
                context.put("belowMe", rankings.get(userIndex + 1));
            }

            context.put("totalParticipants", rankings.size());
        } else {
            context.put("notRanked", true);
            context.put("reason", "No public goals or activity in this period");
        }

        return context;
    }
}
