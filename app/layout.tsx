import type { Metadata } from 'next';
import { Comic_Neue } from 'next/font/google';
import './globals.css';

const comicNeue = Comic_Neue({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-comic',
});

export const metadata: Metadata = {
	title: 'On Second Thought',
	description: 'Extend quotes with AI-powered contradictions',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${comicNeue.variable} antialiased`}>{children}</body>
		</html>
	);
}
