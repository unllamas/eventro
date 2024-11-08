import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import dynamic from 'next/dynamic';

const AppWrapper = dynamic(
  () => import('@/components/app-wrapper').then((mod) => mod.AppWrapper),
  {
    loading: () => (
      <div className="flex justify-center items-center w-screen h-screen">
        <p className="font-bold">Loading...</p>
      </div>
    ),
    ssr: false,
  }
);

import { cn } from '@/lib/utils';

import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Eventro',
  description: "Create unforgettable events, we'll take care of the rest.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn('min-h-screen font-sans antialiased', inter.variable)}
      >
        <AppWrapper>{children}</AppWrapper>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
