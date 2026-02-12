package com.focusforge.service;

import com.focusforge.event.ActivityLoggedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
public class LeaderboardRefreshListener {

    @Autowired
    private LeaderboardAggregationService leaderboardAggregationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleActivityLogged(ActivityLoggedEvent event) {
        try {
            leaderboardAggregationService.refreshSnapshotsForActivity(event.categoryName(), event.logDate());
        } catch (Exception ex) {
            log.error("Automatic leaderboard refresh failed for category {} on {}: {}",
                    event.categoryName(), event.logDate(), ex.getMessage(), ex);
        }
    }
}
