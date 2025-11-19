# Design Document

## Overview

On Second Thought is a Next.js application using the App Router architecture with TypeScript. The application consists of a single-page interface where users input quotes and receive AI-generated extensions that contradict the original meaning. The system uses Google's Gemini API through a secure backend route with rate limiting, styled with Tailwind CSS to achieve a comic-book aesthetic.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   User Browser  │
│   (React UI)    │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────┐
│  Next.js API    │
│  Route Handler  │
│  + Rate Limiter │
└────────┬────────┘
         │ API Call
         ▼
┌─────────────────┐
│   Gemini API    │
│  (Google GenAI) │
└─────────────────┘
```

### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: @google/genai SDK
- **Deployment**: Vercel serverless platform
- **Rate Limiting**: Custom in-memory implementation

## Components and Interfaces

### Frontend Components

#### 1. Page Component (`app/page.tsx`)

The main page component that orchestrates the UI.

**Responsibilities:**

- Manage quote input state
- Handle form submission
- Display loading states
- Show results and errors
- Apply comic-style layout

**State Management:**

```typescript
interface PageState {
	quote: string;
	extendedQuote: string | null;
	isLoading: boolean;
	error: string | null;
}
```

#### 2. QuoteInput Component

A text input component for entering quotes.

**Props:**

```typescript
interface QuoteInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	disabled: boolean;
	maxLength: number;
}
```

**Features:**

- Character counter
- Submit button with comic styling
- Validation feedback

#### 3. QuoteDisplay Component

Displays the original quote and its extension.

**Props:**

```typescript
interface QuoteDisplayProps {
	originalQuote: string;
	extension: string;
}
```

**Features:**

- Visual separation between original and extension
- Comic-style speech bubble or panel design
- Copy-to-clipboard functionality

#### 4. ErrorMessage Component

Displays user-friendly error messages.

**Props:**

```typescript
interface ErrorMessageProps {
	message: string;
	onRetry?: () => void;
}
```

### Backend Components

#### 1. API Route Handler (`app/api/extend-quote/route.ts`)

Handles POST requests to extend quotes.

**Request Interface:**

```typescript
interface ExtendQuoteRequest {
	quote: string;
}
```

**Response Interface:**

```typescript
interface ExtendQuoteResponse {
	originalQuote: string;
	extendedQuote: string;
}

interface ErrorResponse {
	error: string;
	retryAfter?: number;
}
```

**Flow:**

1. Validate request body
2. Check rate limit
3. Call Gemini API with prompt
4. Validate response
5. Return extended quote

#### 2. Rate Limiter Module (`lib/rate-limiter.ts`)

In-memory rate limiting implementation.

**Interface:**

```typescript
interface RateLimiter {
	checkLimit(identifier: string): {
		allowed: boolean;
		retryAfter?: number;
	};
}
```

**Implementation Details:**

- Uses Map to store request counts per IP
- 10 requests per minute per IP
- Automatic cleanup of expired entries
- Returns retry-after time in seconds

#### 3. Gemini Service Module (`lib/gemini.ts`)

Encapsulates Gemini API interactions.

**Interface:**

```typescript
interface GeminiService {
	extendQuote(quote: string): Promise<string>;
}
```

**Configuration:**

- Model: gemini-pro or gemini-2.5-flash
- Temperature: 0.7 (balance creativity and consistency)
- Max tokens: 200
- Retry logic: up to 2 retries on validation failure

## Data Models

### Quote Extension Request Flow

```typescript
// Client sends
{
	quote: string; // max 500 chars
}

// Server processes and returns
{
	originalQuote: string;
	extendedQuote: string; // includes original + extension
}
```

### Rate Limit Storage

```typescript
interface RateLimitEntry {
	count: number;
	resetTime: number; // Unix timestamp
}

