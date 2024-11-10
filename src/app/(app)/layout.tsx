import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Eventro',
  description: "Create unforgettable events, we'll take care of the rest.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppWrapper>{children}</AppWrapper>;
}
