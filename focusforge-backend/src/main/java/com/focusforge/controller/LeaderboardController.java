package com.focusforge.controller;

import com.focusforge.security.UserPrincipal;
import com.focusforge.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/leaderboard")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getCategoryLeaderboard(
            @PathVariable String category,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(leaderboardService.getCategoryLeaderboard(category, limit));
    }

    @GetMapping("/overall")
    public ResponseEntity<Map<String, Object>> getOverallLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(leaderboardService.getOverallLeaderboard(limit));
    }

    @GetMapping("/my-rank")
    public ResponseEntity<Map<String, Object>> getMyRank(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(leaderboardService.getUserRank(currentUser.getId()));
    }
}
