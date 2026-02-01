package com.focusforge.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "streaks")
@Data
public class Streak {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false, unique = true)
    private Goal goal;
    
    @Column(name = "current_streak")
    private Integer currentStreak = 0;
    
    @Column(name = "longest_streak")
    private Integer longestStreak = 0;
    
    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public void incrementStreak() {
        this.currentStreak++;
        if (this.currentStreak > this.longestStreak) {
            this.longestStreak = this.currentStreak;
        }
    }
    
    public void resetStreak() {
        this.currentStreak = 0;
    }
}