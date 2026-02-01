package com.focusforge.controller;

import com.focusforge.dto.GoalRequest;
import com.focusforge.dto.GoalResponse;
import com.focusforge.dto.MessageResponse;
import com.focusforge.security.UserPrincipal;
import com.focusforge.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getUserGoals(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<GoalResponse> goals = goalService.getUserGoals(currentUser.getId());
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoalById(@PathVariable Long id, 
                                                    @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(goalService.getGoalById(id, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@Valid @RequestBody GoalRequest goalRequest,
                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(goalService.createGoal(goalRequest, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(@PathVariable Long id,
                                                   @Valid @RequestBody GoalRequest goalRequest,
                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(goalService.updateGoal(id, goalRequest, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id,
                                       @AuthenticationPrincipal UserPrincipal currentUser) {
        goalService.deleteGoal(id, currentUser.getId());
        return ResponseEntity.ok(new MessageResponse("Goal deleted successfully", true));
    }
}