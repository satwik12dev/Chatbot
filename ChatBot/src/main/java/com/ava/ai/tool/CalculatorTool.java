package com.ava.ai.tool;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class CalculatorTool {

    public record CalculationRequest(String expression) {}
    public record CalculationResponse(String expression, double result, String status) {}

    @Tool(description = "Perform mathematical arithmetic calculations like addition, subtraction, multiplication, division, and exponents.")
    public CalculationResponse calculate(CalculationRequest request) {
        if (request == null || request.expression() == null || request.expression().isBlank()) {
            return new CalculationResponse("", 0.0, "Expression cannot be empty");
        }

        try {
            double result = evaluateSimpleExpression(request.expression().trim());
            return new CalculationResponse(request.expression(), result, "SUCCESS");
        } catch (Exception ex) {
            return new CalculationResponse(request.expression(), 0.0, "Error: " + ex.getMessage());
        }
    }

    private double evaluateSimpleExpression(String expression) {
        // Safe evaluation supporting +, -, *, /, % without dangerous eval/reflection
        String expr = expression.replaceAll("\\s+", "");
        return new Object() {
            int pos = -1, ch;

            void nextChar() {
                ch = (++pos < expr.length()) ? expr.charAt(pos) : -1;
            }

            boolean eat(int charToEat) {
                while (ch == ' ') nextChar();
                if (ch == charToEat) {
                    nextChar();
                    return true;
                }
                return false;
            }

            double parse() {
                nextChar();
                double x = parseExpression();
                if (pos < expr.length()) throw new IllegalArgumentException("Unexpected character: " + (char) ch);
                return x;
            }

            double parseExpression() {
                double x = parseTerm();
                for (;;) {
                    if (eat('+')) x += parseTerm();
                    else if (eat('-')) x -= parseTerm();
                    else return x;
                }
            }

            double parseTerm() {
                double x = parseFactor();
                for (;;) {
                    if (eat('*')) x *= parseFactor();
                    else if (eat('/')) {
                        double divisor = parseFactor();
                        if (divisor == 0) throw new ArithmeticException("Division by zero");
                        x /= divisor;
                    }
                    else if (eat('%')) x %= parseFactor();
                    else return x;
                }
            }

            double parseFactor() {
                if (eat('+')) return parseFactor();
                if (eat('-')) return -parseFactor();

                double x;
                int startPos = this.pos;
                if (eat('(')) {
                    x = parseExpression();
                    eat(')');
                } else if ((ch >= '0' && ch <= '9') || ch == '.') {
                    while ((ch >= '0' && ch <= '9') || ch == '.') nextChar();
                    x = Double.parseDouble(expr.substring(startPos, this.pos));
                } else {
                    throw new IllegalArgumentException("Unexpected token: " + (char) ch);
                }

                if (eat('^')) x = Math.pow(x, parseFactor());

                return x;
            }
        }.parse();
    }
}
