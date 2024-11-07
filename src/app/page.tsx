'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { nip19 } from 'nostr-tools';
import { useActiveUser, useLogin } from 'nostr-hooks';

import { useToast } from '@/hooks/use-toast';

import { JoinWaitlist } from '@/components/join-wailist';

import { FEATURES_MOCK } from '@/mock';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Page() {
  // const hasWaitlist = localStorage.getItem('whitelist') === 'true';

  const router = useRouter();
  const { toast } = useToast();
  const { loginWithExtension } = useLogin();
  const { activeUser } = useActiveUser();

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const handleSubmit = async (pubkey: string) => {
    setLoading(true);
    if (!pubkey || !pubkey.startsWith('npub')) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Oops...',
        description: 'The public key is incorrect.',
        duration: 2400,
      });
    }

    try {
      const { data } = nip19.decode(pubkey);

      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey: data }),
      });

      if (!response.ok) {
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'Oops...',
          description: 'The pubkey entered already exists.',
          duration: 2400,
        });

        return null;
      } else {
        setSubmit(true);
        setLoading(false);
        toast({
          title: 'Thank you!',
          description: 'You will hear from us soon :)',
          duration: 4800,
        });
      }
    } catch (error: any) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Oops...',
        description: error?.message as string,
        duration: 4800,
      });
    }
  };

  const handleLogin = () => {
    loginWithExtension();
    router.push('/dash');
  };

  return (
    <div className="overflow-hidden flex flex-col gap-8 justify-between min-h-screen bg-gradient-to-tl from-[#292929] to-[#0A0A0A]">
      <nav className="w-full h-[60px] px-4 bg-black border-b-[1px] border-border">
        <div className="flex flex-col justify-center gap-8 w-full max-w-2xl h-full mx-auto">
          <div className="flex justify-between items-center gap-4 text-center">
            <div className="max-w-[220px]">
              <Image
                src="/logo.png"
                alt="Eventro logo"
                width={280}
                height={60}
                quality={100}
                priority
              />
            </div>
            {/* <h1 className="text-xl md:text-2xl text-white/70">
              Create unforgettable events, we&apos;ll take care of the rest.
            </h1> */}
            {/* {!submit ? (
              <JoinWaitlist
                label="Sign me up for the beta"
                onSubmit={handleSubmit}
                loading={loading}
              />
            ) : ( */}
            {/* {activeUser && (
              <Button size="sm" variant="secondary" asChild>
                <Link href="/dash">Go to dashboard</Link>
              </Button>
            )} */}
            {/* )} */}
          </div>
        </div>
      </nav>
      <div className="flex-1 flex flex-col justify-center items-center gap-4 max-w-2xl mx-auto px-4">
        <h1 className="text-xl md:text-4xl text-center">
          Create unforgettable events, we&apos;ll take care of the rest.
        </h1>
        {!activeUser && <Button onClick={handleLogin}>Login</Button>}
        {/* <div className="grid gap-2 md:gap-8 grid-cols-1 md:grid-cols-2">
          {FEATURES_MOCK?.map((feature) => (
            <div
              className="flex flex-col items-center px-2 max-w-[240px] text-center"
              key={feature.id}
            >
              {feature.icon && (
                <feature.icon className="h-8 w-8 mb-4 text-primary" />
              )}
              <h2 className="text-md font-semibold mb-2">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div> */}
      </div>
      <div className="flex items-end justify-center px-4">
        <div className="relative -mr-24 flex flex-col justify-center items-center">
          <ArrowCheckIn className="-mb-4" />
          <Image
            className="relative z-0 min-w-[200px] md:max-w-[300px]"
            src="/screens/checkin.png"
            alt="Checkin Eventro"
            width={513}
            height={439}
          />
        </div>
        <div className="flex flex-col items-center">
          <ArrowCheckOut className="-mb-4" />
          <Image
            className="relative z-10 min-w-[200px] md:max-w-[300px]"
            src="/screens/checkout.png"
            alt="Checkout Eventro"
            width={513}
            height={548}
          />
        </div>
      </div>
    </div>
  );
}

