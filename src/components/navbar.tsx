import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';

import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  return (
    <nav className="w-full h-[60px]">
      <div className="flex gap-2 px-4 w-full max-w-[520px] h-full items-center justify-between mx-auto">
        <Link href="/" className="w-auto">
          {/* <div className="max-w-[200px]">
            <Image
              className="w-full"
              src="/logo.png"
              alt="Eventro logo"
              width={280}
              height={60}
              quality={100}
              priority
            />
          </div> */}

          <Image
            src={'/iso.png'}
            alt="Eventro isologo"
            width={42}
            height={42}
          />
          {/* <LaCryptaIso className="w-auto h-[30px]" /> */}
        </Link>
        {/* <div className='h-full flex items-center gap-2 ml-4'>
                <Select defaultValue='SAT'>
                  <SelectTrigger className='w-auto'>
                    <SelectValue placeholder='Price' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='SAT'>SAT</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='ARS'>ARS</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
      </div>
    </nav>
  );
}

function LaCryptaIso(props: any) {
  return (
    <svg
      {...props}
      width="143"
      height="161"
      viewBox="0 0 143 161"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M143.01 101.13V86.29H89.04V71.45H143C142.98 31.98 110.98 0 71.5 0C32.01 0 0 32.01 0 71.5V160.48H143.01V145.64H29.68V130.8H143.01V115.96H59.35V101.12H143.01V101.13Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative w-8 h-8 rounded-full bg-background border-[1px] border-border cursor-pointer"></div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-md font-medium leading-none">shadcn</p>
            <p className="text-sm leading-none text-muted-foreground">
              m@example.com
            </p>
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
        <DropdownMenuItem>
          Log out
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavbarV2({ label, backTo }: any) {
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
            <UserNav />
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
