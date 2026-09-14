package org.springframework.core.retry;

@FunctionalInterface
public interface RetryCallback<T, E extends Throwable> {
    T doWithRetry() throws E;
}
