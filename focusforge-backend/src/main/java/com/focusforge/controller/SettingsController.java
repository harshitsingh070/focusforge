package com.focusforge.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.focusforge.model.User;
import com.focusforge.repository.UserRepository;
import com.focusforge.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/settings")
public class SettingsController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/privacy")
    public ResponseEntity<Map<String, Object>> getPrivacySettings(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();

        // Parse JSON string to Map
        try {
            ObjectMapper mapper = new ObjectMapper();
            String privacyJson = user.getPrivacySettings();
            Map<String, Object> privacySettings = mapper.readValue(
                    privacyJson != null ? privacyJson : "{}",
                    new TypeReference<Map<String, Object>>() {
                    });
            response.put("privacySettings", privacySettings);
        } catch (Exception e) {
            response.put("privacySettings", new HashMap<>());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/privacy")
    public ResponseEntity<Map<String, Object>> updatePrivacySettings(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> privacySettings) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Convert Map to JSON string
        try {
            ObjectMapper mapper = new ObjectMapper();
            String privacyJson = mapper.writeValueAsString(privacySettings);
            user.setPrivacySettings(privacyJson);
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save privacy settings", e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Privacy settings updated successfully");
        response.put("privacySettings", privacySettings);
        return ResponseEntity.ok(response);
    }
}
