'use client';

import { useState } from 'react';

interface QuoteDisplayProps {
	originalQuote: string;
	extension: string;
}

export default function QuoteDisplay({
	originalQuote,
	extension,
}: QuoteDisplayProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(extension);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy text:', err);
		}
	};

	return (
		<div className='w-full max-w-4xl mx-auto mt-12'>
			{/* Single large quote display */}
			<div className='relative bg-white border-4 border-comic-black shadow-comic-lg p-8 sm:p-12'>
				{/* Opening quote mark */}
				<div
					className='absolute top-1 left-1 text-8xl sm:text-9xl font-bold text-comic-yellow leading-none'
					style={{ textShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
				>
					"
				</div>

				{/* Quote text */}
				<p className='text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-comic-black text-center px-4 sm:px-8 py-4'>
					{extension}
				</p>

				{/* Closing quote mark */}
				<div
					className='absolute text-8xl sm:text-9xl font-bold text-comic-yellow leading-none'
					style={{
						textShadow: '4px 4px 0px rgba(0, 0, 0, 1)',
						bottom: '-50px',
						right: 10,
					}}
				>
					"
				</div>
			</div>

			{/* Copy Button */}
			<div className='mt-8 text-center'>
				<button
					onClick={handleCopy}
					className='
						px-8 py-4
						text-xl
						font-bold uppercase tracking-wide
						bg-comic-blue text-white
						border-4 border-comic-black
						shadow-comic
						transition-all
						hover:shadow-comic-button-hover hover:translate-x-[2px] hover:translate-y-[2px]
						active:shadow-comic-button-active active:translate-x-[4px] active:translate-y-[4px]
					'
					aria-label='Copy extended quote to clipboard'
				>
					{copied ? '✓ Copied!' : '📋 Copy Quote'}
				</button>
			</div>
		</div>
	);
}
