package com.focusforge.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "suspicious_activities")
@Data
public class SuspiciousActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "activity_type", nullable = false)
    private String activityType;
    
    @Column(columnDefinition = "jsonb")
    private String details;
    
    @CreationTimestamp
    @Column(name = "flagged_at")
    private LocalDateTime flaggedAt;
    
    @Column(name = "reviewed")
    private Boolean reviewed = false;
    
    @Column(name = "severity")
    private String severity = "medium";
    
    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;
}