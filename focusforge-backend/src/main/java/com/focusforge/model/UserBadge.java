package com.focusforge.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges")
@Data
public class UserBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;
    
    @CreationTimestamp
    @Column(name = "awarded_at")
    private LocalDateTime awardedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_goal_id")
    private Goal relatedGoal;
}