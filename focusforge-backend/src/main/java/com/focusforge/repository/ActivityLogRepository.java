package com.focusforge.repository;

import com.focusforge.model.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Optional<ActivityLog> findByUserIdAndGoalIdAndLogDate(Long userId, Long goalId, LocalDate logDate);

    List<ActivityLog> findByUserIdAndLogDateBetweenOrderByLogDateDesc(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT al FROM ActivityLog al WHERE al.user.id = :userId ORDER BY al.logDate DESC, al.createdAt DESC")
    List<ActivityLog> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(al.minutesSpent), 0) FROM ActivityLog al WHERE al.user.id = :userId AND al.logDate = :date")
    Integer getTotalMinutesForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT al.logDate, SUM(al.minutesSpent) FROM ActivityLog al " +
            "WHERE al.user.id = :userId AND al.logDate BETWEEN :start AND :end " +
            "GROUP BY al.logDate ORDER BY al.logDate")
    List<Object[]> getDailyTotals(@Param("userId") Long userId, @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT COUNT(al) FROM ActivityLog al WHERE al.user.id = :userId AND al.logDate = :date")
    Long countByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    // Analytics queries
    List<ActivityLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);

    List<ActivityLog> findByUserIdAndLogDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}