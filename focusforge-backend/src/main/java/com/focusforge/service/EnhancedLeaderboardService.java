package com.focusforge.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.focusforge.model.*;
import com.focusforge.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
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
        log.debug("getLeaderboard called with category: {}, period: {}", categoryName, period);

        LocalDate[] dates = getPeriodDates(period);
        LocalDate startDate = dates[0];
        LocalDate endDate = dates[1];

        List<Map<String, Object>> rankings;
        boolean fromSnapshot = false;

        // Try to read from snapshots first
        String periodType = period.toUpperCase();
        String normalizedCategory = (categoryName == null || categoryName.equals("overall")) ? null : categoryName;

        log.debug("Querying snapshots for periodType: {}, category: {}, dates: {} to {}",
                periodType, normalizedCategory, startDate, endDate);

        List<LeaderboardSnapshot> snapshots = snapshotRepository.findByPeriodAndCategory(
                periodType,
                normalizedCategory,
                startDate,
                endDate);

        log.debug("Found {} snapshots for category: {}", snapshots.size(), normalizedCategory);

        if (!snapshots.isEmpty()) {
            // Use precomputed snapshots
            rankings = convertSnapshotsToRankings(snapshots);
            fromSnapshot = true;
        } else {
            log.warn("No snapshots found, falling back to on-demand computation for category: {}", categoryName);
            // Fallback to on-demand computation
            if (categoryName == null || categoryName.equals("overall")) {
                rankings = getOverallLeaderboard(startDate, endDate, period);
            } else {
                rankings = getCategoryLeaderboard(categoryName, startDate, endDate, period);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("rankings", rankings);
        response.put("period", period);
        response.put("categoryName", categoryName);
        response.put("startDate", startDate.toString());
        response.put("endDate", endDate.toString());
        response.put("fromSnapshot", fromSnapshot);
        response.put("computedOnDemand", !fromSnapshot);

        return response;
    }

    /**
     * Convert snapshot entities to frontend-compatible format
     */
    private List<Map<String, Object>> convertSnapshotsToRankings(List<LeaderboardSnapshot> snapshots) {
        // Protect frontend from historical duplicate snapshots by keeping the best-rank row per user.
        Map<Long, LeaderboardSnapshot> uniqueByUser = new LinkedHashMap<>();

        snapshots.stream()
                .sorted(Comparator
                        .comparing(LeaderboardSnapshot::getRankPosition, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(LeaderboardSnapshot::getId, Comparator.nullsLast(Long::compareTo)))
                .forEach(snapshot -> uniqueByUser.putIfAbsent(snapshot.getUser().getId(), snapshot));

        return uniqueByUser.values().stream()
                .map(this::toRankingEntry)
                .collect(Collectors.toList());
    }

    private Map<String, Object> toRankingEntry(LeaderboardSnapshot snapshot) {
        Map<String, Object> ranking = new HashMap<>();
        ranking.put("rank", snapshot.getRankPosition());
        ranking.put("userId", snapshot.getUser().getId());
        ranking.put("username", snapshot.getUser().getUsername());
        ranking.put("score", Math.round(snapshot.getScore() * 100.0) / 100.0);
        ranking.put("rawPoints", snapshot.getRawPoints() != null ? snapshot.getRawPoints() : 0);
        ranking.put("daysActive", snapshot.getDaysActive() != null ? snapshot.getDaysActive() : 0);
        ranking.put("streak", snapshot.getCurrentStreak() != null ? snapshot.getCurrentStreak() : 0);
        ranking.put("rankMovement", snapshot.getRankMovement() != null ? snapshot.getRankMovement() : 0);
        ranking.put("isNew", false);
        return ranking;
    }

    private List<Map<String, Object>> getCategoryLeaderboard(
            String categoryName, LocalDate startDate, LocalDate endDate, String period) {

        // Get all users with public goals in this category
        List<Goal> publicGoals = goalRepository.findPublicGoalsByCategory(categoryName);
        Map<Long, List<Goal>> goalsByUser = publicGoals.stream()
                .collect(Collectors.groupingBy(g -> g.getUser().getId()));

        Map<Long, UserLeaderboardData> userDataMap = new HashMap<>();

        for (Map.Entry<Long, List<Goal>> goalEntry : goalsByUser.entrySet()) {
            Long userId = goalEntry.getKey();
            List<Goal> userCategoryGoals = goalEntry.getValue();
            User user = userCategoryGoals.get(0).getUser();

            // Check privacy settings - skip if user opted out
            if (!isUserEligibleForLeaderboard(user)) {
                continue;
            }

            List<Long> goalIds = userCategoryGoals.stream()
                    .map(Goal::getId)
                    .collect(Collectors.toList());

            // Check activity requirement
            List<ActivityLog> userActivities = activityLogRepository
                    .findByUserIdAndGoalIdInAndLogDateBetween(userId, goalIds, startDate, endDate);

            if (userActivities.isEmpty()) {
                continue; // No activity in period
            }

            // Get or create user data
            UserLeaderboardData userData = userDataMap.computeIfAbsent(
                    userId,
                    k -> new UserLeaderboardData(user));

            // Calculate raw points for this user's category goals only
            Integer goalPoints = pointLedgerRepository.getPointsForGoalsAndDateRange(
                    userId, goalIds, startDate, endDate);
            userData.rawPoints = (goalPoints != null ? goalPoints : 0);

            // Calculate consistency bonus
            long daysActive = userActivities.stream()
                    .map(ActivityLog::getLogDate)
                    .distinct()
                    .count();
            userData.daysActive = (int) daysActive;

            // Get streak bonus
            userData.maxStreak = userCategoryGoals.stream()
                    .map(Goal::getId)
                    .map(streakRepository::findByGoalId)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .map(Streak::getCurrentStreak)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0);
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

            List<Long> goalIds = userPublicGoals.stream()
                    .map(Goal::getId)
                    .collect(Collectors.toList());

            // Check activity requirement
            List<ActivityLog> userActivities = activityLogRepository
                    .findByUserIdAndGoalIdInAndLogDateBetween(user.getId(), goalIds, startDate, endDate);

            if (userActivities.isEmpty()) {
                continue;
            }

            UserLeaderboardData userData = new UserLeaderboardData(user);

            // Get total points from public goals in scope
            Integer totalPoints = pointLedgerRepository.getPointsForGoalsAndDateRange(
                    user.getId(), goalIds, startDate, endDate);
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

            rankings.add(entry);

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

    private LocalDate[] getPeriodDates(String period) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        switch (period.toUpperCase()) {
            case "WEEKLY":
                startDate = endDate.minusDays(7);
                break;
            case "MONTHLY":
                startDate = endDate.minusDays(30);
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
        LocalDate[] dates = getPeriodDates(period);
        LocalDate startDate = dates[0];
        LocalDate endDate = dates[1];

        Map<String, Object> context = new HashMap<>();

        // Try snapshot first
        String periodType = period.toUpperCase();
        String normalizedCategory = (categoryName == null || categoryName.equals("overall")) ? null : categoryName;

        List<LeaderboardSnapshot> mySnapshots = snapshotRepository.findUserRanks(
                userId,
                periodType,
                normalizedCategory,
                startDate,
                endDate);

        if (!mySnapshots.isEmpty()) {
            // Use snapshot data
            LeaderboardSnapshot mySnapshot = mySnapshots.get(0);
            int myRank = mySnapshot.getRankPosition();

            // Get surrounding ranks
            List<LeaderboardSnapshot> surroundingSnapshots = snapshotRepository.findRankRange(
                    periodType,
                    normalizedCategory,
                    startDate,
                    endDate,
                    Math.max(1, myRank - 1),
                    myRank + 1);

            List<Map<String, Object>> surroundingEntries = convertSnapshotsToRankings(surroundingSnapshots);
            for (Map<String, Object> rankData : surroundingEntries) {
                int rank = ((Number) rankData.get("rank")).intValue();
                if (rank == myRank - 1) {
                    context.put("aboveMe", rankData);
                } else if (rank == myRank) {
                    context.put("myRank", rankData);
                } else if (rank == myRank + 1) {
                    context.put("belowMe", rankData);
                }
            }

            context.put("notRanked", false);
            context.put("totalParticipants", Optional
                    .ofNullable(snapshotRepository.countParticipants(periodType, normalizedCategory, startDate, endDate))
                    .orElse(0L));
            context.put("fromSnapshot", true);
            return context;
        }

        // Fallback to original on-demand logic
        Map<String, Object> leaderboard = getLeaderboard(categoryName, period);
        List<Map<String, Object>> rankings = (List<Map<String, Object>>) leaderboard.get("rankings");

        // Find user's position
        int userIndex = -1;
        Map<String, Object> userEntry = null;

        for (int i = 0; i < rankings.size(); i++) {
            Map<String, Object> entry = rankings.get(i);
            Object entryUserId = entry.get("userId");
            if (entryUserId instanceof Number && ((Number) entryUserId).longValue() == userId) {
                userIndex = i;
                userEntry = entry;
                break;
            }
        }

        // On-demand fallback computation
        context = new HashMap<>();

        if (userEntry != null) {
            context.put("myRank", userEntry);

            if (userIndex > 0) {
                context.put("aboveMe", rankings.get(userIndex - 1));
            }
            if (userIndex < rankings.size() - 1) {
                context.put("belowMe", rankings.get(userIndex + 1));
            }
            context.put("notRanked", false);
            context.put("totalParticipants", rankings.size());
        } else {
            context.put("notRanked", true);
            context.put("reason", "Log activity on public goals and enable leaderboard sharing to appear here.");
        }

        context.put("fromSnapshot", false);
        return context;
    }
}
