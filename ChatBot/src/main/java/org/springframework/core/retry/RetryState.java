package org.springframework.core.retry;

public interface RetryState {
    int getRetryCount();
}
