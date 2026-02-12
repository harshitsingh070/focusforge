package com.focusforge.service;

import com.focusforge.model.SuspiciousActivity;
import com.focusforge.model.ActivityLog;
import com.focusforge.model.User;
import com.focusforge.repository.ActivityLogRepository;
import com.focusforge.repository.SuspiciousActivityRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class AntiCheatService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private SuspiciousActivityRepository suspiciousActivityRepository;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Autowired
    private TrustScoreService trustScoreService;

    @Value("${gamification.max-minutes-per-entry}")
    private int maxMinutesPerEntry;

    @Value("${gamification.max-minutes-per-day}")
    private int maxMinutesPerDay;

    private static final String RATE_LIMIT_KEY = "rate_limit:";
    private static final int MAX_LOGS_PER_HOUR = 10;

    public boolean isSuspiciousEntry(Long userId, int minutesSpent) {
        return isSuspiciousEntry(userId, minutesSpent, LocalDate.now());
    }

    public boolean isSuspiciousEntry(Long userId, int minutesSpent, LocalDate referenceDate) {
        if (minutesSpent > maxMinutesPerEntry) {
            return true;
        }

        Integer todayTotal = activityLogRepository.getTotalMinutesForDate(userId, referenceDate);
        int currentTotal = todayTotal != null ? todayTotal : 0;
        return (currentTotal + minutesSpent) > maxMinutesPerDay;
    }

    public boolean validateActivity(Long userId, int minutesSpent) {
        return validateActivity(userId, minutesSpent, LocalDate.now());
    }

    public boolean validateActivity(Long userId, int minutesSpent, LocalDate referenceDate) {
        // Check unrealistic single entry
        if (isSuspiciousEntry(userId, minutesSpent, referenceDate)) {
            log.warn("Suspicious activity: User {} entered {} minutes (max allowed: {})",
                    userId, minutesSpent, maxMinutesPerEntry);
            return false;
        }

        // Rate limiting check (only if Redis is available)
        if (redisTemplate != null) {
            try {
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
            } catch (Exception e) {
                log.warn("Redis not available for rate limiting: {}", e.getMessage());
                // Continue without rate limiting
            }
        }

        return true;
    }

    public void flagSuspiciousActivity(User user, String type, String details) {
        flagSuspiciousActivity(user, type, details, "high");
    }

    public void flagSuspiciousActivity(User user, String type, String details, String severity) {
        SuspiciousActivity flag = new SuspiciousActivity();
        flag.setUser(user);
        flag.setActivityType(type);
        flag.setDetails("{\"details\":\"" + details + "\"}");
        flag.setSeverity(severity);

        suspiciousActivityRepository.save(flag);
        log.warn("Flagged suspicious activity: {} for user {}", type, user.getId());

        if (notificationService != null) {
            notificationService.createNotification(
                    user.getId(),
                    "TRUST_ALERT",
                    "Suspicious activity detected",
                    "One of your logs was flagged for unusual patterns. Keep entries realistic to protect your trust score.",
                    String.format("{\"type\":\"%s\",\"severity\":\"%s\"}", type, severity),
                    LocalDateTime.now().plusDays(7));
        }
    }

    public boolean detectDuplicatePattern(Long userId, Long goalId, int minutesSpent, LocalDate logDate) {
        List<ActivityLog> recentLogs = activityLogRepository
                .findTop5ByUserIdAndGoalIdOrderByLogDateDescCreatedAtDesc(userId, goalId);
        if (recentLogs.size() < 3) {
            return false;
        }

        long sameMinutesCount = recentLogs.stream()
                .filter(log -> log.getMinutesSpent() != null && log.getMinutesSpent() == minutesSpent)
                .count();

        boolean hasConsecutivePattern = recentLogs.stream()
                .limit(3)
                .allMatch(log -> log.getLogDate() != null
                        && Math.abs(ChronoUnit.DAYS.between(log.getLogDate(), logDate)) <= 3);

        return sameMinutesCount >= 3 && hasConsecutivePattern;
    }

    public boolean isUserUnderReview(Long userId) {
        return suspiciousActivityRepository.existsByUserIdAndReviewedFalse(userId);
    }

    public int getTrustScore(Long userId) {
        return trustScoreService.getTrustScore(userId);
    }
}
