package com.focusforge.controller;

import com.focusforge.model.*;
import com.focusforge.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/diagnostic")
public class DiagnosticController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private GoalRepository goalRepository;

        @Autowired
        private ActivityLogRepository activityLogRepository;

        @Autowired
        private PointLedgerRepository pointLedgerRepository;

        @Autowired
        private StreakRepository streakRepository;

        @GetMapping("/leaderboard-data")
        public ResponseEntity<Map<String, Object>> checkLeaderboardData() {
                Map<String, Object> diagnostics = new HashMap<>();

                // Check users
                List<User> allUsers = userRepository.findAll();
                diagnostics.put("totalUsers", allUsers.size());
                diagnostics.put("users", allUsers.stream()
                                .map(u -> Map.of(
                                                "id", u.getId(),
                                                "username", u.getUsername(),
                                                "privacySettings",
                                                u.getPrivacySettings() != null ? u.getPrivacySettings() : "null"))
                                .toList());

                // Check goals
                List<Goal> allGoals = goalRepository.findAll();
                diagnostics.put("totalGoals", allGoals.size());

                List<Goal> publicGoals = allGoals.stream()
                                .filter(g -> !g.getIsPrivate() && g.getIsActive())
                                .toList();
                diagnostics.put("publicActiveGoals", publicGoals.size());
                diagnostics.put("goals", allGoals.stream()
                                .map(g -> Map.of(
                                                "id", g.getId(),
                                                "title", g.getTitle(),
                                                "userId", g.getUser().getId(),
                                                "category",
                                                g.getCategory() != null ? g.getCategory().getName() : "null",
                                                "isPrivate", g.getIsPrivate(),
                                                "isActive", g.getIsActive()))
                                .toList());

                // Check activity logs (recent)
                LocalDate weekAgo = LocalDate.now().minusDays(7);
                List<ActivityLog> recentActivities = activityLogRepository.findAll().stream()
                                .filter(a -> a.getLogDate().isAfter(weekAgo) || a.getLogDate().isEqual(weekAgo))
                                .toList();
                diagnostics.put("recentActivityLogs", recentActivities.size());
                diagnostics.put("activities", recentActivities.stream()
                                .map(a -> Map.of(
                                                "id", a.getId(),
                                                "userId", a.getUser().getId(),
                                                "goalId", a.getGoal().getId(),
                                                "logDate", a.getLogDate().toString(),
                                                "minutes", a.getMinutesSpent()))
                                .toList());

                // Check point ledger
                List<PointLedger> allPoints = pointLedgerRepository.findAll();
                diagnostics.put("totalPointEntries", allPoints.size());

                List<PointLedger> recentPoints = allPoints.stream()
                                .filter(p -> p.getReferenceDate() != null &&
                                                (p.getReferenceDate().isAfter(weekAgo)
                                                                || p.getReferenceDate().isEqual(weekAgo)))
                                .toList();
                diagnostics.put("recentPointEntries", recentPoints.size());
                diagnostics.put("pointEntries", allPoints.stream()
                                .map(p -> Map.of(
                                                "id", p.getId(),
                                                "userId", p.getUser().getId(),
                                                "goalId", p.getGoal() != null ? p.getGoal().getId() : "null",
                                                "points", p.getPoints(),
                                                "reason", p.getReason(),
                                                "referenceDate",
                                                p.getReferenceDate() != null ? p.getReferenceDate().toString()
                                                                : "null"))
                                .toList());

                // Check streaks
                List<Streak> allStreaks = streakRepository.findAll();
                diagnostics.put("totalStreaks", allStreaks.size());
                diagnostics.put("streaks", allStreaks.stream()
                                .map(s -> Map.of(
                                                "goalId", s.getGoal().getId(),
                                                "currentStreak", s.getCurrentStreak(),
                                                "longestStreak", s.getLongestStreak(),
                                                "lastActivityDate",
                                                s.getLastActivityDate() != null ? s.getLastActivityDate().toString()
                                                                : "null"))
                                .toList());

                // Check Coding category specifically
                List<Goal> codingGoals = goalRepository.findPublicGoalsByCategory("Coding");
                diagnostics.put("publicCodingGoals", codingGoals.size());

                return ResponseEntity.ok(diagnostics);
        }
}
