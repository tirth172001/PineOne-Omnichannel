import type { ImageSourcePropType } from 'react-native';

/**
 * Mock organisations and their shops for the header's org/shop switcher.
 * UI-only, like the web app's lib/*-data.ts: there's no backend yet. Health &
 * Glow / Koramangala match the Figma app shell (node 47:2153).
 */
export type Shop = {
  id: string;
  name: string;
  address: string;
  /** Fraction of the organisation's business done at this shop (an organisation's shops sum to 1). Scales Overview numbers when a subset of shops is selected. */
  share: number;
};

export type Organisation = {
  id: string;
  name: string;
  /** Brand mark; organisations without one fall back to initials. */
  logo?: ImageSourcePropType;
  shops: Shop[];
};

export const ORGANISATIONS: Organisation[] = [
  {
    id: 'health-and-glow',
    name: 'Health & Glow',
    logo: require('../../assets/images/mock/health-and-glow-logo.png'),
    shops: [
      { id: 'hg-koramangala', name: 'Koramangala', address: '80 Feet Rd, Koramangala 4th Block, Bengaluru', share: 0.34 },
      { id: 'hg-indiranagar', name: 'Indiranagar', address: '100 Feet Rd, Indiranagar, Bengaluru', share: 0.28 },
      { id: 'hg-hsr', name: 'HSR Layout', address: '27th Main Rd, HSR Layout Sector 1, Bengaluru', share: 0.22 },
      { id: 'hg-whitefield', name: 'Whitefield', address: 'Phoenix Marketcity, Whitefield, Bengaluru', share: 0.16 },
    ],
  },
  {
    id: 'vijay-sales',
    name: 'Vijay Sales',
    shops: [
      { id: 'vs-sector-21', name: 'Sector 21', address: 'Candor TechSpace, Noida', share: 0.6 },
      { id: 'vs-sector-35', name: 'Sector 35', address: 'Candor TechSpace, Noida', share: 0.4 },
    ],
  },
];

/** Same signed-in user and role as the web Overview's greeting ("Good morning, Tirth Trivedi · Admin"). */
export const CURRENT_USER = {
  name: 'Tirth Trivedi',
  roleLabel: 'Admin',
  avatar: require('../../assets/images/mock/user-avatar.png') as ImageSourcePropType,
};
