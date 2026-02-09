package com.focusforge.repository;

import com.focusforge.model.LeaderboardSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaderboardSnapshotRepository extends JpaRepository<LeaderboardSnapshot, Long> {

        // Find current snapshot for a specific period/category
        @Query("SELECT ls FROM LeaderboardSnapshot ls WHERE " +
                        "ls.periodType = :periodType " +
                        "AND (:categoryName IS NULL AND ls.categoryName IS NULL OR ls.categoryName = :categoryName) " +
                        "AND ls.periodStart = :periodStart " +
                        "AND ls.periodEnd = :periodEnd " +
                        "ORDER BY ls.rankPosition ASC")
        List<LeaderboardSnapshot> findByPeriodAndCategory(
                        @Param("periodType") String periodType,
                        @Param("categoryName") String categoryName,
                        @Param("periodStart") LocalDate periodStart,
                        @Param("periodEnd") LocalDate periodEnd);

        // Find user's rank entries in specific period/category (ordered for deterministic selection)
        @Query("SELECT ls FROM LeaderboardSnapshot ls WHERE " +
                        "ls.user.id = :userId " +
                        "AND ls.periodType = :periodType " +
                        "AND (:categoryName IS NULL AND ls.categoryName IS NULL OR ls.categoryName = :categoryName) " +
                        "AND ls.periodStart = :periodStart " +
                        "AND ls.periodEnd = :periodEnd " +
                        "ORDER BY ls.rankPosition ASC, ls.id ASC")
        List<LeaderboardSnapshot> findUserRanks(
                        @Param("userId") Long userId,
                        @Param("periodType") String periodType,
                        @Param("categoryName") String categoryName,
                        @Param("periodStart") LocalDate periodStart,
                        @Param("periodEnd") LocalDate periodEnd);

        // Get users around a specific rank (for context view)
        @Query("SELECT ls FROM LeaderboardSnapshot ls WHERE " +
                        "ls.periodType = :periodType " +
                        "AND (:categoryName IS NULL AND ls.categoryName IS NULL OR ls.categoryName = :categoryName) " +
                        "AND ls.periodStart = :periodStart " +
                        "AND ls.periodEnd = :periodEnd " +
                        "AND ls.rankPosition BETWEEN :minRank AND :maxRank " +
                        "ORDER BY ls.rankPosition ASC")
        List<LeaderboardSnapshot> findRankRange(
                        @Param("periodType") String periodType,
                        @Param("categoryName") String categoryName,
                        @Param("periodStart") LocalDate periodStart,
                        @Param("periodEnd") LocalDate periodEnd,
                        @Param("minRank") Integer minRank,
                        @Param("maxRank") Integer maxRank);

        @Query("SELECT COUNT(ls) FROM LeaderboardSnapshot ls WHERE " +
                        "ls.periodType = :periodType " +
                        "AND (:categoryName IS NULL AND ls.categoryName IS NULL OR ls.categoryName = :categoryName) " +
                        "AND ls.periodStart = :periodStart " +
                        "AND ls.periodEnd = :periodEnd")
        Long countParticipants(
                        @Param("periodType") String periodType,
                        @Param("categoryName") String categoryName,
                        @Param("periodStart") LocalDate periodStart,
                        @Param("periodEnd") LocalDate periodEnd);

        // Cleanup old snapshots (before a certain date)
        @Modifying
        @Query("DELETE FROM LeaderboardSnapshot ls WHERE ls.snapshotDate < :cutoffDate")
        void deleteOldSnapshots(@Param("cutoffDate") LocalDate cutoffDate);

        // Check if snapshot exists for period
        boolean existsByPeriodTypeAndCategoryNameAndPeriodStartAndPeriodEnd(
                        String periodType, String categoryName, LocalDate periodStart, LocalDate periodEnd);
}
