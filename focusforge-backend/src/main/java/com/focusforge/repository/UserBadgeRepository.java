package com.focusforge.repository;

import com.focusforge.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserIdOrderByAwardedAtDesc(Long userId);

    List<UserBadge> findByUserId(Long userId);

    @Query("SELECT ub.badge.id FROM UserBadge ub WHERE ub.user.id = :userId")
    Set<Long> findEarnedBadgeIdsByUserId(@Param("userId") Long userId);

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}
