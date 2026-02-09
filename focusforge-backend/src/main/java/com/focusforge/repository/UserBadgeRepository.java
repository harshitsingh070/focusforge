package com.focusforge.repository;

import com.focusforge.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserIdOrderByAwardedAtDesc(Long userId);

    List<UserBadge> findByUserId(Long userId);

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}