package com.focusforge.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GoalRequest {
    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    @NotNull(message = "Difficulty is required")
    @Min(value = 1, message = "Difficulty must be between 1 and 5")
    @Max(value = 5, message = "Difficulty must be between 1 and 5")
    private Integer difficulty;

    @NotNull(message = "Daily minimum minutes is required")
    @Min(value = 1, message = "Daily minimum must be at least 1 minute")
    @Max(value = 1440, message = "Daily minimum cannot exceed 1440 minutes")
    private Integer dailyMinimumMinutes;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isPrivate = true;
}