function ArrowCheckIn(props: any) {
  return (
    <svg
      {...props}
      width="81"
      height="120"
      viewBox="0 0 81 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.5368 13.8481C12.3685 14.7282 11.2668 15.2506 9.23166 15.4153C7.72645 15.5348 6.34523 15.4743 5.08801 15.2339C3.59505 14.9485 2.39585 14.149 1.49039 12.8356C0.584941 11.5222 0.274942 10.119 0.560397 8.62605C0.860875 7.05452 1.71659 5.64616 3.12754 4.40098C4.30483 3.35548 5.75517 2.50064 7.47857 1.83647C7.85366 1.66385 8.43051 1.41576 9.20912 1.09223C9.86271 0.82624 10.4724 0.747331 11.0381 0.855504C11.5253 0.948652 11.985 1.31347 12.4171 1.94995C12.865 2.58944 13.0439 3.14491 12.9537 3.61637C12.8516 4.15069 12.5949 4.59846 12.1837 4.95967C11.7883 5.32389 11.3313 5.45642 10.8127 5.35726C10.3884 5.27613 10.0192 5.0345 9.70512 4.63236C9.81605 4.39294 10.0554 4.12105 10.4231 3.81668C10.8687 3.44577 11.1428 3.20496 11.2454 3.09426L11.1455 2.97743C9.58972 2.67996 7.76903 3.34181 5.68347 4.96299C3.61663 6.57145 2.43146 8.16931 2.12798 9.75656C1.99577 10.448 2.17451 11.1745 2.66422 11.936C3.15692 12.6818 3.74751 13.1287 4.43598 13.2766L5.51583 13.5075C7.62838 13.9603 9.11141 13.9995 9.9649 13.6252C10.2838 13.4907 10.5542 13.184 10.7761 12.7051C10.9425 12.346 11.1672 12.1935 11.45 12.2476C11.6543 12.2866 11.8963 12.5121 12.1759 12.9239C12.4556 13.3358 12.5759 13.6438 12.5368 13.8481Z"
        fill="white"
      />
      <path
        d="M24.1954 14.0736C24.0843 14.6551 23.7791 15.4845 23.2798 16.5619C22.6914 17.8504 22.2243 18.4615 21.8786 18.3954C21.5014 18.3233 21.3774 17.9494 21.5066 17.2736C21.5938 16.8179 21.833 16.1631 22.2243 15.3094C22.6156 14.4557 22.8548 13.801 22.9419 13.3453C23.014 12.9681 22.9451 12.6047 22.735 12.255C22.5279 11.8896 22.2358 11.6709 21.8586 11.5987C20.7114 11.3794 19.3822 11.899 17.8709 13.1576C17.2291 13.7028 16.1716 14.8037 14.6982 16.4605L14.4826 16.5659C13.9887 16.4226 13.7133 16.3292 13.6565 16.2858C13.4043 16.1561 13.3098 15.9263 13.3729 15.5963C13.5322 14.7633 14.0769 13.8738 15.0072 12.9277C16.3823 11.529 17.1242 10.7587 17.2328 10.6165L19.62 6.82132C20.9237 4.77373 21.717 3.77697 21.9999 3.83106C22.1571 3.86111 22.2778 4.03895 22.3622 4.36458C22.4495 4.6745 22.4752 4.92375 22.4391 5.11234C22.34 5.63094 21.4696 7.15867 19.8279 9.69551C20.0824 9.72787 20.506 9.72742 21.0988 9.69415C21.6444 9.65187 22.0666 9.65928 22.3652 9.71637C23.2295 9.88163 23.8103 10.4651 24.1074 11.4667C24.3464 12.2617 24.3757 13.1307 24.1954 14.0736Z"
        fill="white"
      />
      <path
        d="M35.9207 13.8231C35.7223 14.8604 35.1623 15.6166 34.2407 16.092C33.6282 16.3985 32.6543 16.6358 31.319 16.804C29.8175 16.9893 28.8399 17.1608 28.3862 17.3184C28.7788 17.7355 29.5331 18.0508 30.6489 18.2641C30.916 18.3152 31.3176 18.3024 31.8535 18.2257C32.3925 18.1332 32.7955 18.1126 33.0627 18.1636C33.2198 18.1937 33.3675 18.4011 33.5057 18.7859C33.6626 19.158 33.7245 19.4305 33.6915 19.6034C33.6073 20.0434 33.1263 20.3016 32.2483 20.3781C31.6024 20.4338 30.9886 20.406 30.4072 20.2949C29.1657 20.0575 28.2013 19.5636 27.514 18.8132C26.7444 17.9818 26.4753 16.9611 26.7067 15.7511C27.0101 14.1638 28.1371 12.9132 30.0874 11.9992C31.8783 11.1525 33.5988 10.8869 35.2489 11.2024C35.6103 11.2715 35.8395 11.6492 35.9363 12.3356C36.013 12.8716 36.0078 13.3674 35.9207 13.8231ZM34.6446 13.2126L34.0553 13.1C33.3952 12.9738 32.4591 13.2265 31.247 13.8581C30.1411 14.4448 29.3428 15.0415 28.8522 15.6482C29.9076 15.4101 30.9695 15.1815 32.0377 14.9622C33.2332 14.5881 34.1022 14.0049 34.6446 13.2126Z"
        fill="white"
      />
      <path
        d="M44.4823 15.2402C44.4462 15.4288 44.3945 15.6144 44.327 15.797C44.0642 15.8933 43.6828 16.0566 43.1826 16.2868C43.081 16.137 43.0466 15.9757 43.0797 15.8028C43.1097 15.6457 43.208 15.3875 43.3744 15.0284L43.2745 14.9116C42.6459 14.7914 41.7109 15.1664 40.4693 16.0368C39.2308 16.8914 38.5514 17.633 38.4312 18.2616C38.257 19.1731 39.7743 19.9275 42.9832 20.5247L42.9752 20.6942C42.9456 21.275 42.5378 21.6613 41.7518 21.8531C41.1537 21.9994 40.5325 22.0109 39.8882 21.8877C38.8667 21.6924 38.0924 21.2267 37.5652 20.4906C37.0538 19.7575 36.8957 18.8802 37.091 17.8587C37.2863 16.8373 37.6776 15.9835 38.2649 15.2976C38.6005 14.9057 39.3045 14.2909 40.3768 13.4534C40.3925 13.4564 40.884 13.3142 41.8512 13.0267C42.4897 12.8393 42.974 12.7772 43.3041 12.8403C44.357 13.0416 44.7497 13.8416 44.4823 15.2402Z"
        fill="white"
      />
      <path
        d="M58.5959 16.7903C58.4878 17.3561 57.4418 17.9706 55.4579 18.6338C55.1794 18.7272 53.8694 19.1039 51.5278 19.7638C51.9645 20.2057 52.6182 20.8764 53.4888 21.7759C54.2269 22.6012 54.5134 23.4461 54.3481 24.3104C54.303 24.5461 54.1068 24.7204 53.7594 24.8332L52.9784 24.3173L53.1036 23.5349C51.6227 22.0789 50.2305 21.0959 48.9271 20.5861C47.9714 21.4948 46.7829 22.5137 45.3616 23.6429C45.206 23.4339 45.0592 23.1371 44.921 22.7523C44.7828 22.3675 44.7347 22.0651 44.7768 21.8451C44.7888 21.7822 45.1827 21.4258 45.9586 20.776C46.7344 20.1261 47.1479 19.6676 47.199 19.4004C47.238 19.1961 47.1874 18.7792 47.0472 18.1497C47.1445 18.152 47.4083 18.178 47.8386 18.2277C48.1245 18.2661 48.3846 18.2262 48.6189 18.1081C49.2815 17.795 50.3797 16.4818 51.9134 14.1687C53.7632 11.3948 54.853 9.82752 55.1825 9.467C55.7508 10.2435 55.9974 10.8283 55.9223 11.2211C55.8742 11.4726 55.271 12.4975 54.1126 14.296C52.97 16.0975 52.2556 17.15 51.9695 17.4537L51.9469 17.5716L52.0052 17.7782C52.2305 17.7072 53.2704 17.2952 55.1248 16.542C56.8542 15.8464 57.7661 15.5077 57.8603 15.5257C58.0018 15.5527 58.1633 15.7302 58.345 16.0582C58.5423 16.3891 58.626 16.6332 58.5959 16.7903Z"
        fill="white"
      />
      <path
        d="M66.1143 21.0867C65.6817 21.1343 65.0856 21.1425 64.3259 21.1113C63.0514 21.0468 61.7636 21.0938 60.4627 21.2523C59.4627 21.3706 58.8291 21.4042 58.5619 21.3531C58.2634 21.296 58.07 21.0718 57.982 20.6803C57.9104 20.3733 57.9076 20.047 57.9737 19.7013C57.9977 19.5756 58.0266 19.467 58.0604 19.3758C58.5418 19.1583 59.5261 19.037 61.0133 19.0118C62.353 18.9911 63.3765 19.0483 64.0836 19.1835C65.498 19.4539 66.1749 20.0883 66.1143 21.0867Z"
        fill="white"
      />
      <path
        d="M72.8904 16.1026C72.7612 16.7784 72.4609 17.0712 71.9894 16.981C71.7066 16.9269 71.4081 16.6988 71.094 16.2967L71.0975 16.1507C71.1486 15.8836 71.3165 15.5166 71.6012 15.0497C71.9047 14.5702 72.1631 14.3264 72.3764 14.3183C72.8573 14.7849 73.0286 15.3797 72.8904 16.1026ZM70.2391 20.3849C70.0798 21.2178 69.6378 22.3794 68.913 23.8698C68.2039 25.3632 67.5741 26.3994 67.0236 26.9783L66.5521 26.8882C66.4266 26.5221 66.418 26.0562 66.5262 25.4904C66.7215 24.4689 67.1792 23.3103 67.8994 22.0145C68.3138 21.2955 68.9462 20.2028 69.7967 18.7365C70.2689 18.9082 70.4163 19.4577 70.2391 20.3849Z"
        fill="white"
      />
      <path
        d="M80.5457 23.6017C80.4256 24.2303 80.0555 25.1858 79.4357 26.4682C78.7356 27.9145 78.182 28.6801 77.7747 28.7652C77.4392 28.0494 77.3435 27.3144 77.4878 26.56C77.5719 26.12 77.8193 25.5076 78.23 24.7227C78.6564 23.9409 78.9117 23.33 78.9958 22.89C79.0589 22.5599 78.9098 22.3604 78.5483 22.2913C77.2754 22.0479 75.1167 23.9238 72.0722 27.9192C71.9314 27.9737 71.7982 27.989 71.6725 27.9649C71.3739 27.9078 71.169 27.6162 71.0578 27.0899C70.9444 26.661 70.9207 26.2737 70.9868 25.9279C71.0259 25.7236 71.356 25.0618 71.9773 23.9426C72.5521 22.8959 72.9511 22.2147 73.1743 21.8991C73.1101 21.7239 73.0975 21.5341 73.1366 21.3298L73.2052 21.0986C73.7391 20.7771 74.0809 20.5656 74.2307 20.4639C74.6208 20.2127 74.9308 19.9543 75.1608 19.6888C75.3658 19.8094 75.675 20.1943 76.0884 20.8435C77.4996 20.364 78.4959 20.1798 79.0774 20.291C79.5174 20.3752 79.8995 20.8473 80.2237 21.7075C80.5316 22.4831 80.6389 23.1145 80.5457 23.6017Z"
        fill="white"
      />
      <path
        d="M21.6474 117.879C18.8616 107.842 18.0374 97.2666 19.177 86.8937C20.3123 76.443 23.3335 66.1994 28.1241 56.8725C30.8004 51.6467 34.0391 46.7018 37.8122 42.2349C38.9473 40.8829 36.8923 39.045 35.7571 40.397C28.8035 48.7512 23.6043 58.4523 20.1981 68.7955C16.8654 79.0564 15.4448 89.9917 16.0074 100.777C16.3461 106.85 17.3445 112.847 18.9614 118.732C19.5241 120.419 22.1322 119.57 21.6474 117.879Z"
        fill="white"
      />
      <path
        d="M17.4816 49.4999C23.5924 44.2386 31.2457 40.7267 39.2628 39.5376C38.8344 38.8586 38.3692 38.2206 37.9409 37.5416C35.2518 43.9397 33.482 50.7161 32.811 57.5873C32.7354 58.3335 33.1271 59.0536 33.8776 59.207C34.5502 59.3647 35.4217 58.8866 35.4973 58.1404C36.1814 51.5027 37.8084 44.9686 40.3916 38.7717C40.7331 37.8935 40.1921 36.596 39.0697 36.7758C30.3194 38.123 22.1342 41.8988 15.3898 47.7031C14.8298 48.1639 15.0052 49.2085 15.4984 49.6495C16.1517 50.1598 16.8848 50.0018 17.4816 49.4999Z"
        fill="white"
      />
    </svg>
  );
}

