package com.ava.ai.tool;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TimeToolTest {

    private final TimeTool timeTool = new TimeTool();

    @Test
    @DisplayName("Should return current time for valid timezone")
    void testGetCurrentTime() {
        var response = timeTool.getCurrentTime(new TimeTool.TimeRequest("Asia/Kolkata"));
        assertThat(response).isNotNull();
        assertThat(response.timezone()).isEqualTo("Asia/Kolkata");
        assertThat(response.formattedTime()).isNotBlank();
        assertThat(response.dayOfWeek()).isNotBlank();
    }
}
