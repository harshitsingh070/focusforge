package com.focusforge.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ActivityResponse {
    private Long id;
    private Long goalId;
    private String goalTitle;
    private LocalDate logDate;
    private Integer minutesSpent;
    private Integer pointsEarned;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalPoints;
    private String notes;
    private boolean suspicious;
    private String message;
}