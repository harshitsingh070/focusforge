package com.focusforge.service;

import com.focusforge.dto.LoginRequest;
import com.focusforge.dto.SignupRequest;
import com.focusforge.exception.BadRequestException;
import com.focusforge.model.User;
import com.focusforge.repository.UserRepository;
import com.focusforge.security.JwtTokenProvider;
import com.focusforge.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public Map<String, Object> authenticateUser(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            if (userPrincipal == null) {
                throw new RuntimeException("UserPrincipal is null");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("userId", userPrincipal.getId());
            response.put("username", userPrincipal.getUsernameField());
            response.put("email", userPrincipal.getEmail());

            System.out.println("User logged in: " + userPrincipal.getEmail());
            return response;

        } catch (Exception e) {
            System.err.println("Login failed for " + request.getEmail() + ": " + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void registerUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already taken");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);

        userRepository.save(user);
        System.out.println("User registered successfully: " + request.getEmail());
    }
}