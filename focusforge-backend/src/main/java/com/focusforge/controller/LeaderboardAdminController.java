package com.focusforge.controller;

import com.focusforge.service.LeaderboardAggregationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/leaderboard")
@Slf4j
public class LeaderboardAdminController {

    @Autowired
    private LeaderboardAggregationService aggregationService;

    /**
     * Manual trigger for snapshot computation (for testing/admin use)
     * POST /api/leaderboard/trigger-aggregation
     */
    @PostMapping("/trigger-aggregation")
    public ResponseEntity<Map<String, Object>> triggerAggregation(
            @RequestParam(required = false) String periodType) {

        log.info("Manual aggregation triggered for period: {}", periodType);

        try {
            LocalDate today = LocalDate.now();

            if (periodType != null && !periodType.isEmpty()) {
                // Compute specific period
                aggregationService.computeAndStoreSnapshots(periodType, today);
            } else {
                // Compute all periods
                aggregationService.computeAndStoreAllSnapshots();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Leaderboard snapshots computed successfully");
            response.put("periodType", periodType != null ? periodType : "ALL");
            response.put("date", today);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error during manual aggregation", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get aggregation status/info
     * GET /api/leaderboard/aggregation-status
     */
    @GetMapping("/aggregation-status")
    public ResponseEntity<Map<String, Object>> getAggregationStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("schedulerEnabled", true);
        status.put("cronExpression", "0 0 0 * * * (Daily at midnight UTC)");
        status.put("lastRun", "Check logs for actual execution time");
        status.put("nextRun", "Next midnight UTC");

        return ResponseEntity.ok(status);
    }
}
