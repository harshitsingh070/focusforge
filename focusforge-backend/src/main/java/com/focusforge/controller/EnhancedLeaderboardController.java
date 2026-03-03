package com.focusforge.controller;

import com.focusforge.security.UserPrincipal;
import com.focusforge.service.EnhancedLeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/leaderboard/v2")
public class EnhancedLeaderboardController {

    @Autowired
    private EnhancedLeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLeaderboard(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "MONTHLY") String period) {

        return ResponseEntity.ok(leaderboardService.getLeaderboard(category, period));
    }

    @GetMapping("/my-context")
    public ResponseEntity<Map<String, Object>> getMyRankContext(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "MONTHLY") String period) {

        return ResponseEntity.ok(
                leaderboardService.getUserRankContext(currentUser.getId(), category, period));
    }
}
