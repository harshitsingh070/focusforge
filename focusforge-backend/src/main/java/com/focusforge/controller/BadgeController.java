package com.focusforge.controller;

import com.focusforge.security.UserPrincipal;
import com.focusforge.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/badges")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private com.focusforge.service.BadgeEvaluationService badgeEvaluationService;

    @GetMapping("/my-badges")
    public ResponseEntity<Map<String, Object>> getMyBadges(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(badgeService.getUserBadges(currentUser.getId()));
    }

    @GetMapping("/available")
    public ResponseEntity<Map<String, Object>> getAvailableBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllBadgesWithProgress(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(badgeService.getAllBadgesWithProgress(currentUser.getId()));
    }

    /**
     * Backfill badges for all users.
     * Evaluates all existing users and awards badges they qualify for.
     * Useful after adding new badges to the system.
     */
    @PostMapping("/backfill")
    public ResponseEntity<Map<String, Object>> backfillBadges() {
        Map<Long, java.util.List<com.focusforge.model.Badge>> results = badgeEvaluationService.backfillAllUserBadges();

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("usersEvaluated", results.size());
        response.put("totalBadgesAwarded", results.values().stream()
                .mapToInt(java.util.List::size)
                .sum());
        response.put("message", "Badge backfill completed successfully");

        return ResponseEntity.ok(response);
    }
}
