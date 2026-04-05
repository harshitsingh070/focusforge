package com.focusforge.service;

import com.focusforge.model.ActivityLog;
import com.focusforge.model.Goal;
import com.focusforge.model.PointLedger;
import com.focusforge.model.User;
import com.focusforge.model.UserBadge;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.GoalRepository;
import com.focusforge.repository.PointLedgerRepository;
import com.focusforge.repository.UserBadgeRepository;
import com.focusforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AdminDashboardService {

    @Value("${app.admin.email:admin.focusforge@gmail.com}")
    private String adminEmail;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    public boolean isAdminEmail(String email) {
        return email != null && email.equalsIgnoreCase(adminEmail);
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOverview() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);
        LocalDate fourteenDaysAgo = today.minusDays(13);
        LocalDate trafficStart = today.minusDays(13);
        LocalDate thirtyDaysAgo = today.minusDays(29);
        LocalDateTime dayAgoTimestamp = LocalDateTime.now().minusHours(24);
        LocalDateTime monthAgoTimestamp = LocalDateTime.now().minusDays(30);

        List<User> allUsers = userRepository.findAll();
        Set<Long> adminUserIds = allUsers.stream()
                .filter(user -> isAdminEmail(user.getEmail()))
                .map(User::getId)
                .collect(HashSet::new, HashSet::add, HashSet::addAll);
        List<User> platformUsers = allUsers.stream()
                .filter(user -> !isAdminEmail(user.getEmail()))
                .toList();

        List<Goal> goals = goalRepository.findAll();
        List<ActivityLog> activityLogs = activityLogRepository.findAll();
        List<PointLedger> pointEntries = pointLedgerRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findAll();

        Map<Long, Long> goalsByUser = new HashMap<>();
        Map<Long, Long> activeGoalsByUser = new HashMap<>();
        Map<Long, Long> publicGoalsByUser = new HashMap<>();
        Map<Long, LocalDate> goalLastActivityDateByGoalId = new HashMap<>();
        long goalsCreatedLast7Days = 0L;
        long publicGoalsCount = 0L;
        long publicGoalsCreatedLast7Days = 0L;

        for (Goal goal : goals) {
            Long userId = goal.getUser().getId();
            if (adminUserIds.contains(userId)) {
                continue;
            }

            goalsByUser.merge(userId, 1L, Long::sum);
            if (Boolean.TRUE.equals(goal.getIsActive())) {
                activeGoalsByUser.merge(userId, 1L, Long::sum);
            }

            if (Boolean.FALSE.equals(goal.getIsPrivate())) {
                publicGoalsByUser.merge(userId, 1L, Long::sum);
                publicGoalsCount++;
                LocalDate publicCreatedDate = toLocalDate(goal.getCreatedAt());
                if (publicCreatedDate != null && !publicCreatedDate.isBefore(sevenDaysAgo)) {
                    publicGoalsCreatedLast7Days++;
                }
            }

            LocalDate createdDate = toLocalDate(goal.getCreatedAt());
            if (createdDate != null && !createdDate.isBefore(sevenDaysAgo)) {
                goalsCreatedLast7Days++;
            }
        }

        Map<Long, Long> activityCountByUser = new HashMap<>();
        Map<Long, Long> minutesByUser = new HashMap<>();
        Map<Long, Long> activityCountLast30DaysByUser = new HashMap<>();
        Map<Long, LocalDate> firstActivityDateByUser = new HashMap<>();
        Map<Long, LocalDate> lastActivityDateByUser = new HashMap<>();
        Map<Long, Set<LocalDate>> activityDatesByUser = new HashMap<>();
        Set<Long> uniqueUsersLast7Days = new HashSet<>();
        long filteredActivityEntries = 0L;
        long activitiesLast24Hours = 0L;
        long activitiesLast7Days = 0L;
        long totalMinutesLogged = 0L;

        Map<LocalDate, Long> activityCountByDate = new HashMap<>();
        Map<LocalDate, Long> minutesByDate = new HashMap<>();
        Map<LocalDate, Set<Long>> activeUsersByDate = new HashMap<>();

        for (ActivityLog activityLog : activityLogs) {
            Long userId = activityLog.getUser().getId();
            if (adminUserIds.contains(userId)) {
                continue;
            }

            filteredActivityEntries++;
            LocalDate logDate = activityLog.getLogDate();
            long minutes = safeNumber(activityLog.getMinutesSpent());

            activityCountByUser.merge(userId, 1L, Long::sum);
            minutesByUser.merge(userId, minutes, Long::sum);
            totalMinutesLogged += minutes;

            if (logDate != null) {
                activityDatesByUser.computeIfAbsent(userId, ignored -> new HashSet<>()).add(logDate);

                LocalDate firstDate = firstActivityDateByUser.get(userId);
                if (firstDate == null || logDate.isBefore(firstDate)) {
                    firstActivityDateByUser.put(userId, logDate);
                }

                LocalDate lastDate = lastActivityDateByUser.get(userId);
                if (lastDate == null || logDate.isAfter(lastDate)) {
                    lastActivityDateByUser.put(userId, logDate);
                }

                if (!logDate.isBefore(thirtyDaysAgo)) {
                    activityCountLast30DaysByUser.merge(userId, 1L, Long::sum);
                }

                if (!logDate.isBefore(sevenDaysAgo)) {
                    activitiesLast7Days++;
                    uniqueUsersLast7Days.add(userId);
                }

                if (!logDate.isBefore(trafficStart) && !logDate.isAfter(today)) {
                    activityCountByDate.merge(logDate, 1L, Long::sum);
                    minutesByDate.merge(logDate, minutes, Long::sum);
                    activeUsersByDate.computeIfAbsent(logDate, ignored -> new HashSet<>()).add(userId);
                }

                Long goalId = activityLog.getGoal() != null ? activityLog.getGoal().getId() : null;
                if (goalId != null) {
                    LocalDate goalLastDate = goalLastActivityDateByGoalId.get(goalId);
                    if (goalLastDate == null || logDate.isAfter(goalLastDate)) {
                        goalLastActivityDateByGoalId.put(goalId, logDate);
                    }
                }
            }

            if (activityLog.getCreatedAt() != null && !activityLog.getCreatedAt().isBefore(dayAgoTimestamp)) {
                activitiesLast24Hours++;
            }
        }

        Map<Long, Long> pointsByUser = new HashMap<>();
        Map<Long, Long> pointsLast7DaysByUser = new HashMap<>();
        Map<LocalDate, Long> pointsByDate = new HashMap<>();
        long filteredPointEntries = 0L;
        long totalPointsAwarded = 0L;
        long pointEntriesLast7Days = 0L;

        for (PointLedger pointLedger : pointEntries) {
            Long userId = pointLedger.getUser().getId();
            if (adminUserIds.contains(userId)) {
                continue;
            }

            filteredPointEntries++;
            LocalDate referenceDate = pointLedger.getReferenceDate();
            long points = safeNumber(pointLedger.getPoints());

            pointsByUser.merge(userId, points, Long::sum);
            totalPointsAwarded += points;

            if (referenceDate != null && !referenceDate.isBefore(sevenDaysAgo)) {
                pointsLast7DaysByUser.merge(userId, points, Long::sum);
                pointEntriesLast7Days++;
            }

            if (referenceDate != null && !referenceDate.isBefore(trafficStart) && !referenceDate.isAfter(today)) {
                pointsByDate.merge(referenceDate, points, Long::sum);
                activeUsersByDate.computeIfAbsent(referenceDate, ignored -> new HashSet<>()).add(userId);
            }
        }

        Set<Long> badgeUsers = new HashSet<>();
        long totalBadgeAwards = 0L;
        long badgeAwardsLast7Days = 0L;
        for (UserBadge userBadge : userBadges) {
            Long userId = userBadge.getUser().getId();
            if (adminUserIds.contains(userId)) {
                continue;
            }
            totalBadgeAwards++;
            badgeUsers.add(userId);

            LocalDate awardedDate = toLocalDate(userBadge.getAwardedAt());
            if (awardedDate != null && !awardedDate.isBefore(sevenDaysAgo)) {
                badgeAwardsLast7Days++;
            }
        }

        List<Map<String, Object>> usersTable = new ArrayList<>();
        for (User user : platformUsers) {
            Long userId = user.getId();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userId", userId);
            row.put("username", user.getUsername());
            row.put("email", user.getEmail());
            row.put("isActive", Boolean.TRUE.equals(user.getIsActive()));
            row.put("createdAt", formatTimestamp(user.getCreatedAt()));
            row.put("privacySettings", user.getPrivacySettings());
            row.put("goalsCount", goalsByUser.getOrDefault(userId, 0L));
            row.put("activeGoalsCount", activeGoalsByUser.getOrDefault(userId, 0L));
            row.put("totalActivities", activityCountByUser.getOrDefault(userId, 0L));
            row.put("activitiesLast30Days", activityCountLast30DaysByUser.getOrDefault(userId, 0L));
            row.put("firstActivityDate", formatDate(firstActivityDateByUser.get(userId)));
            row.put("totalMinutes", minutesByUser.getOrDefault(userId, 0L));
            row.put("totalPoints", pointsByUser.getOrDefault(userId, 0L));
            row.put("pointsLast7Days", pointsLast7DaysByUser.getOrDefault(userId, 0L));
            row.put("lastActivityDate", formatDate(lastActivityDateByUser.get(userId)));
            usersTable.add(row);
        }
        usersTable.sort((left, right) -> {
            int pointsCompare = Long.compare(
                    safeMapNumber(right.get("totalPoints")),
                    safeMapNumber(left.get("totalPoints")));
            if (pointsCompare != 0) {
                return pointsCompare;
            }
            return Long.compare(
                    safeMapNumber(right.get("totalActivities")),
                    safeMapNumber(left.get("totalActivities")));
        });

        List<Map<String, Object>> topUsers = new ArrayList<>();
        for (int i = 0; i < usersTable.size() && i < 10; i++) {
            Map<String, Object> userRow = usersTable.get(i);
            Map<String, Object> topRow = new LinkedHashMap<>();
            topRow.put("rank", i + 1);
            topRow.put("userId", userRow.get("userId"));
            topRow.put("username", userRow.get("username"));
            topRow.put("email", userRow.get("email"));
            topRow.put("totalPoints", userRow.get("totalPoints"));
            topRow.put("totalMinutes", userRow.get("totalMinutes"));
            topRow.put("totalActivities", userRow.get("totalActivities"));
            topRow.put("activeGoalsCount", userRow.get("activeGoalsCount"));
            topUsers.add(topRow);
        }

        List<Map<String, Object>> traffic = new ArrayList<>();
        for (LocalDate date = trafficStart; !date.isAfter(today); date = date.plusDays(1)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", formatDate(date));
            row.put("activities", activityCountByDate.getOrDefault(date, 0L));
            row.put("activeUsers", (long) activeUsersByDate.getOrDefault(date, Set.of()).size());
            row.put("minutes", minutesByDate.getOrDefault(date, 0L));
            row.put("points", pointsByDate.getOrDefault(date, 0L));
            traffic.add(row);
        }

        List<Map<String, Object>> recentActivity = activityLogs.stream()
                .filter(activityLog -> !adminUserIds.contains(activityLog.getUser().getId()))
                .sorted(Comparator.comparing(ActivityLog::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(100)
                .map(activityLog -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", activityLog.getId());
                    row.put("userId", activityLog.getUser().getId());
                    row.put("username", activityLog.getUser().getUsername());
                    row.put("email", activityLog.getUser().getEmail());
                    row.put("goalId", activityLog.getGoal().getId());
                    row.put("goalTitle", activityLog.getGoal().getTitle());
                    row.put("category", activityLog.getGoal().getCategory().getName());
                    row.put("logDate", formatDate(activityLog.getLogDate()));
                    row.put("minutesSpent", safeNumber(activityLog.getMinutesSpent()));
                    row.put("createdAt", formatTimestamp(activityLog.getCreatedAt()));
                    return row;
                })
                .toList();

        List<Map<String, Object>> recentPoints = pointEntries.stream()
                .filter(pointLedger -> !adminUserIds.contains(pointLedger.getUser().getId()))
                .sorted(Comparator.comparing(PointLedger::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(100)
                .map(pointLedger -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", pointLedger.getId());
                    row.put("userId", pointLedger.getUser().getId());
                    row.put("username", pointLedger.getUser().getUsername());
                    row.put("email", pointLedger.getUser().getEmail());
                    row.put("goalId", pointLedger.getGoal() != null ? pointLedger.getGoal().getId() : null);
                    row.put("points", safeNumber(pointLedger.getPoints()));
                    row.put("reason", pointLedger.getReason());
                    row.put("referenceDate", formatDate(pointLedger.getReferenceDate()));
                    row.put("createdAt", formatTimestamp(pointLedger.getCreatedAt()));
                    return row;
                })
                .toList();

        long totalUsers = platformUsers.size();
        long activeUsers = platformUsers.stream().filter(user -> Boolean.TRUE.equals(user.getIsActive())).count();
        long inactiveUsers = totalUsers - activeUsers;
        long newUsersLast30Days = platformUsers.stream()
                .filter(user -> user.getCreatedAt() != null && !user.getCreatedAt().isBefore(monthAgoTimestamp))
                .count();
        long totalGoals = goals.stream().filter(goal -> !adminUserIds.contains(goal.getUser().getId())).count();
        long activeGoals = goals.stream()
                .filter(goal -> !adminUserIds.contains(goal.getUser().getId()) && Boolean.TRUE.equals(goal.getIsActive()))
                .count();
        long publicActiveGoals = goals.stream()
                .filter(goal -> !adminUserIds.contains(goal.getUser().getId())
                        && Boolean.TRUE.equals(goal.getIsActive())
                        && Boolean.FALSE.equals(goal.getIsPrivate()))
                .count();

        long usersWithGoals = platformUsers.stream()
                .filter(user -> goalsByUser.getOrDefault(user.getId(), 0L) > 0)
                .count();
        long usersWithFirstActivity = platformUsers.stream()
                .filter(user -> activityCountByUser.getOrDefault(user.getId(), 0L) > 0)
                .count();
        long usersWithThreeActiveDays = platformUsers.stream()
                .filter(user -> activityDatesByUser.getOrDefault(user.getId(), Set.of()).size() >= 3)
                .count();
        long usersRetainedAndRecentlyActive = platformUsers.stream()
                .filter(user -> {
                    Long userId = user.getId();
                    long activeDays = activityDatesByUser.getOrDefault(userId, Set.of()).size();
                    LocalDate lastActivity = lastActivityDateByUser.get(userId);
                    return activeDays >= 3 && lastActivity != null && !lastActivity.isBefore(sevenDaysAgo);
                })
                .count();

        List<Map<String, Object>> funnelTracking = buildFunnelTracking(
                totalUsers,
                usersWithGoals,
                usersWithFirstActivity,
                usersWithThreeActiveDays,
                usersRetainedAndRecentlyActive);
        Map<String, Object> retentionMetrics = buildRetentionMetrics(platformUsers, activityDatesByUser, today);
        List<Map<String, Object>> lifecycleStates = buildLifecycleStates(
                platformUsers,
                goalsByUser,
                activityCountByUser,
                lastActivityDateByUser,
                today);

        List<Map<String, Object>> featureUsageTracking = buildFeatureUsageTracking(
                totalUsers,
                usersWithGoals,
                totalGoals,
                goalsCreatedLast7Days,
                usersWithFirstActivity,
                filteredActivityEntries,
                activitiesLast7Days,
                publicGoalsByUser,
                publicGoalsCount,
                publicGoalsCreatedLast7Days,
                pointsByUser,
                filteredPointEntries,
                pointEntriesLast7Days,
                badgeUsers,
                totalBadgeAwards,
                badgeAwardsLast7Days);

        Map<String, Object> dropOffAnalytics = buildDropOffAnalytics(
                platformUsers,
                goalsByUser,
                activityCountByUser,
                lastActivityDateByUser,
                goals,
                goalLastActivityDateByGoalId,
                today,
                fourteenDaysAgo,
                funnelTracking);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalUsers", totalUsers);
        summary.put("activeUsers", activeUsers);
        summary.put("inactiveUsers", inactiveUsers);
        summary.put("newUsersLast30Days", newUsersLast30Days);
        summary.put("totalGoals", totalGoals);
        summary.put("activeGoals", activeGoals);
        summary.put("publicActiveGoals", publicActiveGoals);
        summary.put("totalActivities", filteredActivityEntries);
        summary.put("activitiesLast24Hours", activitiesLast24Hours);
        summary.put("activitiesLast7Days", activitiesLast7Days);
        summary.put("uniqueUsersLast7Days", (long) uniqueUsersLast7Days.size());
        summary.put("totalMinutesLogged", totalMinutesLogged);
        summary.put("totalPointEntries", filteredPointEntries);
        summary.put("totalPointsAwarded", totalPointsAwarded);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("generatedAt", formatTimestamp(LocalDateTime.now()));
        response.put("adminEmail", adminEmail);
        response.put("summary", summary);
        response.put("traffic", traffic);
        response.put("topUsers", topUsers);
        response.put("users", usersTable);
        response.put("recentActivity", recentActivity);
        response.put("recentPoints", recentPoints);
        response.put("funnelTracking", funnelTracking);
        response.put("retentionMetrics", retentionMetrics);
        response.put("userLifecycleStates", lifecycleStates);
        response.put("featureUsageTracking", featureUsageTracking);
        response.put("dropOffAnalytics", dropOffAnalytics);
        return response;
    }

    private List<Map<String, Object>> buildFunnelTracking(
            long totalUsers,
            long usersWithGoals,
            long usersWithFirstActivity,
            long usersWithThreeActiveDays,
            long usersRetainedAndRecentlyActive) {
        String[] stages = {
                "Registered users",
                "Created at least one goal",
                "Logged first activity",
                "Active on 3+ days",
                "3+ day users active in last 7d"
        };
        long[] users = {
                totalUsers,
                usersWithGoals,
                usersWithFirstActivity,
                usersWithThreeActiveDays,
                usersRetainedAndRecentlyActive
        };

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < stages.length; i++) {
            long previousUsers = i == 0 ? users[i] : users[i - 1];
            long currentUsers = Math.min(users[i], previousUsers);
            long usersLost = i == 0 ? 0L : Math.max(0L, previousUsers - currentUsers);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("stage", stages[i]);
            row.put("users", currentUsers);
            row.put("conversionFromPrevious", i == 0 ? 100D : calculatePercentage(currentUsers, previousUsers));
            row.put("dropOffFromPrevious", i == 0 ? 0D : calculatePercentage(usersLost, previousUsers));
            rows.add(row);
        }
        return rows;
    }

    private Map<String, Object> buildRetentionMetrics(
            List<User> platformUsers,
            Map<Long, Set<LocalDate>> activityDatesByUser,
            LocalDate today) {
        long eligibleDay1 = 0L;
        long retainedDay1 = 0L;
        long eligibleDay7 = 0L;
        long retainedDay7 = 0L;
        long eligibleDay30 = 0L;
        long retainedDay30 = 0L;

        Map<LocalDate, List<User>> cohortsByWeekStart = new HashMap<>();
        for (User user : platformUsers) {
            LocalDate createdDate = toLocalDate(user.getCreatedAt());
            if (createdDate == null) {
                continue;
            }

            Set<LocalDate> activityDates = activityDatesByUser.getOrDefault(user.getId(), Set.of());
            if (!today.isBefore(createdDate.plusDays(1))) {
                eligibleDay1++;
                if (hasActivityInWindow(activityDates, createdDate.plusDays(1), createdDate.plusDays(1))) {
                    retainedDay1++;
                }
            }
            if (!today.isBefore(createdDate.plusDays(7))) {
                eligibleDay7++;
                if (hasActivityInWindow(activityDates, createdDate.plusDays(1), createdDate.plusDays(7))) {
                    retainedDay7++;
                }
            }
            if (!today.isBefore(createdDate.plusDays(30))) {
                eligibleDay30++;
                if (hasActivityInWindow(activityDates, createdDate.plusDays(1), createdDate.plusDays(30))) {
                    retainedDay30++;
                }
            }

            LocalDate cohortStart = createdDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            cohortsByWeekStart.computeIfAbsent(cohortStart, ignored -> new ArrayList<>()).add(user);
        }

        Map<String, Object> overall = new LinkedHashMap<>();
        overall.put("day1Rate", calculatePercentage(retainedDay1, eligibleDay1));
        overall.put("day7Rate", calculatePercentage(retainedDay7, eligibleDay7));
        overall.put("day30Rate", calculatePercentage(retainedDay30, eligibleDay30));
        overall.put("eligibleDay1Users", eligibleDay1);
        overall.put("eligibleDay7Users", eligibleDay7);
        overall.put("eligibleDay30Users", eligibleDay30);

        List<LocalDate> sortedCohortStarts = new ArrayList<>(cohortsByWeekStart.keySet());
        sortedCohortStarts.sort(Comparator.reverseOrder());

        List<Map<String, Object>> cohorts = new ArrayList<>();
        int maxCohorts = 8;
        for (int i = 0; i < sortedCohortStarts.size() && i < maxCohorts; i++) {
            LocalDate cohortStart = sortedCohortStarts.get(i);
            List<User> cohortUsers = cohortsByWeekStart.getOrDefault(cohortStart, List.of());

            long cohortEligibleDay1 = 0L;
            long cohortRetainedDay1 = 0L;
            long cohortEligibleDay7 = 0L;
            long cohortRetainedDay7 = 0L;
            long cohortEligibleDay30 = 0L;
            long cohortRetainedDay30 = 0L;

            for (User user : cohortUsers) {
                LocalDate createdDate = toLocalDate(user.getCreatedAt());
                if (createdDate == null) {
                    continue;
                }
                Set<LocalDate> activityDates = activityDatesByUser.getOrDefault(user.getId(), Set.of());

                if (!today.isBefore(createdDate.plusDays(1))) {
                    cohortEligibleDay1++;
                    if (hasActivityInWindow(activityDates, createdDate.plusDays(1), createdDate.plusDays(1))) {
                        cohortRetainedDay1++;
                    }
                }
                if (!today.isBefore(createdDate.plusDays(7))) {
                    cohortEligibleDay7++;
                    if (hasActivityInWindow(activityDates, createdDate.plusDays(1), createdDate.plusDays(7))) {
                        cohortRetainedDay7++;
                    }
                }
                if (!today.isBefore(createdDate.plusDays(30))) {
                    cohortEligibleDay30++;
                    if (hasActivityInWindow(activityDates, createdDate.plusDays(1), createdDate.plusDays(30))) {
                        cohortRetainedDay30++;
                    }
                }
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("cohortStart", formatDate(cohortStart));
            row.put("users", (long) cohortUsers.size());
            row.put("day1Rate", calculatePercentage(cohortRetainedDay1, cohortEligibleDay1));
            row.put("day7Rate", calculatePercentage(cohortRetainedDay7, cohortEligibleDay7));
            row.put("day30Rate", calculatePercentage(cohortRetainedDay30, cohortEligibleDay30));
            cohorts.add(row);
        }

        Map<String, Object> retention = new LinkedHashMap<>();
        retention.put("overall", overall);
        retention.put("cohorts", cohorts);
        return retention;
    }

    private List<Map<String, Object>> buildLifecycleStates(
            List<User> platformUsers,
            Map<Long, Long> goalsByUser,
            Map<Long, Long> activityCountByUser,
            Map<Long, LocalDate> lastActivityDateByUser,
            LocalDate today) {
        LinkedHashMap<String, Long> counts = new LinkedHashMap<>();
        counts.put("New", 0L);
        counts.put("Onboarding", 0L);
        counts.put("Activated", 0L);
        counts.put("At Risk", 0L);
        counts.put("Dormant", 0L);
        counts.put("Churned", 0L);

        for (User user : platformUsers) {
            String state = determineLifecycleState(
                    user,
                    goalsByUser.getOrDefault(user.getId(), 0L),
                    activityCountByUser.getOrDefault(user.getId(), 0L),
                    lastActivityDateByUser.get(user.getId()),
                    today);
            counts.put(state, counts.getOrDefault(state, 0L) + 1L);
        }

        long totalUsers = platformUsers.size();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, Long> entry : counts.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("state", entry.getKey());
            row.put("users", entry.getValue());
            row.put("percentage", calculatePercentage(entry.getValue(), totalUsers));
            rows.add(row);
        }
        return rows;
    }

    private String determineLifecycleState(
            User user,
            long goalsCount,
            long totalActivities,
            LocalDate lastActivityDate,
            LocalDate today) {
        LocalDate createdDate = toLocalDate(user.getCreatedAt());
        if (createdDate == null) {
            createdDate = today;
        }

        long accountAgeDays = Math.max(0L, ChronoUnit.DAYS.between(createdDate, today));
        if (accountAgeDays <= 7) {
            return "New";
        }

        if (totalActivities == 0) {
            if (goalsCount > 0 && accountAgeDays <= 21) {
                return "Onboarding";
            }
            return "Churned";
        }

        if (lastActivityDate == null) {
            return "Onboarding";
        }

        long daysSinceLastActivity = Math.max(0L, ChronoUnit.DAYS.between(lastActivityDate, today));
        if (daysSinceLastActivity <= 7) {
            return totalActivities >= 3 ? "Activated" : "Onboarding";
        }
        if (daysSinceLastActivity <= 30) {
            return "At Risk";
        }
        if (daysSinceLastActivity <= 60) {
            return "Dormant";
        }
        return "Churned";
    }

    private List<Map<String, Object>> buildFeatureUsageTracking(
            long totalUsers,
            long usersWithGoals,
            long totalGoals,
            long goalsCreatedLast7Days,
            long usersWithActivity,
            long totalActivityEvents,
            long activityEventsLast7Days,
            Map<Long, Long> publicGoalsByUser,
            long totalPublicGoals,
            long publicGoalsCreatedLast7Days,
            Map<Long, Long> pointsByUser,
            long totalPointEntries,
            long pointEntriesLast7Days,
            Set<Long> badgeUsers,
            long totalBadgeAwards,
            long badgeAwardsLast7Days) {
        long usersWithPublicGoals = publicGoalsByUser.values().stream().filter(count -> count > 0).count();
        long usersWithPointEntries = pointsByUser.values().stream().filter(points -> points > 0).count();

        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(featureUsageRow(
                "Goal Creation",
                usersWithGoals,
                totalGoals,
                goalsCreatedLast7Days,
                totalUsers));
        rows.add(featureUsageRow(
                "Activity Logging",
                usersWithActivity,
                totalActivityEvents,
                activityEventsLast7Days,
                totalUsers));
        rows.add(featureUsageRow(
                "Public Goal Sharing",
                usersWithPublicGoals,
                totalPublicGoals,
                publicGoalsCreatedLast7Days,
                totalUsers));
        rows.add(featureUsageRow(
                "Points Engine",
                usersWithPointEntries,
                totalPointEntries,
                pointEntriesLast7Days,
                totalUsers));
        rows.add(featureUsageRow(
                "Badge Unlocks",
                badgeUsers.size(),
                totalBadgeAwards,
                badgeAwardsLast7Days,
                totalUsers));
        return rows;
    }

    private Map<String, Object> featureUsageRow(
            String feature,
            long users,
            long totalEvents,
            long eventsLast7Days,
            long totalUsers) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("feature", feature);
        row.put("users", users);
        row.put("adoptionRate", calculatePercentage(users, totalUsers));
        row.put("totalEvents", totalEvents);
        row.put("eventsLast7Days", eventsLast7Days);
        row.put("avgEventsPerActiveUser", calculateAverage(totalEvents, users));
        return row;
    }

    private Map<String, Object> buildDropOffAnalytics(
            List<User> platformUsers,
            Map<Long, Long> goalsByUser,
            Map<Long, Long> activityCountByUser,
            Map<Long, LocalDate> lastActivityDateByUser,
            List<Goal> goals,
            Map<Long, LocalDate> goalLastActivityDateByGoalId,
            LocalDate today,
            LocalDate fourteenDaysAgo,
            List<Map<String, Object>> funnelTracking) {
        Set<Long> platformUserIds = platformUsers.stream()
                .map(User::getId)
                .collect(HashSet::new, HashSet::add, HashSet::addAll);
        long totalUsers = platformUsers.size();
        long usersWithGoals = platformUsers.stream()
                .filter(user -> goalsByUser.getOrDefault(user.getId(), 0L) > 0)
                .count();
        long usersWithGoalsNoActivity = platformUsers.stream()
                .filter(user -> goalsByUser.getOrDefault(user.getId(), 0L) > 0
                        && activityCountByUser.getOrDefault(user.getId(), 0L) == 0L)
                .count();
        long usersWithoutGoals = totalUsers - usersWithGoals;

        long abandonedActiveGoals = goals.stream()
                .filter(goal -> platformUserIds.contains(goal.getUser().getId()))
                .filter(goal -> Boolean.TRUE.equals(goal.getIsActive()))
                .filter(goal -> {
                    LocalDate lastGoalActivity = goalLastActivityDateByGoalId.get(goal.getId());
                    return lastGoalActivity == null || lastGoalActivity.isBefore(fourteenDaysAgo);
                })
                .count();

        List<Map<String, Object>> stageDropOff = new ArrayList<>();
        Map<String, Object> largestDropOff = null;
        for (int i = 1; i < funnelTracking.size(); i++) {
            Map<String, Object> previous = funnelTracking.get(i - 1);
            Map<String, Object> current = funnelTracking.get(i);
            long previousUsers = safeMapNumber(previous.get("users"));
            long currentUsers = safeMapNumber(current.get("users"));
            long usersLost = Math.max(0L, previousUsers - currentUsers);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("fromStage", previous.get("stage"));
            row.put("toStage", current.get("stage"));
            row.put("usersLost", usersLost);
            row.put("dropOffRate", calculatePercentage(usersLost, previousUsers));
            stageDropOff.add(row);

            if (largestDropOff == null || safeMapNumber(row.get("usersLost")) > safeMapNumber(largestDropOff.get("usersLost"))) {
                largestDropOff = new LinkedHashMap<>(row);
            }
        }

        long noActivityYet = 0L;
        long activeInLast7Days = 0L;
        long inactive8To30Days = 0L;
        long dormant31To60Days = 0L;
        long churned60PlusDays = 0L;
        for (User user : platformUsers) {
            Long userId = user.getId();
            long totalActivities = activityCountByUser.getOrDefault(userId, 0L);
            if (totalActivities == 0L) {
                noActivityYet++;
                continue;
            }

            LocalDate lastActivity = lastActivityDateByUser.get(userId);
            if (lastActivity == null) {
                noActivityYet++;
                continue;
            }

            long daysSinceLastActivity = Math.max(0L, ChronoUnit.DAYS.between(lastActivity, today));
            if (daysSinceLastActivity <= 7) {
                activeInLast7Days++;
            } else if (daysSinceLastActivity <= 30) {
                inactive8To30Days++;
            } else if (daysSinceLastActivity <= 60) {
                dormant31To60Days++;
            } else {
                churned60PlusDays++;
            }
        }

        List<Map<String, Object>> inactivityBuckets = new ArrayList<>();
        inactivityBuckets.add(inactivityRow("No activity yet", noActivityYet));
        inactivityBuckets.add(inactivityRow("Active in last 7 days", activeInLast7Days));
        inactivityBuckets.add(inactivityRow("Inactive 8-30 days", inactive8To30Days));
        inactivityBuckets.add(inactivityRow("Dormant 31-60 days", dormant31To60Days));
        inactivityBuckets.add(inactivityRow("Churned 60+ days", churned60PlusDays));

        Map<String, Object> dropOffAnalytics = new LinkedHashMap<>();
        dropOffAnalytics.put("usersWithoutGoals", usersWithoutGoals);
        dropOffAnalytics.put("usersWithGoalsNoActivity", usersWithGoalsNoActivity);
        dropOffAnalytics.put("abandonedActiveGoals", abandonedActiveGoals);
        dropOffAnalytics.put("funnelDropOff", stageDropOff);
        dropOffAnalytics.put("largestDropOff", largestDropOff);
        dropOffAnalytics.put("inactivityBuckets", inactivityBuckets);
        return dropOffAnalytics;
    }

    private Map<String, Object> inactivityRow(String bucket, long users) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("bucket", bucket);
        row.put("users", users);
        return row;
    }

    private boolean hasActivityInWindow(Set<LocalDate> activityDates, LocalDate windowStart, LocalDate windowEnd) {
        if (activityDates == null || activityDates.isEmpty()) {
            return false;
        }
        for (LocalDate activityDate : activityDates) {
            if (activityDate != null
                    && !activityDate.isBefore(windowStart)
                    && !activityDate.isAfter(windowEnd)) {
                return true;
            }
        }
        return false;
    }

    private double calculatePercentage(long numerator, long denominator) {
        if (denominator <= 0L) {
            return 0D;
        }
        double raw = (numerator * 100.0D) / denominator;
        return Math.round(raw * 10.0D) / 10.0D;
    }

    private double calculateAverage(long numerator, long denominator) {
        if (denominator <= 0L) {
            return 0D;
        }
        double raw = numerator / (double) denominator;
        return Math.round(raw * 100.0D) / 100.0D;
    }

    private LocalDate toLocalDate(LocalDateTime value) {
        return value == null ? null : value.toLocalDate();
    }

    private long safeNumber(Number value) {
        return value == null ? 0L : value.longValue();
    }

    private long safeMapNumber(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return 0L;
    }

    private String formatTimestamp(LocalDateTime value) {
        return value == null ? null : value.toString();
    }

    private String formatDate(LocalDate value) {
        return value == null ? null : value.toString();
    }
}
