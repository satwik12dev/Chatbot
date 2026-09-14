package org.springframework.core.retry;

import java.util.function.Supplier;

public class RetryTemplate implements RetryOperations {

    private RetryPolicy retryPolicy;
    private RetryListener retryListener;

    public RetryTemplate() {
        this.retryPolicy = RetryPolicy.withDefaults();
    }

    public RetryTemplate(RetryPolicy retryPolicy) {
        this.retryPolicy = retryPolicy != null ? retryPolicy : RetryPolicy.withDefaults();
    }

    public static RetryTemplate defaultTemplate() {
        return new RetryTemplate();
    }

    public static Builder builder() {
        return new Builder();
    }

    public void setRetryPolicy(RetryPolicy retryPolicy) {
        this.retryPolicy = retryPolicy;
    }

    public RetryPolicy getRetryPolicy() {
        return this.retryPolicy;
    }

    public void setRetryListener(RetryListener retryListener) {
        this.retryListener = retryListener;
    }

    public RetryListener getRetryListener() {
        return this.retryListener;
    }

    @Override
    public <T> T execute(Retryable<T> retryable) throws Throwable {
        return retryable.execute();
    }

    @Override
    public <T> T execute(Supplier<T> supplier) {
        return supplier.get();
    }

    public static class Builder {
        private RetryPolicy retryPolicy;
        private RetryListener retryListener;

        public Builder maxAttempts(int maxAttempts) {
            return this;
        }

        public Builder retryPolicy(RetryPolicy policy) {
            this.retryPolicy = policy;
            return this;
        }

        public Builder retryListener(RetryListener listener) {
            this.retryListener = listener;
            return this;
        }

        public RetryTemplate build() {
            RetryTemplate template = new RetryTemplate(this.retryPolicy);
            template.setRetryListener(this.retryListener);
            return template;
        }
    }
}
