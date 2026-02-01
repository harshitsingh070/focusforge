package com.focusforge.repository;

import com.focusforge.model.LeaderboardSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface LeaderboardSnapshotRepository extends JpaRepository<LeaderboardSnapshot, Long> {

    @Query("SELECT ls FROM LeaderboardSnapshot ls WHERE ls.user.id = :userId " +
            "AND ls.categoryName = :category AND ls.periodType = :periodType " +
            "AND ls.periodStart = :periodStart AND ls.periodEnd = :periodEnd")
    Optional<LeaderboardSnapshot> findPreviousRank(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("periodType") String periodType,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd);

    @Query("SELECT ls FROM LeaderboardSnapshot ls WHERE ls.user.id = :userId " +
            "AND ls.categoryName IS NULL AND ls.periodType = :periodType " +
            "AND ls.periodStart = :periodStart AND ls.periodEnd = :periodEnd")
    Optional<LeaderboardSnapshot> findPreviousOverallRank(
            @Param("userId") Long userId,
            @Param("periodType") String periodType,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd);
}
