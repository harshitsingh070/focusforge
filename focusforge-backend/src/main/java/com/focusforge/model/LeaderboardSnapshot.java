package com.focusforge.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "leaderboard_snapshots")
@Data
@NoArgsConstructor
public class LeaderboardSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "category_name", length = 100)
    private String categoryName; // null for overall leaderboard

    @Column(name = "period_type", length = 20, nullable = false)
    private String periodType; // WEEKLY, MONTHLY, ALL_TIME

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "rank_position")
    private Integer rankPosition;

    @Column(name = "score")
    private Double score; // Normalized score (0-100)

    @Column(name = "raw_points")
    private Integer rawPoints;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    // Additional metadata for display
    @Transient
    private Integer daysActive;

    @Transient
    private Integer currentStreak;

    @Transient
    private Integer rankMovement;
}
