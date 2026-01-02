package com.hrm.backend.utils;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class to evaluate salary formulas
 * Example formula: "LUONG_CO_BAN * SO_NGAY_CONG_THUC_TE /
 * SO_NGAY_CONG_TIEU_CHUAN"
 */
public class FormulaEvaluator {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("[A-Z][A-Z0-9_]*");

    /**
     * Evaluate a formula with given variable values
     *
     * @param formula   The formula string (e.g., "LUONG_CO_BAN * SO_NGAY_CONG /
     *                  22")
     * @param variables Map of variable names to their values
     * @return The calculated result
     * @throws IllegalArgumentException if formula is invalid or variable is missing
     */
    public static Double evaluate(String formula, Map<String, Double> variables) {
        if (formula == null || formula.trim().isEmpty()) {
            return 0.0;
        }

        String evaluableFormula = formula.trim();

        // Replace all variable codes with their values
        Matcher matcher = VARIABLE_PATTERN.matcher(evaluableFormula);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String varName = matcher.group();
            Double value = variables.get(varName);

            if (value == null) {
                throw new IllegalArgumentException(
                        "Variable '" + varName + "' not found in formula: " + formula);
            }

            matcher.appendReplacement(sb, value.toString());
        }
        matcher.appendTail(sb);

        evaluableFormula = sb.toString();

        // Evaluate the mathematical expression
        try {
            return evaluateExpression(evaluableFormula);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Failed to evaluate formula: " + formula + ". Error: " + e.getMessage());
        }
    }

    /**
     * Evaluate a mathematical expression using JavaScript engine
     */
    private static Double evaluateExpression(String expression) throws ScriptException {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("JavaScript");

        if (engine == null) {
            // Fallback to simple expression evaluation if JS engine not available
            return evaluateSimpleExpression(expression);
        }

        Object result = engine.eval(expression);

        if (result instanceof Number) {
            return ((Number) result).doubleValue();
        }

        throw new IllegalArgumentException("Expression did not return a number: " + expression);
    }

    /**
     * Simple expression evaluator for basic operations (+, -, *, /)
     * Used as fallback when JavaScript engine is not available
     */
    private static Double evaluateSimpleExpression(String expression) {
        // Remove spaces
        expression = expression.replaceAll("\\s+", "");

        // Handle parentheses recursively
        while (expression.contains("(")) {
            int start = expression.lastIndexOf("(");
            int end = expression.indexOf(")", start);
            if (end == -1) {
                throw new IllegalArgumentException("Mismatched parentheses");
            }
            String inner = expression.substring(start + 1, end);
            double innerResult = evaluateSimpleExpression(inner);
            expression = expression.substring(0, start) + innerResult + expression.substring(end + 1);
        }

        // Handle addition and subtraction (lower priority)
        int addIdx = findOperator(expression, '+');
        if (addIdx > 0) {
            return evaluateSimpleExpression(expression.substring(0, addIdx))
                    + evaluateSimpleExpression(expression.substring(addIdx + 1));
        }

        int subIdx = findOperator(expression, '-');
        if (subIdx > 0) {
            return evaluateSimpleExpression(expression.substring(0, subIdx))
                    - evaluateSimpleExpression(expression.substring(subIdx + 1));
        }

        // Handle multiplication and division (higher priority)
        int mulIdx = expression.lastIndexOf('*');
        if (mulIdx > 0) {
            return evaluateSimpleExpression(expression.substring(0, mulIdx))
                    * evaluateSimpleExpression(expression.substring(mulIdx + 1));
        }

        int divIdx = expression.lastIndexOf('/');
        if (divIdx > 0) {
            double divisor = evaluateSimpleExpression(expression.substring(divIdx + 1));
            if (divisor == 0) {
                throw new IllegalArgumentException("Division by zero");
            }
            return evaluateSimpleExpression(expression.substring(0, divIdx)) / divisor;
        }

        // Parse number
        try {
            return Double.parseDouble(expression);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number: " + expression);
        }
    }

    /**
     * Find operator that is not inside parentheses, from right to left
     */
    private static int findOperator(String expr, char op) {
        int depth = 0;
        for (int i = expr.length() - 1; i >= 0; i--) {
            char c = expr.charAt(i);
            if (c == ')')
                depth++;
            else if (c == '(')
                depth--;
            else if (c == op && depth == 0 && i > 0) {
                // Make sure it's not a negative number
                char prev = expr.charAt(i - 1);
                if (Character.isDigit(prev) || prev == ')') {
                    return i;
                }
            }
        }
        return -1;
    }
}
