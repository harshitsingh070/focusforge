package com.focusforge.controller;

import com.focusforge.security.UserPrincipal;
import com.focusforge.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getAdminOverview(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null || !adminDashboardService.isAdminEmail(currentUser.getEmail())) {
            throw new AccessDeniedException("Admin access required");
        }
        return ResponseEntity.ok(adminDashboardService.getOverview());
    }
}
