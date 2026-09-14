package com.ava.ai.tool;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class WeatherTool {

    public record WeatherRequest(String city, String country) {}
    public record WeatherResponse(String location, String condition, double temperatureCelsius, int humidityPercent, String forecast) {}

    @Tool(description = "Get current weather condition and forecast for a given city and country.")
    public WeatherResponse getWeather(WeatherRequest request) {
        String city = (request != null && request.city() != null && !request.city().isBlank()) ? request.city().trim() : "Unknown City";
        String country = (request != null && request.country() != null && !request.country().isBlank()) ? request.country().trim() : "";
        String location = country.isEmpty() ? city : city + ", " + country;

        // Structured weather response with realistic conditions
        return new WeatherResponse(
                location,
                "Partly Cloudy",
                23.5,
                55,
                "Pleasant breeze throughout the day with expected clear skies into the evening."
        );
    }
}
