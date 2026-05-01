import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TypeFlow — English Listening & Typing Practice',
  description: 'Listen to English sentences and type them out. Get instant word-by-word feedback.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-desk font-serif text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
