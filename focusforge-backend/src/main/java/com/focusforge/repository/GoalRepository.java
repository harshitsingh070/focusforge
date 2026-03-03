package com.focusforge.repository;

import com.focusforge.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdAndIsActiveTrue(Long userId);

    List<Goal> findByUserId(Long userId);

    Optional<Goal> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT g FROM Goal g WHERE g.isActive = true AND g.endDate < :today")
    List<Goal> findExpiredGoals(@Param("today") LocalDate today);

    @Query("SELECT g FROM Goal g WHERE g.user.id = :userId AND g.isActive = true AND (g.endDate IS NULL OR g.endDate >= :today)")
    List<Goal> findActiveGoalsForUser(@Param("userId") Long userId, @Param("today") LocalDate today);

    // Leaderboard queries (note: isPrivate=false means public)
    @Query("SELECT g FROM Goal g WHERE g.category.name = :categoryName AND g.isPrivate = false AND g.isActive = true")
    List<Goal> findPublicGoalsByCategory(@Param("categoryName") String categoryName);

    @Query("SELECT g FROM Goal g WHERE g.user.id = :userId AND g.isPrivate = false AND g.isActive = true")
    List<Goal> findPublicGoalsByUser(@Param("userId") Long userId);
}