// In-memory storage
Map<string, RateLimitEntry>;
```

### Environment Variables

```typescript
interface EnvironmentConfig {
	GEMINI_API_KEY: string; // Required
	RATE_LIMIT_REQUESTS?: number; // Default: 10
	RATE_LIMIT_WINDOW_MS?: number; // Default: 60000
}
```

## Error Handling

### Client-Side Error Handling

1. **Network Errors**: Display "Connection failed" message with retry button
2. **Rate Limit Errors (429)**: Display "Too many requests" with countdown timer
3. **Server Errors (500)**: Display "Service unavailable" with retry option
4. **Validation Errors (400)**: Display specific validation message

### Server-Side Error Handling

1. **Missing API Key**: Return 500 with generic error (log specific error)
2. **Invalid Request**: Return 400 with validation details
3. **Rate Limit Exceeded**: Return 429 with Retry-After header
4. **Gemini API Errors**: Return 500 with user-friendly message (log API error)
5. **Timeout**: Return 504 with timeout message

### Error Logging

- Use console.error for server-side logging
- Include timestamp, error type, and relevant context
- Never log API keys or sensitive data

## UI Design Specifications

### Comic-Style Theme

**Color Palette:**

- Primary: Bright yellow (#FFD700) or electric blue (#00BFFF)
- Secondary: Bold red (#FF4444) or vibrant purple (#9B59B6)
- Background: White or light cream (#FFFEF0)
- Text: Deep black (#000000)
- Shadows: Black with high opacity

**Typography:**

- Headings: Bold, uppercase, large font (e.g., "Bangers" or "Comic Neue")
- Body: Clear, readable sans-serif
- Quote text: Slightly larger, emphasized

**Visual Effects:**

- Text shadows: 4-6px offset, black
- Box shadows: 8-10px offset, black, sharp edges
- Borders: 3-4px solid black
- Buttons: 3D effect with layered shadows
- Hover states: Slight lift effect with adjusted shadows

### Layout Structure

```
┌─────────────────────────────────────┐
│         ON SECOND THOUGHT           │
│      [Comic-style header]           │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Enter a quote...             │ │
│  │  [Text Input]                 │ │
│  └───────────────────────────────┘ │
│                                     │
│         [EXTEND IT! Button]         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Original Quote               │ │
│  │  "..."                        │ │
│  ├───────────────────────────────┤ │
│  │  Extension                    │ │
│  │  "... but ..."                │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Responsive Design

- Mobile (< 640px): Single column, full-width elements
- Tablet (640px - 1024px): Centered content, max-width 768px
- Desktop (> 1024px): Centered content, max-width 900px

## Gemini Integration

### Prompt Template

```
Take the following quote and extend it without changing the original wording. The extension must invert or subvert the original meaning while keeping the same tone.

Quote: '<USER_INPUT>'

Return only the complete extended quote (original + extension) without any additional explanation or formatting.
```

### API Configuration

```typescript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
	model: 'gemini-2.5-flash',
	generationConfig: {
		temperature: 0.7,
		maxOutputTokens: 200,
	},
});
```

### Response Validation

After receiving a response from Gemini:

1. Check that response contains the original quote unchanged
2. Verify that extension is present
3. Ensure total length is reasonable (< 1000 chars)
4. If validation fails, retry up to 2 times with adjusted prompt

## Testing Strategy

### Unit Tests

1. **Rate Limiter Tests**

   - Verify request counting
   - Test limit enforcement
   - Validate reset timing
   - Check cleanup of expired entries

2. **Gemini Service Tests**
   - Mock API responses
   - Test error handling
   - Verify retry logic
   - Validate response parsing

### Integration Tests

1. **API Route Tests**
   - Test successful quote extension
   - Verify rate limiting behavior
   - Test error responses
   - Validate request/response formats

### End-to-End Tests

1. **User Flow Tests**
   - Submit quote and receive extension
   - Handle rate limit gracefully
   - Display errors appropriately
   - Verify UI responsiveness

### Manual Testing Checklist

- [ ] Comic styling appears correctly across browsers
- [ ] Mobile responsiveness works on various devices
- [ ] Rate limiting prevents abuse
- [ ] Error messages are clear and helpful
- [ ] Loading states provide good UX
- [ ] Extended quotes maintain original meaning inversion

## Deployment Configuration

### Vercel Configuration

**vercel.json:**

```json
{
	"buildCommand": "npm run build",
	"devCommand": "npm run dev",
	"installCommand": "npm install",
	"framework": "nextjs"
}
```

### Environment Variables Setup

Required in Vercel dashboard:

- `GEMINI_API_KEY`: Google AI API key

Optional:

- `RATE_LIMIT_REQUESTS`: Number of requests per window (default: 10)
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds (default: 60000)

### Build Optimization

- Enable Next.js image optimization
- Use static generation where possible
- Minimize bundle size with tree shaking
- Enable compression for API responses

## Security Considerations

1. **API Key Protection**: Never expose GEMINI_API_KEY to client
2. **Rate Limiting**: Prevent abuse and control costs
3. **Input Validation**: Sanitize user input before processing
4. **CORS**: Configure appropriate CORS headers if needed
5. **Error Messages**: Don't leak sensitive information in errors

## Performance Considerations

1. **API Response Time**: Target < 5 seconds for quote extension
2. **Rate Limiter**: Use efficient in-memory storage with cleanup
3. **Bundle Size**: Keep client bundle < 200KB
4. **Caching**: Consider caching common quotes (future enhancement)
5. **Timeout**: Set 10-second timeout for Gemini API calls
