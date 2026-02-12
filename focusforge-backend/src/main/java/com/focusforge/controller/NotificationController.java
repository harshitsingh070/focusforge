package com.focusforge.controller;

import com.focusforge.security.UserPrincipal;
import com.focusforge.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyNotifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        notificationService.autoGenerateNotifications(currentUser.getId());
        return ResponseEntity.ok(notificationService.getUserNotifications(currentUser.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        notificationService.markAsRead(currentUser.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
