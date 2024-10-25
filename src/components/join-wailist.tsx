'use client';

import { useState } from 'react';
import { DoorOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function JoinWaitlist(props: {
  label: string;
  onSubmit: (pubkey: string) => any;
  loading: boolean;
}) {
  const { label, onSubmit, loading } = props;

  const [pubkey, setPubkey] = useState<string | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{label}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm h-auto">
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
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="title">Nostr</Label>
          <Input
            placeholder="NIP-05 or pubkey"
            type="text"
            value={pubkey as string}
            onChange={(e) => setPubkey(e.target.value)}
          />
        </div>
        <DialogFooter className="flex flex-col">
          <div className="flex flex-col w-full gap-4">
            <Button
              className="w-full"
              size="lg"
              disabled={!pubkey || loading}
              onClick={() => onSubmit(pubkey as string)}
            >
              {loading ? 'Loading...' : 'Sign me up'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
