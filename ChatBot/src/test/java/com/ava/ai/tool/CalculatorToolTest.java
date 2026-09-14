package com.ava.ai.tool;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CalculatorToolTest {

    private final CalculatorTool calculatorTool = new CalculatorTool();

    @Test
    @DisplayName("Should evaluate basic arithmetic expressions correctly")
    void testBasicCalculations() {
        var res1 = calculatorTool.calculate(new CalculatorTool.CalculationRequest("2 + 2"));
        assertThat(res1.result()).isEqualTo(4.0);
        assertThat(res1.status()).isEqualTo("SUCCESS");

        var res2 = calculatorTool.calculate(new CalculatorTool.CalculationRequest("(10 - 2) * 5 / 2"));
        assertThat(res2.result()).isEqualTo(20.0);

        var res3 = calculatorTool.calculate(new CalculatorTool.CalculationRequest("2 ^ 3"));
        assertThat(res3.result()).isEqualTo(8.0);
    }

    @Test
    @DisplayName("Should handle empty or invalid expressions safely")
    void testInvalidExpressions() {
        var res = calculatorTool.calculate(new CalculatorTool.CalculationRequest(""));
        assertThat(res.status()).contains("cannot be empty");

        var errRes = calculatorTool.calculate(new CalculatorTool.CalculationRequest("abc + 2"));
        assertThat(errRes.status()).startsWith("Error:");
    }
}
