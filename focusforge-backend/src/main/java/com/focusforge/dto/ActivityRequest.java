package com.focusforge.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.focusforge.config.FlexibleLocalDateDeserializer;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class ActivityRequest {
    @NotNull(message = "Goal ID is required")
    private Long goalId;

    @NotNull(message = "Date is required")
    @JsonDeserialize(using = FlexibleLocalDateDeserializer.class)
    private LocalDate logDate;

    @NotNull(message = "Minutes spent is required")
    @Min(value = 10, message = "Must spend at least 10 minutes")
    @Max(value = 600, message = "Cannot exceed 600 minutes per entry")
    private Integer minutesSpent;

    @Size(max = 500, message = "Notes must be less than 500 characters")
    private String notes;

    // Getters
    public Long getGoalId() {
        return goalId;
    }

    public void setGoalId(Long goalId) {
        this.goalId = goalId;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public Integer getMinutesSpent() {
        return minutesSpent;
    }

    public void setMinutesSpent(Integer minutesSpent) {
        this.minutesSpent = minutesSpent;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
