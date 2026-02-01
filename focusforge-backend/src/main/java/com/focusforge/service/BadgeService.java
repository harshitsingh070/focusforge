package com.focusforge.service;

import com.focusforge.model.Badge;
import com.focusforge.model.UserBadge;
import com.focusforge.repository.BadgeRepository;
import com.focusforge.repository.UserBadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    public Map<String, Object> getUserBadges(Long userId) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdOrderByAwardedAtDesc(userId);

        List<Map<String, Object>> badges = userBadges.stream()
                .map(ub -> {
                    Map<String, Object> badgeInfo = new HashMap<>();
                    badgeInfo.put("id", ub.getBadge().getId());
                    badgeInfo.put("name", ub.getBadge().getName());
                    badgeInfo.put("description", ub.getBadge().getDescription());
                    badgeInfo.put("iconUrl", ub.getBadge().getIconUrl());
                    badgeInfo.put("category", ub.getBadge().getCategory());
                    badgeInfo.put("earnedAt", ub.getAwardedAt()); // Use awardedAt field
                    return badgeInfo;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("badges", badges);
        response.put("totalCount", badges.size());
        return response;
    }

    public Map<String, Object> getAllBadges() {
        List<Badge> allBadges = badgeRepository.findAll();

        List<Map<String, Object>> badges = allBadges.stream()
                .map(badge -> {
                    Map<String, Object> badgeInfo = new HashMap<>();
                    badgeInfo.put("id", badge.getId());
                    badgeInfo.put("name", badge.getName());
                    badgeInfo.put("description", badge.getDescription());
                    badgeInfo.put("iconUrl", badge.getIconUrl());
                    badgeInfo.put("category", badge.getCategory());
                    badgeInfo.put("criteriaType", badge.getCriteriaType());
                    badgeInfo.put("threshold", badge.getThreshold());
                    return badgeInfo;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("badges", badges);
        return response;
    }
}
