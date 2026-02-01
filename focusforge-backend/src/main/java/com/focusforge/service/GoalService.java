package com.focusforge.service;

import com.focusforge.dto.GoalRequest;
import com.focusforge.dto.GoalResponse;
import com.focusforge.exception.BadRequestException;
import com.focusforge.exception.ResourceNotFoundException;
import com.focusforge.model.Category;
import com.focusforge.model.Goal;
import com.focusforge.model.Streak;
import com.focusforge.model.User;
import com.focusforge.repository.CategoryRepository;
import com.focusforge.repository.GoalRepository;
import com.focusforge.repository.StreakRepository;
import com.focusforge.repository.UserRepository;
import com.focusforge.security.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Transactional(readOnly = true)
    public List<GoalResponse> getUserGoals(Long userId) {
        return goalRepository.findActiveGoalsForUser(userId, LocalDate.now()).stream()
                .map(this::mapToGoalResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GoalResponse getGoalById(Long goalId, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        return mapToGoalResponse(goal);
    }

    @Transactional
    public GoalResponse createGoal(GoalRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Validate dates
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setCategory(category);
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setDifficulty(request.getDifficulty());
        goal.setDailyMinimumMinutes(request.getDailyMinimumMinutes());
        goal.setStartDate(request.getStartDate());
        goal.setEndDate(request.getEndDate());
        goal.setIsPrivate(request.getIsPrivate() != null ? request.getIsPrivate() : true);
        goal.setIsActive(true);

        Goal savedGoal = goalRepository.save(goal);
        
        // Initialize streak
        Streak streak = new Streak();
        streak.setGoal(savedGoal);
        streakRepository.save(streak);

        log.info("Created goal {} for user {}", savedGoal.getId(), userId);
        return mapToGoalResponse(savedGoal);
    }

    @Transactional
    public GoalResponse updateGoal(Long goalId, GoalRequest request, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        goal.setCategory(category);
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setDifficulty(request.getDifficulty());
        goal.setDailyMinimumMinutes(request.getDailyMinimumMinutes());
        goal.setIsPrivate(request.getIsPrivate());

        Goal updated = goalRepository.save(goal);
        return mapToGoalResponse(updated);
    }

    @Transactional
    public void deleteGoal(Long goalId, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goal.setIsActive(false);
        goalRepository.save(goal);
        log.info("Deactivated goal {} for user {}", goalId, userId);
    }

    private GoalResponse mapToGoalResponse(Goal goal) {
        Streak streak = streakRepository.findByGoalId(goal.getId()).orElse(null);
        
        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .category(goal.getCategory().getName())
                .categoryColor(goal.getCategory().getColorCode())
                .difficulty(goal.getDifficulty())
                .dailyMinimumMinutes(goal.getDailyMinimumMinutes())
                .startDate(goal.getStartDate())
                .endDate(goal.getEndDate())
                .isActive(goal.getIsActive())
                .isPrivate(goal.getIsPrivate())
                .currentStreak(streak != null ? streak.getCurrentStreak() : 0)
                .longestStreak(streak != null ? streak.getLongestStreak() : 0)
                .createdAt(goal.getCreatedAt())
                .build();
    }
}