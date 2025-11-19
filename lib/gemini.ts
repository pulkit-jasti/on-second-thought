import { GoogleGenAI } from '@google/genai';

export class GeminiService {
	private ai;

	constructor() {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error('GEMINI_API_KEY environment variable is not set');
		}

		this.ai = new GoogleGenAI({ apiKey });
	}

	/**
	 * Extends a quote by adding a continuation that inverts or subverts the original meaning
	 * while maintaining the same tone.
	 *
	 * @param quote - The original quote to extend
	 * @returns The complete extended quote (original + extension)
	 */
	async extendQuote(quote: string): Promise<string> {
		const prompt = `Take the following quote and extend it without changing the original wording. The extension must invert or subvert the original meaning while keeping the same tone.

		Quote: '${quote}'

		Return only the complete extended quote (original + extension) without any additional explanation or formatting.`;

		const result = await this.ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: prompt,
			config: {
				temperature: 0.6,
			},
		});

		const text = result.text;

		if (!text || text.trim().length === 0) {
			throw new Error('Gemini API returned empty response');
		}

		return text.trim();
	}
}
