package org.springframework.core.retry;

public class DefaultRetryPolicy implements RetryPolicy {

    @Override
    public boolean shouldRetry(Throwable throwable) {
        return true;
    }
}
