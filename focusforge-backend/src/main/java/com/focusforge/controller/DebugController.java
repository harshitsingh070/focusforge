package com.focusforge.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Count users
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            stats.put("users_count", userCount);

            // Get user names
            List<String> usernames = jdbcTemplate.queryForList("SELECT username FROM users", String.class);
            stats.put("usernames", usernames);

            // Count public goals
            Integer publicGoals = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM goals WHERE is_private = false AND is_active = true", Integer.class);
            stats.put("public_active_goals", publicGoals);

            // Count activity logs last 7 days
            Integer logs = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM activity_logs WHERE log_date >= CURRENT_DATE - INTERVAL '7 days'",
                    Integer.class);
            stats.put("recent_logs", logs);

            // Check flyway history
            List<Map<String, Object>> migrations = jdbcTemplate.queryForList(
                    "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5");
            stats.put("recent_migrations", migrations);

        } catch (Exception e) {
            stats.put("error", e.getMessage());
        }

        return ResponseEntity.ok(stats);
    }
}
