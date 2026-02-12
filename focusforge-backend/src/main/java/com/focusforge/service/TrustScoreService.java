package com.focusforge.service;

import com.focusforge.model.SuspiciousActivity;
import com.focusforge.repository.SuspiciousActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TrustScoreService {

    @Autowired
    private SuspiciousActivityRepository suspiciousActivityRepository;

    public int getTrustScore(Long userId) {
        List<SuspiciousActivity> signals = suspiciousActivityRepository.findByUserIdOrderByFlaggedAtDesc(userId);
        if (signals.isEmpty()) {
            return 100;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime sevenDaysAgo = now.minusDays(7);

        int penalty = 0;
        int last7DaysSignals = 0;

        for (SuspiciousActivity signal : signals) {
            if (signal.getFlaggedAt() == null || signal.getFlaggedAt().isBefore(thirtyDaysAgo)) {
                continue;
            }

            int weight = severityWeight(signal.getSeverity(), Boolean.TRUE.equals(signal.getReviewed()));
            penalty += weight;

            if (!signal.getFlaggedAt().isBefore(sevenDaysAgo)) {
                last7DaysSignals++;
            }
        }

        if (last7DaysSignals >= 3) {
            penalty += (last7DaysSignals - 2) * 4;
        }

        return Math.max(0, 100 - penalty);
    }

    public Map<String, Object> getTrustSummary(Long userId) {
        int score = getTrustScore(userId);
        String band = score >= 85 ? "HIGH" : score >= 65 ? "MEDIUM" : "LOW";

        List<SuspiciousActivity> recent = suspiciousActivityRepository.findByUserIdOrderByFlaggedAtDesc(userId)
                .stream()
                .filter(a -> a.getFlaggedAt() != null && a.getFlaggedAt().isAfter(LocalDateTime.now().minusDays(30)))
                .toList();

        Map<String, Long> byType = recent.stream()
                .collect(Collectors.groupingBy(
                        SuspiciousActivity::getActivityType,
                        Collectors.counting()));

        return Map.of(
                "score", score,
                "band", band,
                "signalsLast30Days", recent.size(),
                "signalBreakdown", byType);
    }

    private int severityWeight(String severity, boolean reviewed) {
        String normalized = severity == null ? "medium" : severity.toLowerCase(Locale.ROOT);
        int base = switch (normalized) {
            case "high" -> 15;
            case "low" -> 3;
            default -> 8;
        };
        return reviewed ? Math.max(1, base / 3) : base;
    }
}
