package com.focusforge.repository;

import com.focusforge.model.DailyUserSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyUserSummaryRepository extends JpaRepository<DailyUserSummary, Long> {
    Optional<DailyUserSummary> findByUserIdAndSummaryDate(Long userId, LocalDate summaryDate);

    List<DailyUserSummary> findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate);
}
