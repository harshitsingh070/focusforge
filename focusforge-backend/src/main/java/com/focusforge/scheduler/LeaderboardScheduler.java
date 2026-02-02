package com.focusforge.scheduler;

import com.focusforge.service.LeaderboardAggregationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class LeaderboardScheduler {

    @Autowired
    private LeaderboardAggregationService aggregationService;

    /**
     * Run daily at midnight (0:00 AM)
     * Computes snapshots for WEEKLY, MONTHLY, and ALL_TIME periods
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    public void computeDailySnapshots() {
        log.info("=== Starting scheduled leaderboard snapshot computation ===");

        try {
            aggregationService.computeAndStoreAllSnapshots();
            log.info("=== Scheduled leaderboard snapshot computation completed successfully ===");
        } catch (Exception e) {
            log.error("Error during scheduled snapshot computation", e);
        }
    }

    /**
     * Alternative: Run every hour during peak hours (optional, commented out)
     * Uncomment if you want more frequent updates
     */
    // @Scheduled(cron = "0 0 6-23 * * *", zone = "UTC") // Every hour from 6 AM to
    // 11 PM
    // public void computeHourlySnapshots() {
    // log.info("Running hourly snapshot update");
    // aggregationService.computeAndStoreAllSnapshots();
    // }
}
