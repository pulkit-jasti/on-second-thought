'use client';

import { useState } from 'react';
import QuoteInput from '@/components/QuoteInput';
import QuoteDisplay from '@/components/QuoteDisplay';
import ErrorMessage, { ErrorType } from '@/components/ErrorMessage';

interface ExtendQuoteResponse {
	originalQuote: string;
	extendedQuote: string;
}

interface ErrorResponse {
	error: string;
	retryAfter?: number;
}

export default function Home() {
	const [quote, setQuote] = useState('');
	const [result, setResult] = useState<ExtendQuoteResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<{
		message: string;
		type: ErrorType;
		retryAfter?: number;
	} | null>(null);

	const handleSubmit = async () => {
		// Clear previous results and errors
		setResult(null);
		setError(null);
		setIsLoading(true);

		// Create abort controller for timeout handling
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		try {
			const response = await fetch('/api/extend-quote', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ quote: quote.trim() }),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				let errorData: ErrorResponse;

				// Try to parse error response, fallback to generic message
				try {
					errorData = await response.json();
				} catch (parseError) {
					console.error('Failed to parse error response:', parseError);
					errorData = { error: 'An unexpected error occurred' };
				}

				// Handle different error types based on status code
				if (response.status === 429) {
					setError({
						message:
							errorData.error ||
							'You have made too many requests. Please wait before trying again.',
						type: 'rate-limit',
						retryAfter: errorData.retryAfter,
					});
				} else if (response.status === 400) {
					setError({
						message:
							errorData.error || 'Invalid request. Please check your input.',
						type: 'validation',
					});
				} else if (response.status === 504) {
					setError({
						message:
							'The request took too long to complete. Please try again with a shorter quote.',
						type: 'timeout',
					});
				} else if (response.status >= 500) {
					setError({
						message:
							errorData.error ||
							'The service is temporarily unavailable. Please try again later.',
						type: 'server',
					});
				} else {
					// Handle any other unexpected status codes
					setError({
						message:
							errorData.error ||
							'An unexpected error occurred. Please try again.',
						type: 'server',
					});
				}
				return;
			}

			// Parse successful response
			let data: ExtendQuoteResponse;
			try {
				data = await response.json();
			} catch (parseError) {
				console.error('Failed to parse success response:', parseError);
				setError({
					message:
						'Received an invalid response from the server. Please try again.',
					type: 'server',
				});
				return;
			}

			// Validate response data
			if (!data.originalQuote || !data.extendedQuote) {
				console.error('Invalid response data:', data);
				setError({
					message:
						'Received incomplete data from the server. Please try again.',
					type: 'server',
				});
				return;
			}

			setResult(data);
		} catch (err) {
			clearTimeout(timeoutId);

			// Handle abort/timeout errors
			if (err instanceof Error && err.name === 'AbortError') {
				setError({
					message:
						'The request took too long to complete. Please try again with a shorter quote.',
					type: 'timeout',
				});
			} else if (err instanceof TypeError && err.message.includes('fetch')) {
				// Handle network/fetch errors specifically
				setError({
					message:
						'Failed to connect to the server. Please check your internet connection and try again.',
					type: 'network',
				});
			} else {
				// Handle any other unexpected errors
				console.error('Unexpected error during quote submission:', err);
				setError({
					message: 'An unexpected error occurred. Please try again.',
					type: 'network',
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleRetry = () => {
		setError(null);
		handleSubmit();
	};

	return (
		<div className='min-h-screen bg-comic-cream comic-dots-animated flex flex-col'>
			<main className='flex-grow py-8 px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<header className='text-center mb-12'>
					<h1
						className='
						text-5xl sm:text-6xl md:text-7xl 
						font-heading font-bold uppercase
						mb-4
						tracking-tight
						text-comic-red
					'
						style={{ textShadow: '5px 5px 0px rgba(0, 0, 0, 1)' }}
					>
						ON SECOND THOUGHT
					</h1>
					<p className='text-lg sm:text-xl text-gray-700 font-medium max-w-2xl mx-auto'>
						Enter a famous quote and watch AI flip it on its head
					</p>
				</header>

				{/* Main Content */}
				<div className='max-w-4xl mx-auto'>
					{/* Quote Input */}
					<QuoteInput
						value={quote}
						onChange={setQuote}
						onSubmit={handleSubmit}
						disabled={isLoading}
						maxLength={500}
					/>

					{/* Loading State */}
					{isLoading && (
						<div className='mt-8 text-center'>
							<div className='inline-block'>
								<div
									className='
									px-8 py-4
									bg-comic-blue text-white
									border-4 border-comic-black
									shadow-comic
									rounded-lg
									animate-pulse
								'
								>
									<p className='text-xl font-bold uppercase'>
										🤔 Thinking on second thought...
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Error Display */}
					{error && !isLoading && (
						<ErrorMessage
							message={error.message}
							type={error.type}
							onRetry={handleRetry}
							retryAfter={error.retryAfter}
						/>
					)}

					{/* Result Display */}
					{result && !isLoading && (
						<QuoteDisplay
							originalQuote={result.originalQuote}
							extension={result.extendedQuote}
						/>
					)}
				</div>
			</main>

			{/* Footer */}
			<footer className='py-6 px-4 bg-transparent'>
				<div className='max-w-4xl mx-auto text-center'>
					<a
						href='https://github.com/pulkit-jasti/on-second-thought'
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-2 text-gray-700 hover:text-comic-blue transition-colors duration-200 font-medium text-base'
					>
						<svg
							className='w-5 h-5'
							fill='currentColor'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<path
								fillRule='evenodd'
								d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
								clipRule='evenodd'
							/>
						</svg>
						<span>View on GitHub</span>
					</a>
				</div>
			</footer>
		</div>
	);
}
