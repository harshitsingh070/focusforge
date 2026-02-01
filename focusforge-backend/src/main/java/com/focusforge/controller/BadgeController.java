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

    @GetMapping("/my-badges")
    public ResponseEntity<Map<String, Object>> getMyBadges(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(badgeService.getUserBadges(currentUser.getId()));
    }

    @GetMapping("/available")
    public ResponseEntity<Map<String, Object>> getAvailableBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }
}
