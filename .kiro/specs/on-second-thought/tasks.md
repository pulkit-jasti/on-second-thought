# Implementation Plan

- [x] 1. Initialize Next.js project with TypeScript and Tailwind CSS

  - Create Next.js 14+ project with App Router using `create-next-app`
  - Configure TypeScript with strict mode enabled
  - Set up Tailwind CSS with custom comic-style theme configuration
  - Install @google/generative-ai SDK
  - Create .env.local file structure for environment variables
  - _Requirements: 6.2, 6.3_

- [x] 2. Implement Gemini service module

  - Create `lib/gemini.ts` with GeminiService class
  - Implement `extendQuote()` method with prompt template
  - Configure Gemini API client with temperature 0.7 and max tokens 200
  - Add response validation logic to ensure original quote is unchanged
  - Implement retry logic (up to 2 retries) for validation failures
  - Add error handling for API failures and timeouts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Implement rate limiting module

  - Create `lib/rate-limiter.ts` with RateLimiter class
  - Implement in-memory Map-based storage for request tracking
  - Add `checkLimit()` method that enforces 10 requests per minute per IP
  - Implement automatic cleanup of expired entries
  - Return retry-after time in seconds when limit exceeded
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Create API route handler

  - Create `app/api/extend-quote/route.ts` with POST handler
  - Implement request body validation (quote string, max 500 chars)
  - Integrate rate limiter to check IP-based limits
  - Call Gemini service to generate extended quote
  - Return JSON response with originalQuote and extendedQuote
  - Add comprehensive error handling with appropriate HTTP status codes
  - Set Retry-After header for 429 responses
  - Implement server-side error logging
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 7.5_

- [ ]\* 4.1 Write unit tests for API route

  - Test successful quote extension flow
  - Test rate limiting enforcement
  - Test validation error handling
  - Test Gemini API error scenarios
  - _Requirements: 3.5, 4.1, 4.2_

- [x] 5. Build comic-style UI theme with Tailwind

  - Configure Tailwind with custom colors (bright yellow, bold red, deep black)
  - Add custom font configuration for comic typography
  - Create utility classes for comic-style shadows and borders
  - Define responsive breakpoints for mobile, tablet, desktop
  - Add custom button styles with 3D layered shadow effects
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Implement QuoteInput component

  - Create `components/QuoteInput.tsx` with TypeScript props interface
  - Build textarea input with 500 character limit
  - Add character counter display
  - Implement submit button with comic styling
  - Add disabled state handling during loading
  - Include empty input validation with error message
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3_

- [x] 7. Implement QuoteDisplay component

  - Create `components/QuoteDisplay.tsx` with TypeScript props interface
  - Design layout with visual separation between original and extension
  - Apply comic-style speech bubble or panel design
  - Add copy-to-clipboard functionality
  - Ensure responsive layout for mobile devices
  - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.5_

- [x] 8. Implement ErrorMessage component

  - Create `components/ErrorMessage.tsx` with TypeScript props interface
  - Display user-friendly error messages with comic styling
  - Add optional retry button
  - Handle different error types (network, rate limit, server)
  - Include countdown timer for rate limit errors
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 2.1, 2.2_

- [x] 9. Build main page component

  - Create `app/page.tsx` with state management for quote, result, loading, and errors
  - Implement form submission handler that calls API route
  - Add loading state display during API call
  - Integrate QuoteInput, QuoteDisplay, and ErrorMessage components
  - Apply comic-style layout with header and centered content
  - Ensure 5-second response time target with timeout handling
  - Add metadata for SEO
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.4, 2.5, 7.1, 7.2, 7.3, 7.4_

- [x] 10. Configure Vercel deployment

  - Create vercel.json with build configuration
  - Set up environment variable placeholders in README
  - Configure Next.js for optimal Vercel deployment
  - Add deployment instructions to README
  - Verify serverless function configuration for API route
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ]\* 10.1 Create deployment documentation

  - Document environment variable setup process
  - Add instructions for obtaining Gemini API key
  - Include troubleshooting guide for common deployment issues
  - _Requirements: 6.4_

- [x] 11. Add error handling and user feedback

  - Implement client-side error handling for network failures
  - Add retry mechanism for failed requests
  - Display appropriate messages for different error types (400, 429, 500, 504)
  - Ensure all error messages follow comic-style design
  - Test error scenarios and user feedback flow
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]\* 11.1 Write integration tests for error handling
  - Test network error recovery
  - Test rate limit error display with countdown
  - Test server error retry mechanism
  - Verify error message styling
  - _Requirements: 7.1, 7.2, 7.3, 7.4_
