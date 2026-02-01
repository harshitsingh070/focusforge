package com.focusforge.repository;

import com.focusforge.model.SuspiciousActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuspiciousActivityRepository extends JpaRepository<SuspiciousActivity, Long> {
    boolean existsByUserIdAndReviewedFalse(Long userId);
    List<SuspiciousActivity> findByUserIdOrderByFlaggedAtDesc(Long userId);
    List<SuspiciousActivity> findByReviewedFalseOrderByFlaggedAtDesc();
}