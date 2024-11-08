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
import {
  ClipboardCopyIcon,
  DoorOpen,
  EyeIcon,
  EyeOffIcon,
  Trash2Icon,
} from 'lucide-react';

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
import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';

const Loggin = (props: {
  label: string;
  onSubmit: (pubkey: string) => any;
  loading: boolean;
}) => {
  // Flow
  const [inputValue, setInputValue] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [showInputSecret, setShowInputSecret] = useState<boolean>(false);

  // Libs and hooks
  const router = useRouter();
  const { toast } = useToast();

  const { loginWithExtension, loginWithSecretKey } = useLogin();
  const { setSigner } = useSigner();
  const { activeUser } = useActiveUser();

  useEffect(() => {
    const secret = localStorage.getItem('secret-key');

    if (secret) {
      loginWithSecretKey({
        secretKey: secret as string,
        onSuccess: (signer) => {
          signer.user().then((user) => {
            setSigner(signer);
          });
        },
      });
    }
  }, []);

  const handleLoginWithSecret = () => {
    if (!inputValue) return;

    loginWithSecretKey({
      secretKey: inputValue as string,
      onSuccess: (signer) => {
        signer.user().then((user) => {
          setSigner(signer);
          // router.push(`/dash`);
        });
      },
    });
  };

  const handleLoginWithExtension = () => {
    loginWithExtension({
      onSuccess: (signer: any) => {
        signer.user().then((user: any) => {
          setSigner(signer);
        });
      },
    });
  };

  const handleShowInputSecret = () => {
    setShowInputSecret(!showInputSecret);
  };

  const handleToggleVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops...',
        duration: 2400,
      });
      return null;
    }
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

          <div className="flex gap-4 items-center my-2">
            <Separator className="flex-1" />
            <p className="text-sm text-muted-foreground">OR</p>
            <Separator className="flex-1" />
          </div>

          {!showInputSecret ? (
            <>
              {/* <Button
                className="w-full"
                onClick={handleCreateAccount}
                variant="outline"
              >
                Create account
              </Button> */}
              <div className="text-sm text-center">
                <p className="text-muted-foreground">
                  Do you already have one?
                </p>
                <Button variant="link" onClick={handleShowInputSecret}>
                  Login with private key
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="secret">Your private key</Label>
                <div className="relative w-full">
                  <Input
                    className="pr-[90px]"
                    id="secret"
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="Format hex or nsec..."
                    value={inputValue as string}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <div className="absolute top-0 right-[10px] flex items-center gap-1 h-full">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleToggleVisibility}
                      title={isPasswordVisible ? 'Hide' : 'Show'}
                    >
                      {isPasswordVisible ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </Button>
                    {inputValue ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setInputValue('')}
                        title="Delete value"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePasteInput}
                        title="Paste from clipboard"
                      >
                        <ClipboardCopyIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleLoginWithSecret}
                >
                  Login
                </Button>
                <Button
                  className="w-full"
                  onClick={handleShowInputSecret}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
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
