package com.focusforge.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_user_summary")
@Data
public class DailyUserSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "summary_date", nullable = false)
    private LocalDate summaryDate;

    @Column(name = "total_minutes", nullable = false)
    private Integer totalMinutes = 0;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 0;

    @Column(name = "active_goals", nullable = false)
    private Integer activeGoals = 0;

    @Column(name = "activities_count", nullable = false)
    private Integer activitiesCount = 0;

    @Column(name = "active_flag", nullable = false)
    private Boolean activeFlag = false;

    @Column(name = "max_streak_snapshot", nullable = false)
    private Integer maxStreakSnapshot = 0;

    @Column(name = "trust_score_snapshot", nullable = false)
    private Integer trustScoreSnapshot = 100;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
