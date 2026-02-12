package com.focusforge.controller;

import com.focusforge.dto.LoginRequest;
import com.focusforge.dto.SignupRequest;
import com.focusforge.service.AuthService;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @RateLimiter(name = "auth", fallbackMethod = "rateLimitFallback")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> rateLimitFallback(LoginRequest loginRequest, RequestNotPermitted ex) {
        return ResponseEntity.status(429).body(Map.of(
                "success", false,
                "message", "Too many login attempts. Please try again in a minute."
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        authService.registerUser(signupRequest);
        // Return simple map instead of MessageResponse
        return ResponseEntity.ok(Map.of("message", "User registered successfully", "success", true));
    }
}
