package com.focusforge.repository;

import com.focusforge.model.WeeklyCategorySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyCategorySummaryRepository extends JpaRepository<WeeklyCategorySummary, Long> {
    List<WeeklyCategorySummary> findByUserIdAndWeekStartBetweenOrderByWeekStartAsc(Long userId, LocalDate start, LocalDate end);

    List<WeeklyCategorySummary> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);

    Optional<WeeklyCategorySummary> findByUserIdAndWeekStartAndCategoryName(Long userId, LocalDate weekStart, String categoryName);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM WeeklyCategorySummary w WHERE w.user.id = :userId AND w.weekStart = :weekStart")
    int deleteByUserIdAndWeekStart(@Param("userId") Long userId, @Param("weekStart") LocalDate weekStart);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM WeeklyCategorySummary w WHERE w.user.id = :userId AND w.weekStart = :weekStart " +
            "AND w.categoryName NOT IN :categoryNames")
    int deleteByUserIdAndWeekStartAndCategoryNameNotIn(
            @Param("userId") Long userId,
            @Param("weekStart") LocalDate weekStart,
            @Param("categoryNames") Collection<String> categoryNames);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            INSERT INTO weekly_category_summary (
                user_id, week_start, week_end, category_name,
                total_minutes, total_points, active_days, activities_count,
                created_at, updated_at
            )
            VALUES (
                :userId, :weekStart, :weekEnd, :categoryName,
                :totalMinutes, :totalPoints, :activeDays, :activitiesCount,
                NOW(), NOW()
            )
            ON CONFLICT (user_id, week_start, category_name)
            DO UPDATE SET
                week_end = EXCLUDED.week_end,
                total_minutes = EXCLUDED.total_minutes,
                total_points = EXCLUDED.total_points,
                active_days = EXCLUDED.active_days,
                activities_count = EXCLUDED.activities_count,
                updated_at = NOW()
            """, nativeQuery = true)
    int upsertSummary(
            @Param("userId") Long userId,
            @Param("weekStart") LocalDate weekStart,
            @Param("weekEnd") LocalDate weekEnd,
            @Param("categoryName") String categoryName,
            @Param("totalMinutes") Integer totalMinutes,
            @Param("totalPoints") Integer totalPoints,
            @Param("activeDays") Integer activeDays,
            @Param("activitiesCount") Integer activitiesCount);
}
