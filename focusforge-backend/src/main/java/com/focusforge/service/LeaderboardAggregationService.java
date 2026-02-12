package com.focusforge.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.focusforge.model.*;
import com.focusforge.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class LeaderboardAggregationService {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private LeaderboardSnapshotRepository snapshotRepository;

    private static final String[] CATEGORIES = { "Coding", "Health", "Reading", "Academics", "Career Skills" };

    /**
     * Refresh only affected scopes after a new activity is logged.
     * Recomputes overall + the activity category for WEEKLY, MONTHLY, and ALL_TIME.
     */
    @Transactional
    public void refreshSnapshotsForActivity(String categoryName, LocalDate referenceDate) {
        LocalDate effectiveDate = referenceDate != null ? referenceDate : LocalDate.now();
        String normalizedCategory = normalizeKnownCategory(categoryName);

        for (String periodType : List.of("WEEKLY", "MONTHLY", "ALL_TIME")) {
            LocalDate[] period = getPeriodBoundaries(periodType, effectiveDate);
            LocalDate startDate = period[0];
            LocalDate endDate = period[1];

            computeCategorySnapshot(null, startDate, endDate, periodType, effectiveDate);

            if (normalizedCategory != null) {
                computeCategorySnapshot(normalizedCategory, startDate, endDate, periodType, effectiveDate);
            }
        }
    }

    /**
     * Main entry point - computes and stores snapshots for all periods
     */
    @Transactional
    public void computeAndStoreAllSnapshots() {
        log.info("Starting leaderboard snapshot aggregation...");

        LocalDate today = LocalDate.now();

        // Compute for each period type
        computeAndStoreSnapshots("WEEKLY", today);
        computeAndStoreSnapshots("MONTHLY", today);
        computeAndStoreSnapshots("ALL_TIME", today);

        // Cleanup old snapshots (older than 90 days)
        LocalDate cutoff = today.minusDays(90);
        snapshotRepository.deleteOldSnapshots(cutoff);

        log.info("Leaderboard snapshot aggregation completed");
    }

    /**
     * Scheduled automatic aggregation - runs every hour
     * This ensures leaderboard stays up-to-date without manual triggers
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    public void scheduledAggregation() {
        log.info("Running scheduled leaderboard aggregation...");
        try {
            computeAndStoreAllSnapshots();
        } catch (Exception e) {
            log.error("Scheduled aggregation failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Compute snapshots for a specific period type
     */
    @Transactional
    public void computeAndStoreSnapshots(String periodType, LocalDate referenceDate) {
        log.info("Computing {} snapshots for {}", periodType, referenceDate);

        // Calculate period boundaries
        LocalDate[] period = getPeriodBoundaries(periodType, referenceDate);
        LocalDate startDate = period[0];
        LocalDate endDate = period[1];

        // Compute overall leaderboard
        computeCategorySnapshot(null, startDate, endDate, periodType, referenceDate);

        // Compute category-specific leaderboards
        for (String category : CATEGORIES) {
            computeCategorySnapshot(category, startDate, endDate, periodType, referenceDate);
        }
    }

    /**
     * Compute snapshot for a specific category (or overall if category is null)
     */
    @Transactional
    public void computeCategorySnapshot(String categoryName, LocalDate startDate, LocalDate endDate,
            String periodType, LocalDate snapshotDate) {

        log.debug("Computing snapshot: category={}, period={}, start={}, end={}",
                categoryName, periodType, startDate, endDate);

        // Get all eligible users
        List<RawUserMetrics> rawMetrics = collectRawMetrics(categoryName, startDate, endDate);

        if (rawMetrics.isEmpty()) {
            log.debug("No eligible users for category={}, period={}", categoryName, periodType);
            return;
        }

        // Normalize scores
        List<NormalizedUserScore> normalized = normalizeScores(rawMetrics);

        // Rank users
        List<LeaderboardSnapshot> snapshots = rankAndCreateSnapshots(
                normalized, categoryName, periodType, startDate, endDate, snapshotDate);

        // Save to database (delete existing, insert new)
        deleteExistingSnapshots(periodType, categoryName, startDate, endDate);
        snapshotRepository.saveAll(snapshots);

        log.info("Saved {} snapshots for category={}, period={}", snapshots.size(), categoryName, periodType);
    }

    /**
     * Collect raw metrics for eligible users
     */
    private List<RawUserMetrics> collectRawMetrics(String categoryName, LocalDate startDate, LocalDate endDate) {
        List<RawUserMetrics> metrics = new ArrayList<>();

        // Get users with eligible goals
        List<Goal> eligibleGoals;
        if (categoryName == null) {
            eligibleGoals = goalRepository.findAll().stream()
                    .filter(g -> !g.getIsPrivate() && g.getIsActive())
                    .collect(Collectors.toList());
        } else {
            eligibleGoals = goalRepository.findPublicGoalsByCategory(categoryName);
        }

        log.info("Category: {}, Eligible goals found: {}", categoryName, eligibleGoals.size());

        // Group by user
        Map<Long, List<Goal>> goalsByUser = eligibleGoals.stream()
                .collect(Collectors.groupingBy(g -> g.getUser().getId()));

        for (Map.Entry<Long, List<Goal>> entry : goalsByUser.entrySet()) {
            Long userId = entry.getKey();
            User user = entry.getValue().get(0).getUser();
            List<Long> goalIds = entry.getValue().stream()
                    .map(Goal::getId)
                    .collect(Collectors.toList());

            // Check privacy settings
            if (!isUserEligible(user)) {
                continue;
            }

            // Get activity data
            List<ActivityLog> activities = activityLogRepository
                    .findByUserIdAndGoalIdInAndLogDateBetween(userId, goalIds, startDate, endDate);

            if (activities.isEmpty()) {
                continue; // No activity this period
            }

            // Calculate metrics
            RawUserMetrics metric = new RawUserMetrics();
            metric.user = user;
            metric.daysActive = (int) activities.stream()
                    .map(ActivityLog::getLogDate)
                    .distinct()
                    .count();

            // Get points
            Integer points = pointLedgerRepository.getPointsForGoalsAndDateRange(userId, goalIds, startDate, endDate);
            metric.points = (points != null ? points : 0);

            // Get max streak
            metric.streak = entry.getValue().stream()
                    .map(Goal::getId)
                    .map(streakRepository::findByGoalId)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .mapToInt(Streak::getCurrentStreak)
                    .max()
                    .orElse(0);

            metrics.add(metric);
        }

        return metrics;
    }

    /**
     * Apply normalization (40% points, 30% consistency, 30% streak)
     */
    private List<NormalizedUserScore> normalizeScores(List<RawUserMetrics> rawMetrics) {
        if (rawMetrics.isEmpty()) {
            return Collections.emptyList();
        }

        // Find max values for normalization
        int maxPoints = rawMetrics.stream().mapToInt(m -> m.points).max().orElse(1);
        int maxDays = rawMetrics.stream().mapToInt(m -> m.daysActive).max().orElse(1);
        int maxStreak = rawMetrics.stream().mapToInt(m -> m.streak).max().orElse(1);

        List<NormalizedUserScore> normalized = new ArrayList<>();

        for (RawUserMetrics raw : rawMetrics) {
            NormalizedUserScore score = new NormalizedUserScore();
            score.user = raw.user;
            score.rawPoints = raw.points;
            score.daysActive = raw.daysActive;
            score.currentStreak = raw.streak;

            // Normalize (0-1 range)
            double pointsScore = (double) raw.points / maxPoints;
            double consistencyScore = (double) raw.daysActive / maxDays;
            double streakScore = (double) raw.streak / maxStreak;

            // Apply weights: 40% points, 30% consistency, 30% streak
            score.finalScore = (pointsScore * 0.40) + (consistencyScore * 0.30) + (streakScore * 0.30);

            // Scale to 0-100 for readability
            score.finalScore *= 100.0;

            normalized.add(score);
        }

        return normalized;
    }

    /**
     * Assign ranks and create snapshot entities
     */
    private List<LeaderboardSnapshot> rankAndCreateSnapshots(
            List<NormalizedUserScore> scores, String categoryName, String periodType,
            LocalDate startDate, LocalDate endDate, LocalDate snapshotDate) {

        // Sort by score descending
        scores.sort((a, b) -> Double.compare(b.finalScore, a.finalScore));

        List<LeaderboardSnapshot> snapshots = new ArrayList<>();
        int rank = 1;

        for (NormalizedUserScore score : scores) {
            LeaderboardSnapshot snapshot = new LeaderboardSnapshot();
            snapshot.setUser(score.user);
            snapshot.setCategoryName(categoryName);
            snapshot.setPeriodType(periodType);
            snapshot.setPeriodStart(startDate);
            snapshot.setPeriodEnd(endDate);
            snapshot.setRankPosition(rank++);
            snapshot.setScore(score.finalScore);
            snapshot.setRawPoints(score.rawPoints);
            snapshot.setSnapshotDate(snapshotDate);

            // Store transient data for potential use
            snapshot.setDaysActive(score.daysActive);
            snapshot.setCurrentStreak(score.currentStreak);

            snapshots.add(snapshot);
        }

        return snapshots;
    }

    /**
     * Delete existing snapshots before inserting new ones
     */
    private void deleteExistingSnapshots(String periodType, String categoryName,
            LocalDate startDate, LocalDate endDate) {
        List<LeaderboardSnapshot> existing = snapshotRepository.findByPeriodAndCategory(
                periodType, categoryName, startDate, endDate);
        log.debug("Found {} existing snapshots to delete for period={}, category={}",
                existing.size(), periodType, categoryName);
        if (!existing.isEmpty()) {
            snapshotRepository.deleteAll(existing);
            snapshotRepository.flush(); // Ensure deletions are committed before inserts
            log.debug("Deleted {} snapshots", existing.size());
        }
    }

    /**
     * Calculate period boundaries
     */
    private LocalDate[] getPeriodBoundaries(String periodType, LocalDate referenceDate) {
        LocalDate startDate, endDate;

        switch (periodType) {
            case "WEEKLY":
                startDate = referenceDate.minusDays(7);
                endDate = referenceDate;
                break;
            case "MONTHLY":
                startDate = referenceDate.minusDays(30);
                endDate = referenceDate;
                break;
            case "ALL_TIME":
                startDate = LocalDate.of(2020, 1, 1); // Arbitrary early date
                endDate = referenceDate;
                break;
            default:
                throw new IllegalArgumentException("Invalid period type: " + periodType);
        }

        return new LocalDate[] { startDate, endDate };
    }

    private String normalizeKnownCategory(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return null;
        }

        String trimmed = categoryName.trim();
        for (String knownCategory : CATEGORIES) {
            if (knownCategory.equalsIgnoreCase(trimmed)) {
                return knownCategory;
            }
        }

        return trimmed;
    }
    /**
     * Check if user is eligible for leaderboards (privacy check)
     */
    private boolean isUserEligible(User user) {
        String privacyJson = user.getPrivacySettings();
        if (privacyJson == null || privacyJson.trim().isEmpty()) {
            return true;
        }

        try {
            Map<String, Object> privacySettings = OBJECT_MAPPER.readValue(
                    privacyJson,
                    new TypeReference<Map<String, Object>>() {
                    });

            Object showLeaderboard = privacySettings.get("showLeaderboard");
            if (showLeaderboard instanceof Boolean) {
                return (Boolean) showLeaderboard;
            }
        } catch (Exception ex) {
            log.warn("Failed to parse privacy settings for user {}. Defaulting to visible.",
                    user.getId(), ex);
        }

        return true;
    }

    // Helper classes for intermediate data
    private static class RawUserMetrics {
        User user;
        int points;
        int daysActive;
        int streak;
    }

    private static class NormalizedUserScore {
        User user;
        int rawPoints;
        int daysActive;
        int currentStreak;
        double finalScore;
    }
}
