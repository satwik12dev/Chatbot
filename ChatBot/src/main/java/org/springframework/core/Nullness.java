package org.springframework.core;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

public enum Nullness {

    UNSPECIFIED,
    NULLABLE,
    NON_NULL;

    public boolean isNullable() {
        return this == NULLABLE;
    }

    public boolean isNonNull() {
        return this == NON_NULL;
    }

    public static Nullness forParameter(Parameter parameter) {
        if (parameter != null && parameter.getType().isPrimitive()) {
            return NON_NULL;
        }
        return UNSPECIFIED;
    }

    public static Nullness forMethodParameter(MethodParameter methodParameter) {
        if (methodParameter != null && methodParameter.getParameterType().isPrimitive()) {
            return NON_NULL;
        }
        return UNSPECIFIED;
    }

    public static Nullness forMethodReturnType(Method method) {
        if (method != null && method.getReturnType().isPrimitive()) {
            return NON_NULL;
        }
        return UNSPECIFIED;
    }

    public static Nullness forField(Field field) {
        if (field != null && field.getType().isPrimitive()) {
            return NON_NULL;
        }
        return UNSPECIFIED;
    }
}
