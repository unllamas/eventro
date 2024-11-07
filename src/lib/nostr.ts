import NDK, { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';

// Nostr
export const RELAYS = ['wss://relay.primal.net/'];

export const ndk = new NDK({ explicitRelayUrls: RELAYS });
