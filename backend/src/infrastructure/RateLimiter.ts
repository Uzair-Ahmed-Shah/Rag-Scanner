interface UserBucket {
    minuteTimestamps: number[];
    dayTimestamps: number[];
}

const MINUTE_LIMIT = 10;
const DAILY_LIMIT = 100;
const ONE_MINUTE = 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export class RateLimiter {
    private buckets = new Map<string, UserBucket>();

    private getBucket(userId: string): UserBucket {
        if (!this.buckets.has(userId)) {
            this.buckets.set(userId, { minuteTimestamps: [], dayTimestamps: [] });
        }
        return this.buckets.get(userId)!;
    }

    /** Returns current usage stats for a user. */
    getStatus(userId: string): { minuteRemaining: number; dailyRemaining: number } {
        const now = Date.now();
        const bucket = this.getBucket(userId);

        const recentMinute = bucket.minuteTimestamps.filter(t => now - t < ONE_MINUTE);
        const recentDay = bucket.dayTimestamps.filter(t => now - t < ONE_DAY);

        return {
            minuteRemaining: Math.max(0, MINUTE_LIMIT - recentMinute.length),
            dailyRemaining: Math.max(0, DAILY_LIMIT - recentDay.length),
        };
    }

    /**
     * Records a request and checks limits.
     * Throws an error with `retryAfter` if the user is over limit.
     */
    check(userId: string): void {
        const now = Date.now();
        const bucket = this.getBucket(userId);

        // Prune old entries
        bucket.minuteTimestamps = bucket.minuteTimestamps.filter(t => now - t < ONE_MINUTE);
        bucket.dayTimestamps = bucket.dayTimestamps.filter(t => now - t < ONE_DAY);

        if (bucket.minuteTimestamps.length >= MINUTE_LIMIT) {
            const oldestMinute = bucket.minuteTimestamps[0]!;
            const retryAfterMs = ONE_MINUTE - (now - oldestMinute);
            const retryAfterSec = Math.ceil(retryAfterMs / 1000);
            throw Object.assign(new Error(`Rate limit: too many requests. Try again in ${retryAfterSec}s.`), {
                status: 429,
                retryAfter: retryAfterSec,
                type: 'minute',
            });
        }

        if (bucket.dayTimestamps.length >= DAILY_LIMIT) {
            throw Object.assign(new Error('Daily limit reached. Resets at midnight UTC.'), {
                status: 429,
                retryAfter: null,
                type: 'daily',
            });
        }

        bucket.minuteTimestamps.push(now);
        bucket.dayTimestamps.push(now);
    }
}

// Singleton — shared across requests in the same process
export const rateLimiter = new RateLimiter();
