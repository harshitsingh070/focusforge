package com.focusforge.service;

import com.focusforge.repository.PointLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    @Autowired
    private PointLedgerRepository pointLedgerRepository;

    public Map<String, Object> getCategoryLeaderboard(String category, int limit) {
        // Get top users by points in a specific category within last 30 days
        LocalDate since = LocalDate.now().minusDays(30);

        List<Object[]> allResults = pointLedgerRepository.findTopUsersByCategory(category, since);
        List<Map<String, Object>> rankings = allResults.stream()
                .limit(limit)
                .map(result -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("userId", result[0]);
                    entry.put("username", result[1]);
                    entry.put("totalPoints", result[2]);
                    entry.put("category", category);
                    return entry;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("category", category);
        response.put("rankings", rankings);
        response.put("period", "Last 30 days");
        return response;
    }

    public Map<String, Object> getOverallLeaderboard(int limit) {
        // Overall leaderboard with normalized scores
        LocalDate since = LocalDate.now().minusDays(30);

        List<Object[]> allResults = pointLedgerRepository.findTopUsers(since);
        List<Map<String, Object>> rankings = allResults.stream()
                .limit(limit)
                .map(result -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("userId", result[0]);
                    entry.put("username", result[1]);
                    entry.put("totalPoints", result[2]);
                    return entry;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("rankings", rankings);
        response.put("period", "Last 30 days");
        return response;
    }

    public Map<String, Object> getUserRank(Long userId) {
        // Get user's rank in different categories
        LocalDate since = LocalDate.now().minusDays(30);
        Map<String, Object> userRanks = new HashMap<>();

        // Overall rank
        Integer overallRank = pointLedgerRepository.getUserOverallRank(userId, since);
        userRanks.put("overallRank", overallRank);

        // Category-specific ranks
        Map<String, Integer> categoryRanks = new HashMap<>();
        String[] categories = { "Coding", "Health", "Reading", "Academics", "Career Skills" };

        for (String category : categories) {
            Integer rank = pointLedgerRepository.getUserCategoryRank(userId, category, since);
            if (rank != null) {
                categoryRanks.put(category, rank);
            }
        }

        userRanks.put("categoryRanks", categoryRanks);
        return userRanks;
    }
}
