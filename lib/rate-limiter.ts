interface RateLimitEntry {
	count: number;
	resetTime: number; // Unix timestamp in milliseconds
}

export class RateLimiter {
	private requests: Map<string, RateLimitEntry>;
	private readonly maxRequests: number;
	private readonly windowMs: number;

	constructor(maxRequests: number = 10, windowMs: number = 60000) {
		this.requests = new Map();
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	/**
	 * Check if a request from the given identifier is allowed
	 * @param identifier - Unique identifier (e.g., IP address)
	 * @returns Object with allowed status and optional retryAfter time in seconds
	 */
	checkLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
		const now = Date.now();

		// Clean up expired entries
		this.cleanup(now);

		const entry = this.requests.get(identifier);

		if (!entry) {
			// First request from this identifier
			this.requests.set(identifier, {
				count: 1,
				resetTime: now + this.windowMs,
			});
			return { allowed: true };
		}

		// Check if the time window has expired
		if (now >= entry.resetTime) {
			// Reset the counter for a new window
			this.requests.set(identifier, {
				count: 1,
				resetTime: now + this.windowMs,
			});
			return { allowed: true };
		}

		// Within the time window
		if (entry.count < this.maxRequests) {
			// Increment the counter
			entry.count++;
			return { allowed: true };
		}

		// Rate limit exceeded
		const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
		return { allowed: false, retryAfter };
	}

	/**
	 * Remove expired entries from the map
	 * @param now - Current timestamp
	 */
	private cleanup(now: number): void {
		for (const [identifier, entry] of this.requests.entries()) {
			if (now >= entry.resetTime) {
				this.requests.delete(identifier);
			}
		}
	}

	/**
	 * Clear all rate limit data (useful for testing)
	 */
	clear(): void {
		this.requests.clear();
	}
}

// Export a singleton instance with default configuration
export const rateLimiter = new RateLimiter(
	parseInt(process.env.RATE_LIMIT_REQUESTS || '10'),
	parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
);
