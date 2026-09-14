package org.springframework.core.retry;

import java.util.function.Supplier;

public interface RetryOperations {

    <T> T execute(Retryable<T> retryable) throws Throwable;

    default <T> T execute(Supplier<T> supplier) {
        return supplier.get();
    }
}
