package org.springframework.core.retry;

public class RetryException extends RuntimeException implements RetryState {
    private final int retryCount;

    public RetryException(String msg) {
        super(msg);
        this.retryCount = 0;
    }

    public RetryException(String msg, Throwable cause) {
        super(msg, cause);
        this.retryCount = 0;
    }

    public RetryException(String msg, Throwable cause, int retryCount) {
        super(msg, cause);
        this.retryCount = retryCount;
    }

    @Override
    public int getRetryCount() {
        return retryCount;
    }
}
