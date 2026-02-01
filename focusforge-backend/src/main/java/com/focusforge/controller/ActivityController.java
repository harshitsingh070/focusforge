package com.focusforge.controller;

import com.focusforge.dto.ActivityRequest;
import com.focusforge.dto.ActivityResponse;
import com.focusforge.security.UserPrincipal;
import com.focusforge.service.ActivityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @PostMapping("/log")
    public ResponseEntity<ActivityResponse> logActivity(@Valid @RequestBody ActivityRequest request,
                                                       @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(activityService.logActivity(request, currentUser.getId()));
    }
}