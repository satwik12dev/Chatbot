package com.ava.ai.tool;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class TimeTool {

    public record TimeRequest(String timezone) {}
    public record TimeResponse(String timezone, String formattedTime, String dayOfWeek, String iso) {}

    @Tool(description = "Get current date, time, and day of the week for a specified timezone or UTC by default.")
    public TimeResponse getCurrentTime(TimeRequest request) {
        String tz = (request != null && request.timezone() != null && !request.timezone().isBlank()) ? request.timezone().trim() : "UTC";
        ZoneId zoneId;
        try {
            zoneId = ZoneId.of(tz);
        } catch (Exception ex) {
            zoneId = ZoneId.of("UTC");
        }

        ZonedDateTime now = ZonedDateTime.now(zoneId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy HH:mm:ss z");

        return new TimeResponse(
                zoneId.getId(),
                now.format(formatter),
                now.getDayOfWeek().name(),
                now.toInstant().toString()
        );
    }
}
