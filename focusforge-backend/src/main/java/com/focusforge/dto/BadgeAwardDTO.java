package com.focusforge.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BadgeAwardDTO {
    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private String earnedReason;
    private Integer pointsBonus;
}
