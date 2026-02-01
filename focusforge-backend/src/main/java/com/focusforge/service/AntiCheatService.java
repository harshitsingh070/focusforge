package com.focusforge.service;

import com.focusforge.model.SuspiciousActivity;
import com.focusforge.model.User;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.SuspiciousActivityRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class AntiCheatService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private SuspiciousActivityRepository suspiciousActivityRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Value("${gamification.max-minutes-per-entry}")
    private int maxMinutesPerEntry;

    @Value("${gamification.max-minutes-per-day}")
    private int maxMinutesPerDay;

    private static final String RATE_LIMIT_KEY = "rate_limit:";
    private static final int MAX_LOGS_PER_HOUR = 10;

    public boolean validateActivity(Long userId, int minutesSpent) {
        // Check unrealistic single entry
        if (minutesSpent > maxMinutesPerEntry) {
            log.warn("Suspicious activity: User {} entered {} minutes (max allowed: {})", 
                    userId, minutesSpent, maxMinutesPerEntry);
            return false;
        }

        // Check daily total
        Integer todayTotal = activityLogRepository.getTotalMinutesForDate(userId, LocalDate.now());
        int currentTotal = todayTotal != null ? todayTotal : 0;
        
        if ((currentTotal + minutesSpent) > maxMinutesPerDay) {
            log.warn("Daily limit exceeded for user {}: current {}, adding {}", 
                    userId, currentTotal, minutesSpent);
            return false;
        }

        // Rate limiting check
        String key = RATE_LIMIT_KEY + userId;
        String count = redisTemplate.opsForValue().get(key);
        
        if (count != null && Integer.parseInt(count) >= MAX_LOGS_PER_HOUR) {
            log.warn("Rate limit exceeded for user {}", userId);
            return false;
        }

        // Increment rate limiter
        if (count == null) {
            redisTemplate.opsForValue().set(key, "1", 1, TimeUnit.HOURS);
        } else {
            redisTemplate.opsForValue().increment(key);
        }

        return true;
    }

    public void flagSuspiciousActivity(User user, String type, String details) {
        SuspiciousActivity flag = new SuspiciousActivity();
        flag.setUser(user);
        flag.setActivityType(type);
        flag.setDetails("{\"details\":\"" + details + "\"}");
        flag.setSeverity("high");
        
        suspiciousActivityRepository.save(flag);
        log.warn("Flagged suspicious activity: {} for user {}", type, user.getId());
    }

    public boolean isUserUnderReview(Long userId) {
        return suspiciousActivityRepository.existsByUserIdAndReviewedFalse(userId);
    }
}