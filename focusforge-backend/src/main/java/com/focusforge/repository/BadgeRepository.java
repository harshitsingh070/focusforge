package com.focusforge.repository;

import com.focusforge.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByCriteriaTypeAndThresholdLessThanEqual(String criteriaType, Integer threshold);
}