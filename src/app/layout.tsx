import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import { cn } from '@/lib/utils';

import './globals.css';
import { LaWalletConfig } from '@lawallet/react';
import { Wrapper } from '@/components/wrapper';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Eventro',
  description: "Create unforgettable events, we'll take care of the rest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn('min-h-screen font-sans antialiased', inter.variable)}
      >
        <Wrapper>{children}</Wrapper>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
