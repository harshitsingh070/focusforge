package com.focusforge.event;

import java.time.LocalDate;

public record ActivityLoggedEvent(String categoryName, LocalDate logDate) {
}
