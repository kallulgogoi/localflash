import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LocalFlash — Anonymous Local Chat',
  description:
    'Chat with anonymous strangers within 1km. No login, no history. Everything vanishes in 30 minutes.',
  keywords: ['anonymous chat', 'local chat', 'ephemeral', 'privacy'],
  openGraph: {
    title: 'LocalFlash ⚡',
    description: 'Chat locally. Vanish completely.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        style={{
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          margin: 0,
          padding: 0,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              backgroundColor: '#1A1A1A',
              border: '1px solid #2A2A2A',
              color: '#FFFFFF',
            },
          }}
        />
      </body>
    </html>
  );
}
