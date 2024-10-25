'use client';

import { useState } from 'react';
import { DoorOpen, ShieldAlert } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { db } from '@/config/db';

export function LoginDialog(props: { label: string }) {
  const { label } = props;

  // const [pubkey, setPubkey] = useState<string | null>(null);

  // const { setSigner } = useSigner();
  // const { loginWithExtension } = useLogin();

  const handleLoginWithExtension = () => {
    // loginWithExtension({
    //   onSuccess: (signer: any) => {
    //     signer.user().then(async (user: any) => {
    //       setSigner(signer);
    //       // setPubkey(user?.pubkey);
    //     });
    //   },
    // });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{label}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm h-auto">
        <Login />
        {/* <DialogFooter className="flex flex-col">
          <div className="flex flex-col w-full gap-2">
            <div className="flex gap-4 items-center my-2">
              <Separator className="flex-1" />
              <p className="text-sm text-muted-foreground">OR</p>
              <Separator className="flex-1" />
            </div>
            <Button
              className="w-full"
              size="lg"
              variant="secondary"
              onClick={handleLoginWithExtension}
            >
              Login with extension
            </Button>
          </div>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}

function Login() {
  const [sentEmail, setSentEmail] = useState('');

  if (!sentEmail) {
    return <Email setSentEmail={setSentEmail} />;
  }

  return <MagicCode sentEmail={sentEmail} />;
}

function Email(props: { setSentEmail: any }) {
  const { setSentEmail } = props;

  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) return;

    setSentEmail(email);

    db.auth.sendMagicCode({ email }).catch((err) => {
      alert('Uh oh :' + err.body?.message);
      setSentEmail('');
    });
  };

  return (
    <>
      <DialogHeader className="flex flex-col">
        <div className="flex justify-center items-center w-12 h-12 mb-2 bg-card rounded-full">
          <DoorOpen />
        </div>
        <DialogTitle className={'text-lg font-bold'}>
          Welcome to Eventro
        </DialogTitle>
        <DialogDescription className="text-white">
          Please log in to register for a beta.
        </DialogDescription>
      </DialogHeader>
      <form className={'flex flex-col gap-4'} onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="title">Email</Label>
          <Input
            placeholder="you@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button className="w-full" size="lg" type="submit">
          Send code
        </Button>
      </form>
    </>
  );
}

function MagicCode(props: { sentEmail: string }) {
  const { sentEmail } = props;

  const { toast } = useToast();

  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    db.auth
      .signInWithMagicCode({ email: sentEmail, code })
      .then(({ user }) => {
        if (!user) return null;
        const data = { id: user?.id, email: user?.email };
        toast({
          title: 'Thank you!',
          description: 'You will hear from us soon :)',
        });
        // addUser(data);
      })
      .catch((err) => {
        alert('Uh oh :' + err.body?.message);
        setCode('');
      });
  };

  return (
    <>
      <DialogHeader className="flex flex-col">
        <div className="flex justify-center items-center w-12 h-12 mb-2 bg-card rounded-full">
          <ShieldAlert />
        </div>
        <DialogTitle className={'text-lg font-bold'}>Access code</DialogTitle>
        <DialogDescription className="text-white/70">
          Please enter the 6-digit code we sent to <strong>{sentEmail}</strong>
        </DialogDescription>
      </DialogHeader>
      <form
        className={'flex flex-col items-center gap-4'}
        onSubmit={handleSubmit}
      >
        <InputOTP
          maxLength={6}
          value={code || ''}
          onChange={(value: string) => setCode(value)}
        >
          <InputOTPGroup className="w-full">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="flex justify-between gap-2 w-full">
          <Button className="w-full" type="submit" size="lg">
            Verify
          </Button>
        </div>
      </form>
    </>
  );
}
