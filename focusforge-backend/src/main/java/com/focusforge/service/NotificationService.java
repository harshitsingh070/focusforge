package com.focusforge.service;

import com.focusforge.model.DailyUserSummary;
import com.focusforge.model.User;
import com.focusforge.model.UserNotification;
import com.focusforge.repository.DailyUserSummaryRepository;
import com.focusforge.repository.StreakRepository;
import com.focusforge.repository.UserNotificationRepository;
import com.focusforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DailyUserSummaryRepository dailyUserSummaryRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Transactional
    public void createNotification(
            Long userId,
            String type,
            String title,
            String message,
            String metadata,
            LocalDateTime expiresAt) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setMetadata(metadata);
        notification.setExpiresAt(expiresAt);
        notification.setIsRead(false);

        userNotificationRepository.save(notification);
    }

    @Transactional
    public void createDailyReminderIfMissing(Long userId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().plusDays(1).atStartOfDay();
        boolean exists = userNotificationRepository.existsByUserIdAndTypeAndCreatedAtBetween(
                userId,
                "DAILY_REMINDER",
                start,
                end);

        if (exists) {
            return;
        }

        createNotification(
                userId,
                "DAILY_REMINDER",
                "Keep your streak alive today",
                "You haven’t logged activity yet today. A quick session keeps momentum.",
                null,
                LocalDateTime.now().plusDays(1));
    }

    @Transactional
    public void createWeeklySummaryIfMissing(Long userId, int weekPoints, int weekMinutes, int activeDays) {
        LocalDateTime weekStart = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                .atStartOfDay();
        LocalDateTime nextWeekStart = weekStart.plusDays(7);

        boolean exists = userNotificationRepository.existsByUserIdAndTypeAndCreatedAtBetween(
                userId,
                "WEEKLY_SUMMARY",
                weekStart,
                nextWeekStart);
        if (exists) {
            return;
        }

        String message = String.format(
                "Last 7 days: %d points, %d minutes, %d active days.",
                weekPoints,
                weekMinutes,
                activeDays);

        createNotification(
                userId,
                "WEEKLY_SUMMARY",
                "Your weekly progress summary",
                message,
                null,
                null);
    }

    @Transactional
    public void createStreakRiskAlertIfMissing(Long userId, int currentStreak) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().plusDays(1).atStartOfDay();
        boolean exists = userNotificationRepository.existsByUserIdAndTypeAndCreatedAtBetween(
                userId,
                "STREAK_RISK",
                start,
                end);
        if (exists) {
            return;
        }

        createNotification(
                userId,
                "STREAK_RISK",
                "Your streak is at risk",
                String.format("You are on a %d-day streak. Log at least one session today to keep it going.", currentStreak),
                null,
                LocalDateTime.now().plusDays(1));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserNotifications(Long userId) {
        List<UserNotification> stored = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> n.getExpiresAt() == null || n.getExpiresAt().isAfter(LocalDateTime.now()))
                .limit(50)
                .toList();

        List<Map<String, Object>> notifications = new ArrayList<>();
        for (UserNotification n : stored) {
            notifications.add(toDto(n));
        }

        return Map.of(
                "notifications", notifications,
                "unreadCount", stored.stream().filter(n -> !Boolean.TRUE.equals(n.getIsRead())).count());
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        UserNotification notification = userNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        notification.setIsRead(true);
        userNotificationRepository.save(notification);
    }

    @Transactional
    public void autoGenerateNotifications(Long userId) {
        LocalDate today = LocalDate.now();
        DailyUserSummary todaySummary = dailyUserSummaryRepository.findByUserIdAndSummaryDate(userId, today).orElse(null);
        if (todaySummary == null || !Boolean.TRUE.equals(todaySummary.getActiveFlag())) {
            createDailyReminderIfMissing(userId);
        }

        int maxStreak = streakRepository.findMaxCurrentStreakByUserId(userId);
        if (maxStreak > 0 && (todaySummary == null || !Boolean.TRUE.equals(todaySummary.getActiveFlag()))) {
            createStreakRiskAlertIfMissing(userId, maxStreak);
        }

        LocalDate weekStartDate = today.minusDays(6);
        List<DailyUserSummary> weekSummaries = dailyUserSummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(userId, weekStartDate, today);
        int weekPoints = weekSummaries.stream().mapToInt(s -> safeInt(s.getTotalPoints())).sum();
        int weekMinutes = weekSummaries.stream().mapToInt(s -> safeInt(s.getTotalMinutes())).sum();
        int activeDays = (int) weekSummaries.stream().filter(s -> Boolean.TRUE.equals(s.getActiveFlag())).count();

        createWeeklySummaryIfMissing(userId, weekPoints, weekMinutes, activeDays);
    }

    private Map<String, Object> toDto(UserNotification notification) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", notification.getId());
        dto.put("type", notification.getType());
        dto.put("title", notification.getTitle());
        dto.put("message", notification.getMessage());
        dto.put("metadata", notification.getMetadata());
        dto.put("isRead", notification.getIsRead());
        dto.put("createdAt", notification.getCreatedAt());
        dto.put("expiresAt", notification.getExpiresAt());
        return dto;
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }
}
