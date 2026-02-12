package com.focusforge.repository;

import com.focusforge.model.Streak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StreakRepository extends JpaRepository<Streak, Long> {
    Optional<Streak> findByGoalId(Long goalId);
    boolean existsByGoalId(Long goalId);

    @Query("SELECT COALESCE(MAX(s.currentStreak), 0) FROM Streak s WHERE s.goal.user.id = :userId")
    Integer findMaxCurrentStreakByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(MAX(s.currentStreak), 0) FROM Streak s " +
            "JOIN s.goal g " +
            "JOIN g.category c " +
            "WHERE g.user.id = :userId AND c.name = :categoryName")
    Integer findMaxCurrentStreakByUserIdAndCategory(@Param("userId") Long userId,
            @Param("categoryName") String categoryName);

    @Query("SELECT s FROM Streak s JOIN FETCH s.goal g WHERE g.user.id = :userId ORDER BY s.currentStreak DESC")
    List<Streak> findByGoalUserIdOrderByCurrentStreakDesc(@Param("userId") Long userId);

    @Query("SELECT s FROM Streak s " +
            "JOIN FETCH s.goal g " +
            "JOIN FETCH g.category c " +
            "WHERE g.user.id = :userId AND c.name = :categoryName " +
            "ORDER BY s.currentStreak DESC")
    List<Streak> findByGoalUserIdAndCategoryOrderByCurrentStreakDesc(@Param("userId") Long userId,
            @Param("categoryName") String categoryName);
}
