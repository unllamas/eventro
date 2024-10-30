'use client';
import { LaWalletConfig } from '@lawallet/react';

import { config } from '@/config/config';

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LaWalletConfig config={config}>{children}</LaWalletConfig>;
}
