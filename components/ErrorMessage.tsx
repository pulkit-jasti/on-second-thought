'use client';

import { useEffect, useState } from 'react';

export type ErrorType =
	| 'network'
	| 'rate-limit'
	| 'server'
	| 'validation'
	| 'timeout';

interface ErrorMessageProps {
	message: string;
	type?: ErrorType;
	onRetry?: () => void;
	retryAfter?: number; // seconds until retry is allowed (for rate limit)
}

export default function ErrorMessage({
	message,
	type = 'server',
	onRetry,
	retryAfter,
}: ErrorMessageProps) {
	const [countdown, setCountdown] = useState(retryAfter || 0);

	// Countdown timer for rate limit errors
	useEffect(() => {
		if (type === 'rate-limit' && countdown > 0) {
			const timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [type, countdown]);

	// Get error icon based on type
	const getErrorIcon = () => {
		switch (type) {
			case 'network':
				return '🔌';
			case 'rate-limit':
				return '⏱️';
			case 'timeout':
				return '⏰';
			case 'validation':
				return '⚠️';
			case 'server':
			default:
				return '❌';
		}
	};

	// Get error title based on type
	const getErrorTitle = () => {
		switch (type) {
			case 'network':
				return 'Connection Failed';
			case 'rate-limit':
				return 'Too Many Requests';
			case 'timeout':
				return 'Request Timeout';
			case 'validation':
				return 'Invalid Input';
			case 'server':
			default:
				return 'Something Went Wrong';
		}
	};

	// Get background color based on type
	const getBgColor = () => {
		switch (type) {
			case 'rate-limit':
				return 'bg-comic-purple';
			case 'validation':
				return 'bg-comic-yellow text-comic-black';
			default:
				return 'bg-comic-red';
		}
	};

	const canRetry = onRetry && (type !== 'rate-limit' || countdown === 0);

	return (
		<div
			className='w-full max-w-2xl mx-auto mt-6'
			role='alert'
			aria-live='assertive'
		>
			<div
				className={`
					${getBgColor()}
					${type === 'validation' ? 'text-comic-black' : 'text-white'}
					border-4 border-comic-black
					shadow-comic
					p-6
					rounded-lg
				`}
			>
				{/* Error Header */}
				<div className='flex items-start gap-4'>
					<div className='text-4xl flex-shrink-0' aria-hidden='true'>
						{getErrorIcon()}
					</div>
					<div className='flex-1'>
						<h3 className='text-xl font-heading font-bold uppercase mb-2'>
							{getErrorTitle()}
						</h3>
						<p className='text-base font-medium leading-relaxed'>{message}</p>

						{/* Countdown Timer for Rate Limit */}
						{type === 'rate-limit' && countdown > 0 && (
							<div className='mt-4 p-3 bg-black bg-opacity-20 rounded border-2 border-current'>
								<p className='text-sm font-bold'>
									⏳ Please wait {countdown} second{countdown !== 1 ? 's' : ''}{' '}
									before trying again
								</p>
							</div>
						)}

						{/* Retry Button */}
						{onRetry && (
							<div className='mt-4'>
								<button
									onClick={onRetry}
									disabled={!canRetry}
									className={`
										px-6 py-3
										font-bold uppercase tracking-wide
										${
											type === 'validation'
												? 'bg-comic-black text-comic-yellow'
												: 'bg-white text-comic-black'
										}
										border-4 border-comic-black
										shadow-comic-sm
										transition-all
										hover:shadow-comic-button-hover hover:translate-x-[2px] hover:translate-y-[2px]
										active:shadow-comic-button-active active:translate-x-[4px] active:translate-y-[4px]
										disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-comic-sm
									`}
									aria-label={canRetry ? 'Retry request' : 'Retry disabled'}
								>
									{type === 'rate-limit' && countdown > 0
										? `Retry in ${countdown}s`
										: '🔄 Try Again'}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
