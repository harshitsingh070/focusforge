package com.focusforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FocusforgeBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(FocusforgeBackendApplication.class, args);
    }
}