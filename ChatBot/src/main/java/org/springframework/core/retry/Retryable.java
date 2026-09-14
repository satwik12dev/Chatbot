package org.springframework.core.retry;

@FunctionalInterface
public interface Retryable<T> {
    T execute() throws Throwable;
}
