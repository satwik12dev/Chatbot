package com.ava.ai.tool;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AvaToolRegistry {

    private final CalculatorTool calculatorTool;
    private final WeatherTool weatherTool;
    private final TimeTool timeTool;

    public AvaToolRegistry(CalculatorTool calculatorTool, WeatherTool weatherTool, TimeTool timeTool) {
        this.calculatorTool = calculatorTool;
        this.weatherTool = weatherTool;
        this.timeTool = timeTool;
    }

    public Object[] getAllTools() {
        return new Object[] { calculatorTool, weatherTool, timeTool };
    }

    public CalculatorTool getCalculatorTool() { return calculatorTool; }
    public WeatherTool getWeatherTool() { return weatherTool; }
    public TimeTool getTimeTool() { return timeTool; }
}
