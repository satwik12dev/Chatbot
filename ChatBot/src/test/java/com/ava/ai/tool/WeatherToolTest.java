package com.ava.ai.tool;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WeatherToolTest {

    private final WeatherTool weatherTool = new WeatherTool();

    @Test
    @DisplayName("Should return structured weather response for given city")
    void testGetWeather() {
        var response = weatherTool.getWeather(new WeatherTool.WeatherRequest("Tokyo", "Japan"));
        assertThat(response).isNotNull();
        assertThat(response.location()).contains("Tokyo");
        assertThat(response.condition()).isNotBlank();
        assertThat(response.temperatureCelsius()).isNotNull();
    }
}
