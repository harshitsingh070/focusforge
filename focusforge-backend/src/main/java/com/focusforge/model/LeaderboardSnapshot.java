package com.focusforge.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "leaderboard_snapshots")
@Data
public class LeaderboardSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "category_name")
    private String categoryName; // null for overall

    @Column(name = "period_type", nullable = false)
    private String periodType; // "WEEKLY", "MONTHLY", "ALL_TIME"

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "rank_position")
    private Integer rankPosition;

    @Column(name = "score")
    private Double score;

    @Column(name = "raw_points")
    private Integer rawPoints;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;
}
