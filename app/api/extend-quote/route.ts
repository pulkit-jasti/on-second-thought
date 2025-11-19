import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini';
import { rateLimiter } from '@/lib/rate-limiter';

interface ExtendQuoteRequest {
	quote: string;
}

interface ExtendQuoteResponse {
	originalQuote: string;
	extendedQuote: string;
}

interface ErrorResponse {
	error: string;
	retryAfter?: number;
}

/**
 * POST /api/extend-quote
 * Extends a quote by adding a continuation that inverts the original meaning
 */
export async function POST(request: NextRequest) {
	try {
		// Parse request body
		let body: ExtendQuoteRequest;
		try {
			body = await request.json();
		} catch (error) {
			console.error('Failed to parse request body:', error);
			return NextResponse.json<ErrorResponse>(
				{ error: 'Invalid request body' },
				{ status: 400 }
			);
		}

		// Validate request body
		if (!body.quote || typeof body.quote !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{ error: 'Quote is required and must be a string' },
				{ status: 400 }
			);
		}

		const quote = body.quote.trim();

		// Validate quote length
		if (quote.length === 0) {
			return NextResponse.json<ErrorResponse>(
				{ error: 'Quote cannot be empty' },
				{ status: 400 }
			);
		}

		if (quote.length > 500) {
			return NextResponse.json<ErrorResponse>(
				{ error: 'Quote must not exceed 500 characters' },
				{ status: 400 }
			);
		}

		// Get client IP address for rate limiting
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0] ||
			request.headers.get('x-real-ip') ||
			'unknown';

		// Check rate limit
		const rateLimitResult = rateLimiter.checkLimit(ip);
		if (!rateLimitResult.allowed) {
			console.warn(`Rate limit exceeded for IP: ${ip}`);
			const response = NextResponse.json<ErrorResponse>(
				{
					error: 'Too many requests. Please try again later.',
					retryAfter: rateLimitResult.retryAfter,
				},
				{ status: 429 }
			);

			// Set Retry-After header
			if (rateLimitResult.retryAfter) {
				response.headers.set(
					'Retry-After',
					rateLimitResult.retryAfter.toString()
				);
			}

			return response;
		}

		// Call Gemini service to extend the quote
		let extendedQuote: string;
		try {
			const geminiService = new GeminiService();
			extendedQuote = await geminiService.extendQuote(quote);
		} catch (error) {
			console.error('Gemini API error:', error);

			// Check for API key errors
			if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
				return NextResponse.json<ErrorResponse>(
					{ error: 'Service configuration error. Please contact support.' },
					{ status: 500 }
				);
			}

			// Generic error for other Gemini API failures
			return NextResponse.json<ErrorResponse>(
				{ error: 'Failed to generate quote extension. Please try again.' },
				{ status: 500 }
			);
		}

		// Return successful response
		return NextResponse.json<ExtendQuoteResponse>(
			{
				originalQuote: quote,
				extendedQuote: extendedQuote,
			},
			{ status: 200 }
		);
	} catch (error) {
		// Catch-all for unexpected errors
		console.error('Unexpected error in extend-quote API:', error);
		return NextResponse.json<ErrorResponse>(
			{ error: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
}
