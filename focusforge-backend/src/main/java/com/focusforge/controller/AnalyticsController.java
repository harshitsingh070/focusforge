package com.focusforge.controller;

import com.focusforge.security.UserPrincipal;
import com.focusforge.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Object>> getMyAnalytics(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(currentUser.getId()));
    }
}
