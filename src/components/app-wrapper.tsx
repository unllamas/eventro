'use client';

import { useRouter } from 'next/navigation';
import { LaWalletConfig } from '@lawallet/react';
import {
  useActiveUser,
  useAutoLogin,
  useLogin,
  useNostrHooks,
  useSigner,
} from 'nostr-hooks';
import { DoorOpen } from 'lucide-react';

import { config } from '@/config/config';
import { ndk } from '@/lib/nostr';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Loggin = (props: {
  label: string;
  onSubmit: (pubkey: string) => any;
  loading: boolean;
}) => {
  // Libs and hooks
  const router = useRouter();

  const { loginWithExtension } = useLogin();
  const { setSigner } = useSigner();
  const { activeUser } = useActiveUser();

  const handleLoginWithExtension = () => {
    loginWithExtension({
      onSuccess: (signer: any) => {
        signer.user().then((user: any) => {
          setSigner(signer);
        });
      },
    });
  };

  return (
    <Dialog open={!activeUser}>
      <DialogContent className="max-w-sm h-auto">
        <DialogHeader className="flex flex-col">
          <div className="flex justify-center items-center w-12 h-12 mb-2 bg-card rounded-full">
            <DoorOpen />
          </div>
          <DialogTitle className={'text-lg font-bold'}>
            Welcome to Eventro
          </DialogTitle>
          <DialogDescription className="text-white">
            Connect and access all the features we have to offer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 w-full">
          <Button className="w-full" onClick={handleLoginWithExtension}>
            Login with extension
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function AppWrapper({ children }: { children: React.ReactNode }) {
  useNostrHooks(ndk);
  useAutoLogin();

  const { activeUser } = useActiveUser();

  if (activeUser) {
    return <LaWalletConfig config={config}>{children}</LaWalletConfig>;
  }

  return <Loggin label="Log in" onSubmit={() => {}} loading={false} />;
}
