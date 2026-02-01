package com.focusforge.controller;

import com.focusforge.dto.DashboardDTO;
import com.focusforge.security.UserPrincipal;
import com.focusforge.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardDTO dashboard = dashboardService.getDashboard(currentUser.getId());
        return ResponseEntity.ok(dashboard);
    }
}