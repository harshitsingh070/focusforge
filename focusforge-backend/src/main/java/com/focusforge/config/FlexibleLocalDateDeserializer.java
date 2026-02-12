package com.focusforge.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

public class FlexibleLocalDateDeserializer extends JsonDeserializer<LocalDate> {

    private static final List<DateTimeFormatter> ACCEPTED_FORMATS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("dd-MM-uuuu"),
            DateTimeFormatter.ofPattern("dd/MM/uuuu"),
            DateTimeFormatter.ofPattern("MM-dd-uuuu"),
            DateTimeFormatter.ofPattern("MM/dd/uuuu"));

    @Override
    public LocalDate deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String rawValue = parser.getValueAsString();
        if (rawValue == null || rawValue.trim().isEmpty()) {
            return null;
        }

        String candidate = rawValue.trim();
        for (DateTimeFormatter formatter : ACCEPTED_FORMATS) {
            try {
                return LocalDate.parse(candidate, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        throw InvalidFormatException.from(
                parser,
                "Invalid date format. Use yyyy-MM-dd",
                rawValue,
                LocalDate.class);
    }
}
