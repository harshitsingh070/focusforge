package com.focusforge.service;

import com.focusforge.model.ActivityLog;
import com.focusforge.model.Goal;
import com.focusforge.model.PointLedger;
import com.focusforge.model.User;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.GoalRepository;
import com.focusforge.repository.PointLedgerRepository;
import com.focusforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
        LocalDate trafficStart = today.minusDays(13);
        LocalDateTime dayAgoTimestamp = LocalDateTime.now().minusHours(24);
        LocalDateTime monthAgoTimestamp = LocalDateTime.now().minusDays(30);

        List<User> users = userRepository.findAll();
        Set<Long> adminUserIds = users.stream()
                .filter(user -> isAdminEmail(user.getEmail()))
                .map(User::getId)
                .collect(HashSet::new, HashSet::add, HashSet::addAll);
        List<User> platformUsers = users.stream()
                .filter(user -> !isAdminEmail(user.getEmail()))
                .toList();
        List<Goal> goals = goalRepository.findAll();
        List<ActivityLog> activityLogs = activityLogRepository.findAll();
        List<PointLedger> pointEntries = pointLedgerRepository.findAll();

        Map<Long, Long> goalsByUser = new HashMap<>();
        Map<Long, Long> activeGoalsByUser = new HashMap<>();
        for (Goal goal : goals) {
            Long userId = goal.getUser().getId();
            if (adminUserIds.contains(userId)) {
                continue;
            }
            goalsByUser.merge(userId, 1L, Long::sum);
            if (Boolean.TRUE.equals(goal.getIsActive())) {
                activeGoalsByUser.merge(userId, 1L, Long::sum);
            }
        }

        Map<Long, Long> activityCountByUser = new HashMap<>();
        Map<Long, Long> minutesByUser = new HashMap<>();
        Map<Long, LocalDate> lastActivityDateByUser = new HashMap<>();
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

            if (lastActivityDateByUser.get(userId) == null || logDate.isAfter(lastActivityDateByUser.get(userId))) {
                lastActivityDateByUser.put(userId, logDate);
            }

            if (!logDate.isBefore(sevenDaysAgo)) {
                activitiesLast7Days++;
                uniqueUsersLast7Days.add(userId);
            }

            if (activityLog.getCreatedAt() != null && !activityLog.getCreatedAt().isBefore(dayAgoTimestamp)) {
                activitiesLast24Hours++;
            }

            if (!logDate.isBefore(trafficStart) && !logDate.isAfter(today)) {
                activityCountByDate.merge(logDate, 1L, Long::sum);
                minutesByDate.merge(logDate, minutes, Long::sum);
                activeUsersByDate.computeIfAbsent(logDate, d -> new HashSet<>()).add(userId);
            }
        }

        Map<Long, Long> pointsByUser = new HashMap<>();
        Map<Long, Long> pointsLast7DaysByUser = new HashMap<>();
        Map<LocalDate, Long> pointsByDate = new HashMap<>();
        long filteredPointEntries = 0L;
        long totalPointsAwarded = 0L;

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
            }

            if (referenceDate != null && !referenceDate.isBefore(trafficStart) && !referenceDate.isAfter(today)) {
                pointsByDate.merge(referenceDate, points, Long::sum);
                activeUsersByDate.computeIfAbsent(referenceDate, d -> new HashSet<>()).add(userId);
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
        return response;
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
