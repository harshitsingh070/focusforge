package com.focusforge.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "categories")
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
    
    @Column(name = "normalization_factor")
    private BigDecimal normalizationFactor = BigDecimal.ONE;
    
    @Column(name = "color_code")
    private String colorCode = "#6366f1";
}