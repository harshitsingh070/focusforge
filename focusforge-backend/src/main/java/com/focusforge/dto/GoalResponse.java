package com.focusforge.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class GoalResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String categoryColor;
    private Integer difficulty;
    private Integer dailyMinimumMinutes;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private Boolean isPrivate;
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDateTime createdAt;
}