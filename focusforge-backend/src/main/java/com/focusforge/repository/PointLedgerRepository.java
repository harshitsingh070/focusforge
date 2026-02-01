package com.focusforge.repository;

import com.focusforge.model.PointLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PointLedgerRepository extends JpaRepository<PointLedger, Long> {
        List<PointLedger> findByUserIdOrderByCreatedAtDesc(Long userId);

        @Query("SELECT COALESCE(SUM(pl.points), 0) FROM PointLedger pl WHERE pl.user.id = :userId")
        Integer getTotalPointsByUserId(@Param("userId") Long userId);

        @Query("SELECT COALESCE(SUM(pl.points), 0) FROM PointLedger pl WHERE pl.user.id = :userId AND pl.referenceDate = :date")
        Integer getPointsForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

        @Query("SELECT COALESCE(SUM(pl.points), 0) FROM PointLedger pl WHERE pl.user.id = :userId AND pl.referenceDate BETWEEN :start AND :end")
        Integer getPointsForDateRange(@Param("userId") Long userId, @Param("start") LocalDate start,
                        @Param("end") LocalDate end);

        // Leaderboard queries
        @Query("SELECT pl.user.id, pl.user.username, SUM(pl.points) " +
                        "FROM PointLedger pl " +
                        "JOIN pl.goal g " +
                        "JOIN g.category c " +
                        "WHERE c.name = :category AND pl.referenceDate >= :since " +
                        "GROUP BY pl.user.id, pl.user.username " +
                        "ORDER BY SUM(pl.points) DESC")
        List<Object[]> findTopUsersByCategory(@Param("category") String category, @Param("since") LocalDate since);

        @Query("SELECT pl.user.id, pl.user.username, SUM(pl.points) " +
                        "FROM PointLedger pl " +
                        "WHERE pl.referenceDate >= :since " +
                        "GROUP BY pl.user.id, pl.user.username " +
                        "ORDER BY SUM(pl.points) DESC")
        List<Object[]> findTopUsers(@Param("since") LocalDate since);

        @Query("SELECT COUNT(DISTINCT pl2.user.id) + 1 " +
                        "FROM PointLedger pl2 " +
                        "WHERE pl2.referenceDate >= :since " +
                        "AND (SELECT SUM(pl3.points) FROM PointLedger pl3 WHERE pl3.user.id = pl2.user.id AND pl3.referenceDate >= :since) > "
                        +
                        "(SELECT SUM(pl4.points) FROM PointLedger pl4 WHERE pl4.user.id = :userId AND pl4.referenceDate >= :since)")
        Integer getUserOverallRank(@Param("userId") Long userId, @Param("since") LocalDate since);

        @Query("SELECT COUNT(DISTINCT pl2.user.id) + 1 " +
                        "FROM PointLedger pl2 " +
                        "JOIN pl2.goal g " +
                        "JOIN g.category c " +
                        "WHERE c.name = :category AND pl2.referenceDate >= :since " +
                        "AND (SELECT SUM(pl3.points) FROM PointLedger pl3 JOIN pl3.goal g3 JOIN g3.category c3 WHERE c3.name = :category AND pl3.user.id = pl2.user.id AND pl3.referenceDate >= :since) > "
                        +
                        "(SELECT SUM(pl4.points) FROM PointLedger pl4 JOIN pl4.goal g4 JOIN g4.category c4 WHERE c4.name = :category AND pl4.user.id = :userId AND pl4.referenceDate >= :since)")
        Integer getUserCategoryRank(@Param("userId") Long userId, @Param("category") String category,
                        @Param("since") LocalDate since);
}