function ArrowCheckOut(props: any) {
  return (
    <svg
      {...props}
      width="103"
      height="118"
      viewBox="0 0 103 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.1205 33.1153C14.3236 33.9879 13.5285 34.9123 11.7351 35.8884C10.4078 36.6081 9.12074 37.1131 7.87408 37.4033C6.39367 37.748 4.97328 37.5037 3.61291 36.6704C2.25254 35.8372 1.40003 34.6804 1.05537 33.2C0.692574 31.6416 0.903474 30.0072 1.68807 28.2968C2.34008 26.8636 3.31902 25.494 4.62487 24.1878C4.8977 23.8779 5.32434 23.4172 5.90479 22.8056C6.3943 22.2974 6.91955 21.978 7.48055 21.8474C7.96363 21.7349 8.53176 21.8819 9.18494 22.2884C9.85371 22.6912 10.2425 23.1264 10.3513 23.5939C10.4747 24.1237 10.4217 24.6371 10.1924 25.1341C9.97873 25.6274 9.61475 25.9339 9.1005 26.0536C8.67975 26.1516 8.24429 26.0805 7.7941 25.8403C7.79839 25.5764 7.90685 25.2308 8.11949 24.8035C8.37632 24.2837 8.52918 23.9524 8.57807 23.8096L8.43943 23.7433C6.89669 24.1025 5.50096 25.446 4.25226 27.7737C3.0155 30.0823 2.58034 32.0235 2.94676 33.5974C3.10639 34.2831 3.56446 34.8746 4.32095 35.3721C5.07382 35.8539 5.79489 36.0228 6.48418 35.8788L7.56487 35.6518C9.6795 35.2088 11.0509 34.6431 11.6792 33.9547C11.9162 33.7024 12.0389 33.3124 12.0475 32.7847C12.0539 32.3889 12.1974 32.1584 12.4779 32.0931C12.6805 32.0459 12.9931 32.1539 13.4158 32.4169C13.8384 32.6799 14.0733 32.9127 14.1205 33.1153Z"
        fill="white"
      />
      <path
        d="M24.8684 28.5924C25.0027 29.169 25.0601 30.0509 25.0408 31.2382C25.0256 32.6546 24.8466 33.4026 24.5037 33.4825C24.1297 33.5695 23.8647 33.278 23.7087 32.6079C23.6035 32.156 23.5566 31.4605 23.568 30.5215C23.5793 29.5825 23.5324 28.887 23.4272 28.4351C23.3401 28.0611 23.1297 27.7569 22.7958 27.5225C22.4584 27.2725 22.1026 27.191 21.7286 27.2781C20.5911 27.5429 19.5868 28.5571 18.716 30.3204C18.3505 31.0791 17.8304 32.5144 17.1557 34.6264L17.0014 34.8102C16.4918 34.8795 16.2023 34.9059 16.1327 34.8892C15.8496 34.873 15.67 34.7012 15.5938 34.374C15.4015 33.5481 15.5386 32.514 16.0051 31.2719C16.6948 29.4357 17.0604 28.4306 17.102 28.2567L17.7446 23.8194C18.1057 21.419 18.4265 20.1861 18.707 20.1208C18.8629 20.0845 19.0454 20.1981 19.2546 20.4615C19.4601 20.7094 19.5846 20.9268 19.6282 21.1138C19.7479 21.6281 19.572 23.3775 19.1005 26.3622C19.3462 26.2885 19.7332 26.1163 20.2616 25.8454C20.7432 25.5855 21.132 25.421 21.4281 25.3521C22.2852 25.1525 23.0527 25.4503 23.7306 26.2453C24.2715 26.875 24.6507 27.6574 24.8684 28.5924Z"
        fill="white"
      />
      <path
        d="M35.4842 23.6075C35.7236 24.6359 35.5185 25.5544 34.8689 26.3627C34.4334 26.8912 33.6395 27.5032 32.4871 28.1986C31.1899 28.977 30.3658 29.5303 30.0151 29.8584C30.5432 30.0804 31.3605 30.0626 32.4669 29.805C32.7318 29.7434 33.0936 29.5688 33.5524 29.2813C34.0075 28.9782 34.3675 28.7958 34.6324 28.7341C34.7883 28.6978 35.0074 28.8275 35.2898 29.1232C35.5841 29.3997 35.7513 29.6236 35.7912 29.795C35.8928 30.2313 35.5578 30.6625 34.7863 31.0885C34.2185 31.4015 33.6463 31.625 33.0697 31.7593C31.8386 32.0459 30.7568 31.9856 29.8242 31.5785C28.7835 31.1308 28.1235 30.307 27.8442 29.107C27.4778 27.5331 28.0005 25.9329 29.4125 24.3064C30.706 22.806 32.1709 21.8654 33.8071 21.4844C34.1655 21.401 34.5282 21.6533 34.8951 22.2414C35.1826 22.7002 35.379 23.1555 35.4842 23.6075ZM34.0702 23.567L33.4858 23.7031C32.8313 23.8554 32.0782 24.4661 31.2264 25.5351C30.4536 26.52 29.9659 27.3892 29.7635 28.1427C30.6317 27.497 31.5095 26.8573 32.397 26.2236C33.338 25.3967 33.8957 24.5112 34.0702 23.567Z"
        fill="white"
      />
      <path
        d="M43.8847 21.4299C43.9282 21.6169 43.9561 21.8076 43.9685 22.0018C43.7674 22.1965 43.485 22.5005 43.1212 22.9137C42.9675 22.8181 42.8707 22.6845 42.8308 22.5131C42.7945 22.3573 42.7796 22.0815 42.786 21.6857L42.6474 21.6194C42.0241 21.7645 41.3215 22.4867 40.5397 23.7858C39.7543 25.0693 39.4341 26.0227 39.5793 26.646C39.7897 27.5499 41.4826 27.6239 44.6579 26.8683L44.7194 27.0264C44.9279 27.5693 44.7119 28.0878 44.0712 28.5819C43.5839 28.9582 43.0207 29.2208 42.3818 29.3695C41.3689 29.6053 40.4722 29.4937 39.6918 29.0347C38.927 28.5721 38.4267 27.8343 38.1909 26.8214C37.955 25.8085 37.9664 24.8695 38.225 24.0043C38.3727 23.5099 38.7668 22.6625 39.4073 21.462C39.4229 21.4584 39.8144 21.129 40.5819 20.4739C41.0895 20.0436 41.507 19.7904 41.8342 19.7142C42.8783 19.4711 43.5618 20.043 43.8847 21.4299Z"
        fill="white"
      />
      <path
        d="M57.4139 17.122C57.5445 17.683 56.8376 18.669 55.2933 20.0799C55.0766 20.2782 54.032 21.1539 52.1594 22.7069C52.7378 22.9337 53.6074 23.2816 54.768 23.7506C55.7774 24.2056 56.3819 24.8616 56.5815 25.7187C56.6359 25.9524 56.5272 26.1913 56.2554 26.4353L55.3323 26.2806L55.1294 25.5146C53.1852 24.7844 51.514 24.4507 50.1157 24.5134C49.6108 25.7316 48.9378 27.145 48.0966 28.7536C47.8697 28.6258 47.6151 28.414 47.3327 28.1183C47.0503 27.8227 46.8837 27.5657 46.8329 27.3476C46.8184 27.2852 47.0339 26.7997 47.4795 25.891C47.925 24.9823 48.117 24.3955 48.0553 24.1306C48.0081 23.928 47.7928 23.5675 47.4092 23.0489C47.4991 23.0116 47.7507 22.9283 48.1642 22.7992C48.4411 22.7183 48.6627 22.5764 48.829 22.3734C49.3076 21.8184 49.7787 20.1727 50.2423 17.4363C50.808 14.1505 51.1684 12.276 51.3234 11.8127C52.1578 12.292 52.6203 12.7265 52.711 13.116C52.7691 13.3654 52.6334 14.5469 52.3042 16.6606C51.9904 18.7707 51.7644 20.0226 51.6261 20.4162L51.6533 20.5331L51.7903 20.6983C51.9675 20.5421 52.7509 19.7436 54.1404 18.303C55.439 16.9657 56.135 16.2862 56.2285 16.2645C56.3688 16.2318 56.5884 16.3285 56.8875 16.5546C57.2021 16.777 57.3776 16.9662 57.4139 17.122Z"
        fill="white"
      />
      <path
        d="M66.0287 17.9995C65.6526 18.2185 65.111 18.4678 64.404 18.7474C63.2128 19.2054 62.0548 19.7707 60.93 20.4432C60.064 20.957 59.4985 21.2447 59.2336 21.3064C58.9375 21.3753 58.6698 21.2487 58.4305 20.9266C58.2406 20.6751 58.1057 20.378 58.0258 20.0351C57.9968 19.9105 57.9792 19.7996 57.973 19.7024C58.3248 19.3084 59.1753 18.7983 60.5245 18.172C61.7406 17.6096 62.6993 17.2468 63.4006 17.0835C64.8031 16.757 65.6791 17.0623 66.0287 17.9995Z"
        fill="white"
      />
      <path
        d="M75.986 15.4349C76.269 16.6504 75.8952 18.0434 74.8644 19.614C73.8457 21.1655 72.7286 22.0827 71.5131 22.3656C70.282 22.6522 69.2402 20.9645 68.3876 17.3024C68.3005 16.9284 68.4439 16.3447 68.8177 15.5513C69.1916 14.7579 69.5541 14.3039 69.9052 14.1892C70.2824 13.9043 70.683 13.6139 71.107 13.3181C71.6842 12.9044 72.0663 12.6758 72.2533 12.6323C73.0481 12.4472 73.84 12.6736 74.6292 13.3112C75.3415 13.9011 75.7938 14.609 75.986 15.4349ZM74.5759 15.5168C74.4017 14.7688 73.9563 14.4782 73.2394 14.6451C72.8031 14.7467 72.3114 15.0337 71.7642 15.506C71.7392 15.6104 71.6358 15.7659 71.4539 15.9725C71.284 16.1599 71.1769 16.2999 71.1327 16.3923C70.9466 16.8628 70.8514 18.1827 70.8472 20.3522C71.9536 20.0946 72.8945 19.5141 73.6698 18.6108C74.5206 17.6078 74.8226 16.5764 74.5759 15.5168Z"
        fill="white"
      />
      <path
        d="M86.3593 10.9992C86.3836 11.1743 86.3434 11.4958 86.2388 11.9637C86.1639 12.2768 86.0884 12.623 86.0124 13.0021C85.8746 14.3155 85.5161 15.5982 84.9369 16.8502C84.1929 18.4526 83.33 19.3681 82.3482 19.5967C81.6937 19.749 81.0412 19.6628 80.3906 19.3378C79.7363 18.9973 79.333 18.4998 79.1806 17.8453C78.4695 14.791 78.1378 12.8722 78.1855 12.089C78.1996 11.9379 78.3035 11.7494 78.4974 11.5236C78.6912 11.2977 78.8025 11.1404 78.8311 11.0516L79.4388 10.9101C79.715 11.1087 79.9081 11.4087 80.018 11.8102C79.9335 11.5178 80.0073 11.8702 80.2395 12.8675C80.3338 13.2727 80.4891 13.869 80.7053 14.6565C80.9215 15.444 81.0767 16.0403 81.1711 16.4455C81.269 16.8663 81.314 17.2008 81.3061 17.449C81.3986 17.4932 81.5149 17.499 81.6552 17.4663L82.2863 17.3194C82.8629 17.1852 83.4693 16.0501 84.1055 13.9142C84.2283 13.5242 84.5692 12.1306 85.1282 9.73341C85.4834 9.84785 85.8938 10.2698 86.3593 10.9992Z"
        fill="white"
      />
      <path
        d="M95.2499 0.699017L95.288 0.862642C95.3823 1.26781 95.3179 1.76742 95.0948 2.36148C94.9206 2.81274 94.7459 3.29698 94.5706 3.81419C94.41 5.10011 94.1375 6.82276 93.7531 8.98216C93.7883 9.20395 93.9696 9.27676 94.2968 9.20057C94.4059 9.17518 94.5719 9.11189 94.7947 9.01072C95.0176 8.90956 95.1836 8.84627 95.2926 8.82088C96.2121 8.60683 96.839 9.07692 97.1734 10.2312C96.9698 10.3443 96.3113 10.6208 95.1981 11.0607C94.3113 11.415 93.7201 11.7333 93.4244 12.0157C93.1958 12.2332 93.06 12.7084 93.017 13.4412C92.9448 14.5423 92.9341 15.2019 92.9849 15.42C93.0284 15.607 93.1776 15.8598 93.4325 16.1783C93.6993 16.4776 93.8545 16.7207 93.898 16.9077C93.9306 17.048 93.8423 17.2328 93.6328 17.4623C93.427 17.7074 93.254 17.8462 93.1138 17.8789C92.4904 18.024 91.9647 17.1771 91.5366 15.3383C91.3044 14.341 91.2341 13.6509 91.3257 13.2682C91.1673 13.2229 91.0024 13.2203 90.831 13.2602C90.6284 13.3073 90.3391 13.4404 89.963 13.6594C89.5832 13.8628 89.292 13.9881 89.0894 14.0353C88.7778 14.1078 88.4498 14.1103 88.1054 14.0426L87.8007 12.7336C88.7656 11.8682 89.725 11.226 90.6788 10.8068C91.0455 10.6885 91.2738 10.6108 91.3637 10.5734C91.6333 10.4613 91.8159 10.3285 91.9116 10.1748C92.1985 9.71372 92.459 8.6099 92.6931 6.86334C93.0049 4.39227 93.2131 2.92278 93.3177 2.45487C93.6254 0.954009 94.052 0.140089 94.5974 0.0131099C94.9091 -0.0594494 95.1266 0.169187 95.2499 0.699017Z"
        fill="white"
      />
      <path
        d="M93.9044 115.356C100.712 107.385 101.117 95.9356 98.3672 86.2185C96.6793 80.2202 93.8894 74.6484 90.8552 69.2321C87.821 63.8158 84.689 58.4618 81.166 53.3564C77.2698 47.6646 72.6894 42.4081 67.0203 38.4623C66.4028 38.0313 66.474 36.9561 66.8872 36.4185C67.4471 35.7876 68.3134 35.8543 68.931 36.2854C79.5094 43.6305 86.1865 55.3117 92.446 66.2288C98.4878 76.8037 103.801 88.3915 102.587 100.836C102.009 106.835 99.876 112.655 95.9525 117.28C94.7972 118.701 92.6691 116.76 93.9044 115.356Z"
        fill="white"
      />
      <path
        d="M89.0043 42.2582C82.2022 40.2006 75.1378 39.1338 67.9711 39.0933C68.4021 38.4758 68.8332 37.8582 69.3131 37.2096C71.8052 43.1768 73.7953 49.3261 75.1544 55.6709C75.3143 56.4617 74.9766 57.2259 74.1679 57.4658C73.4881 57.6923 72.5329 57.2702 72.373 56.4793C71.0139 50.1345 69.0727 43.9541 66.5317 38.018C66.1807 37.1427 66.9894 36.1475 67.8736 36.1342C75.2491 36.1792 82.5712 37.2194 89.6444 39.3792C90.3952 39.588 90.9106 40.2901 90.7328 41.0898C90.555 41.8896 89.7863 42.516 89.0043 42.2582Z"
        fill="white"
      />
    </svg>
  );
}
