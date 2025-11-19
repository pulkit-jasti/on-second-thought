'use client';

import { useState } from 'react';

interface QuoteInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	disabled: boolean;
	maxLength: number;
}

export default function QuoteInput({
	value,
	onChange,
	onSubmit,
	disabled,
	maxLength,
}: QuoteInputProps) {
	const [showError, setShowError] = useState(false);
	const remainingChars = maxLength - value.length;
	const isNearLimit = remainingChars <= 50;

	const handleSubmit = () => {
		if (value.trim() === '') {
			setShowError(true);
			return;
		}
		setShowError(false);
		onSubmit();
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		if (newValue.length <= maxLength) {
			onChange(newValue);
			if (newValue.trim() !== '') {
				setShowError(false);
			}
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div className='w-full max-w-2xl mx-auto'>
			<div className='relative'>
				<textarea
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					placeholder='Enter a famous quote...'
					className={`
						w-full min-h-[150px] p-4 
						text-lg font-medium
						bg-white
						border-4 border-comic-black
						shadow-comic
						rounded-none
						resize-none
						focus:outline-none focus:ring-4 focus:ring-comic-yellow
						disabled:opacity-50 disabled:cursor-not-allowed
						transition-all
						${showError ? 'border-comic-red' : 'border-comic-black'}
					`}
					aria-label='Quote input'
					aria-describedby='char-counter error-message'
				/>

				{/* Character Counter */}
				<div
					id='char-counter'
					className={`
						absolute bottom-2 right-2
						text-sm font-bold
						px-2 py-1
						${isNearLimit ? 'text-comic-red' : 'text-gray-600'}
					`}
				>
					{remainingChars} / {maxLength}
				</div>
			</div>

			{/* Error Message */}
			{showError && (
				<div
					id='error-message'
					className='mt-2 p-3 bg-comic-red text-white font-bold border-3 border-comic-black shadow-comic-sm'
					role='alert'
				>
					⚠️ Please enter a quote before submitting!
				</div>
			)}

			{/* Submit Button */}
			<button
				onClick={handleSubmit}
				disabled={disabled}
				className={`
					mt-6 w-full
					px-8 py-4
					text-2xl font-heading font-bold uppercase
					bg-comic-yellow
					text-comic-black
					border-4 border-comic-black
					shadow-comic-button
					transition-all
					hover:shadow-comic-button-hover hover:translate-x-[2px] hover:translate-y-[2px]
					active:shadow-comic-button-active active:translate-x-[4px] active:translate-y-[4px]
					disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-comic-button
				`}
				aria-label='Extend quote'
			>
				{disabled ? 'EXTENDING...' : 'EXTEND IT!'}
			</button>
		</div>
	);
}
