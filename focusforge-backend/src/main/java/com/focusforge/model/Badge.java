package com.focusforge.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "badges")
@Data
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    private String category;

    @Column(name = "criteria_type", nullable = false)
    private String criteriaType; // STREAK, POINTS, CONSISTENCY, DAYS_ACTIVE

    @Column(nullable = false)
    private Integer threshold;

    @Column(name = "evaluation_scope")
    private String evaluationScope = "GLOBAL"; // GLOBAL, PER_GOAL, PER_CATEGORY

    @Column(name = "target_category")
    private String targetCategory; // Used when evaluationScope is PER_CATEGORY

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "points_bonus")
    private Integer pointsBonus = 0;
}
