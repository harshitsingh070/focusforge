package com.focusforge.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.focusforge.exception.BadRequestException;
import com.focusforge.model.User;
import com.focusforge.repository.UserRepository;
import com.focusforge.security.JwtTokenProvider;
import com.focusforge.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/settings")
public class SettingsController {

    private static final Set<String> ALLOWED_ACTIVITY_VISIBILITY = Set.of("PUBLIC", "FRIENDS", "PRIVATE");
    private static final Set<String> ALLOWED_THEMES = Set.of("system", "light", "dark");
    private static final Pattern SIMPLE_EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final int BIO_MAX_LENGTH = 500;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = loadUser(currentUser);
        Map<String, Object> rawSettings = readSettingsMap(user.getPrivacySettings());
        return ResponseEntity.ok(buildSettingsResponse(user, rawSettings, null, null));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateSettings(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> payload) {

        User user = loadUser(currentUser);
        Map<String, Object> rawSettings = readSettingsMap(user.getPrivacySettings());

        Map<String, Object> privacyCandidate = new HashMap<>(extractPrivacy(rawSettings));
        privacyCandidate.putAll(asMap(payload.get("privacy")));
        Map<String, Object> normalizedPrivacy = extractPrivacy(privacyCandidate);

        Map<String, Object> preferencesCandidate = new HashMap<>(extractPreferences(rawSettings));
        preferencesCandidate.putAll(asMap(payload.get("preferences")));
        Map<String, Object> normalizedPreferences = extractPreferences(preferencesCandidate);

        boolean identityUpdated = applyProfileUpdates(user, asMap(payload.get("profile")), rawSettings);

        rawSettings.putAll(normalizedPrivacy);
        rawSettings.putAll(normalizedPreferences);
        user.setPrivacySettings(writeSettingsMap(rawSettings));
        userRepository.save(user);

        String refreshedToken = identityUpdated ? tokenProvider.generateTokenFromUser(user) : null;
        Map<String, Object> response = buildSettingsResponse(
                user,
                rawSettings,
                refreshedToken,
                "Settings updated successfully"
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/privacy")
    public ResponseEntity<Map<String, Object>> getPrivacySettings(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = loadUser(currentUser);
        Map<String, Object> rawSettings = readSettingsMap(user.getPrivacySettings());

        Map<String, Object> response = new HashMap<>();
        response.put("privacySettings", extractPrivacy(rawSettings));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/privacy")
    public ResponseEntity<Map<String, Object>> updatePrivacySettings(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> privacySettings) {

        User user = loadUser(currentUser);
        Map<String, Object> rawSettings = readSettingsMap(user.getPrivacySettings());
        Map<String, Object> privacyCandidate = new HashMap<>(extractPrivacy(rawSettings));
        privacyCandidate.putAll(privacySettings);
        Map<String, Object> normalizedPrivacy = extractPrivacy(privacyCandidate);

        rawSettings.putAll(normalizedPrivacy);
        user.setPrivacySettings(writeSettingsMap(rawSettings));
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Privacy settings updated successfully");
        response.put("privacySettings", normalizedPrivacy);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, Object>> updatePassword(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> payload) {
        String currentPassword = sanitizeRequiredString(payload.get("currentPassword"), "Current password is required");
        String newPassword = sanitizeRequiredString(payload.get("newPassword"), "New password is required");
        String confirmPassword = sanitizeRequiredString(payload.get("confirmPassword"), "Password confirmation is required");

        if (newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new BadRequestException("New password and confirmation do not match");
        }

        if (newPassword.equals(currentPassword)) {
            throw new BadRequestException("New password must be different from current password");
        }

        User user = loadUser(currentUser);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    private User loadUser(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new BadRequestException("Current user is not authenticated");
        }

        return userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private Map<String, Object> readSettingsMap(String rawJson) {
        if (rawJson == null || rawJson.trim().isEmpty()) {
            return new HashMap<>();
        }

        try {
            Map<String, Object> parsed = mapper.readValue(rawJson, new TypeReference<Map<String, Object>>() {
            });
            return parsed != null ? new HashMap<>(parsed) : new HashMap<>();
        } catch (Exception ignored) {
            return new HashMap<>();
        }
    }

    private String writeSettingsMap(Map<String, Object> settings) {
        try {
            return mapper.writeValueAsString(settings);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize settings", e);
        }
    }

    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> rawMap) {
            Map<String, Object> mapped = new HashMap<>();
            rawMap.forEach((key, mapValue) -> {
                if (key != null) {
                    mapped.put(String.valueOf(key), mapValue);
                }
            });
            return mapped;
        }
        return new HashMap<>();
    }

    private Map<String, Object> extractPrivacy(Map<String, Object> rawSettings) {
        String visibility = "PUBLIC";
        Object visibilityValue = rawSettings.get("showActivity");
        if (visibilityValue instanceof String visibilityString) {
            String normalized = visibilityString.trim().toUpperCase();
            if (ALLOWED_ACTIVITY_VISIBILITY.contains(normalized)) {
                visibility = normalized;
            }
        }

        Map<String, Object> privacy = new HashMap<>();
        privacy.put("showActivity", visibility);
        privacy.put("showLeaderboard", toBoolean(rawSettings.get("showLeaderboard"), true));
        privacy.put("showBadges", toBoolean(rawSettings.get("showBadges"), true));
        privacy.put("showProgress", toBoolean(rawSettings.get("showProgress"), true));
        return privacy;
    }

    private Map<String, Object> extractPreferences(Map<String, Object> rawSettings) {
        String theme = "system";
        Object themeValue = rawSettings.get("theme");
        if (themeValue instanceof String themeString) {
            String normalizedTheme = themeString.trim().toLowerCase();
            if (ALLOWED_THEMES.contains(normalizedTheme)) {
                theme = normalizedTheme;
            }
        }

        Map<String, Object> preferences = new HashMap<>();
        preferences.put("theme", theme);
        preferences.put("emailReminders", toBoolean(rawSettings.get("emailReminders"), true));
        preferences.put("weeklySummary", toBoolean(rawSettings.get("weeklySummary"), true));
        return preferences;
    }

    private Map<String, Object> extractProfile(User user, Map<String, Object> rawSettings) {
        String bio = sanitizeOptionalString(rawSettings.get("profileBio"));
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("bio", bio);
        return profile;
    }

    private boolean applyProfileUpdates(User user, Map<String, Object> profilePayload, Map<String, Object> rawSettings) {
        boolean identityUpdated = false;

        if (profilePayload.containsKey("username")) {
            String username = sanitizeRequiredString(profilePayload.get("username"), "Username is required");
            if (username.length() < 3 || username.length() > 50) {
                throw new BadRequestException("Username must be between 3 and 50 characters");
            }
            if (!username.equals(user.getUsername())) {
                if (userRepository.existsByUsername(username)) {
                    throw new BadRequestException("Username is already taken");
                }
                user.setUsername(username);
                identityUpdated = true;
            }
        }

        if (profilePayload.containsKey("email")) {
            String email = sanitizeRequiredString(profilePayload.get("email"), "Email is required").toLowerCase();
            if (!SIMPLE_EMAIL_PATTERN.matcher(email).matches()) {
                throw new BadRequestException("Email should be valid");
            }
            if (!email.equals(user.getEmail())) {
                if (userRepository.existsByEmail(email)) {
                    throw new BadRequestException("Email is already taken");
                }
                user.setEmail(email);
                identityUpdated = true;
            }
        }

        if (profilePayload.containsKey("bio")) {
            String bio = sanitizeOptionalString(profilePayload.get("bio"));
            if (bio.length() > BIO_MAX_LENGTH) {
                throw new BadRequestException("Bio must be less than or equal to 500 characters");
            }
            rawSettings.put("profileBio", bio);
        }

        return identityUpdated;
    }

    private String sanitizeRequiredString(Object value, String errorMessage) {
        if (!(value instanceof String text)) {
            throw new BadRequestException(errorMessage);
        }
        String trimmed = text.trim();
        if (trimmed.isEmpty()) {
            throw new BadRequestException(errorMessage);
        }
        return trimmed;
    }

    private String sanitizeOptionalString(Object value) {
        if (value instanceof String text) {
            return text.trim();
        }
        return "";
    }

    private boolean toBoolean(Object value, boolean fallback) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value instanceof String text) {
            if ("true".equalsIgnoreCase(text.trim())) {
                return true;
            }
            if ("false".equalsIgnoreCase(text.trim())) {
                return false;
            }
        }
        return fallback;
    }

    private Map<String, Object> buildSettingsResponse(
            User user,
            Map<String, Object> rawSettings,
            String token,
            String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("privacy", extractPrivacy(rawSettings));
        response.put("preferences", extractPreferences(rawSettings));
        response.put("profile", extractProfile(user, rawSettings));
        if (token != null && !token.isBlank()) {
            response.put("token", token);
        }
        if (message != null && !message.isBlank()) {
            response.put("message", message);
        }
        return response;
    }
}
