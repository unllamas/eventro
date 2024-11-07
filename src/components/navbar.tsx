'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useActiveUser, useLogin, useProfile } from 'nostr-hooks';
import { useMemo } from 'react';

export function Navbar() {
  return (
    <nav className="w-full h-[60px]">
      <div className="flex gap-2 px-4 w-full max-w-[520px] h-full items-center justify-between mx-auto">
        <Link href="/" className="w-auto">
          <Image
            src={'/iso.png'}
            alt="Eventro isologo"
            width={42}
            height={42}
          />
        </Link>
      </div>
    </nav>
  );
}

export function UserNav({ name, nip05, imageUrl }: any) {
  const router = useRouter();
  const { logout } = useLogin();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative w-8 h-8 rounded-full bg-background border-[1px] border-border cursor-pointer">
          {imageUrl && (
            <Image
              className="rounded-full"
              src={imageUrl}
              alt="Profile image"
              fill
            />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {name && <p className="text-md font-medium leading-none">{name}</p>}
            {nip05 && (
              <p className="text-sm leading-none text-muted-foreground">
                {nip05}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavbarV2({ label, backTo }: any) {
  const { activeUser } = useActiveUser();

  // TO-DO: Optimize this
  const filters = useMemo(() => activeUser?.pubkey, [activeUser?.pubkey]);
  const { profile } = useProfile({ pubkey: filters });

  return (
    <div className="flex flex-col bg-black border-b-[1px] border-border">
      <div className="flex flex-col w-full max-w-[720px] mx-auto px-4">
        <nav className="flex items-center justify-between gap-4 h-[60px]">
          <div className="flex items-center gap-2">
            <div className="max-w-[30px]">
              <Link href="/dash">
                <Image
                  src={'/iso.png'}
                  alt="Eventro isologo"
                  width={42}
                  height={42}
                />
              </Link>
            </div>
            <span className="text-sm text-muted-foreground">Eventro</span>
          </div>
          <div className="flex flex-col items-start">
            <UserNav
              name={profile?.name}
              nip05={profile?.nip05}
              imageUrl={profile?.image}
            />
            {/* <ul>
              <li>
                <Button size="sm" variant="outline" asChild>
                  <Link href="">Account</Link>
                </Button>
              </li>
            </ul> */}
          </div>
        </nav>
        <div className="flex justify-between items-center w-full h-[60px] mb-4">
          <div className="flex flex-col items-start">
            {backTo && (
              <Button className="px-0" variant="link" size="sm" asChild>
                <Link href={backTo}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Link>
              </Button>
            )}
            <h1 className="text-md font-bold text-white">{label}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
