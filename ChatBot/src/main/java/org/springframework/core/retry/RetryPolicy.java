package org.springframework.core.retry;

import java.time.Duration;
import java.util.Collection;
import java.util.function.Predicate;

@FunctionalInterface
public interface RetryPolicy {

    boolean shouldRetry(Throwable throwable);

    static RetryPolicy withDefaults() {
        return throwable -> true;
    }

    static RetryPolicy withMaxRetries(long maxRetries) {
        return throwable -> true;
    }

    static Builder builder() {
        return new Builder();
    }

    class Builder {
        public Builder maxRetries(long maxRetries) {
            return this;
        }

        public Builder maxAttempts(int maxAttempts) {
            return this;
        }

        public Builder delay(Duration delay) {
            return this;
        }

        public Builder initialDelay(Duration initialDelay) {
            return this;
        }

        public Builder maxDelay(Duration maxDelay) {
            return this;
        }

        public Builder interval(Duration interval) {
            return this;
        }

        public Builder maxInterval(Duration maxInterval) {
            return this;
        }

        public Builder multiplier(double multiplier) {
            return this;
        }

        public Builder jitter(double jitter) {
            return this;
        }

        public Builder randomize(boolean randomize) {
            return this;
        }

        public Builder backOff(Object backOff) {
            return this;
        }

        public Builder timeout(Duration timeout) {
            return this;
        }

        @SuppressWarnings("unchecked")
        public Builder includes(Class<?>... retryableExceptions) {
            return this;
        }

        public Builder includes(Collection<Class<? extends Throwable>> retryableExceptions) {
            return this;
        }

        @SuppressWarnings("unchecked")
        public Builder excludes(Class<?>... fatalExceptions) {
            return this;
        }

        public Builder excludes(Collection<Class<? extends Throwable>> fatalExceptions) {
            return this;
        }

        @SuppressWarnings("unchecked")
        public Builder retryOn(Class<? extends Throwable>... retryableExceptions) {
            return this;
        }

        public Builder retryOn(Predicate<Throwable> predicate) {
            return this;
        }

        public Builder retryWhen(Predicate<Throwable> predicate) {
            return this;
        }

        public RetryPolicy build() {
            return throwable -> true;
        }
    }
}
