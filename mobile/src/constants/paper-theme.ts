import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import color from 'color';
import { configureFonts, MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

import { Fonts } from './theme';

/**
 * Material 3 theme, generated from PineOne's real brand primary (the same hex used
 * in theme.ts, itself converted from the web app's OKLCH --primary token) using
 * Google's own Material color algorithm — a full, correct MD3 tonal palette (all
 * ~30 color roles, each properly contrast-checked against its pair) rather than
 * ~30 hand-picked hex values. Light and dark schemes come from the same seed;
 * the user picks Light, Dark or System in the profile panel (use-theme-mode).
 */
export const BRAND_SEED_COLOR = '#365314';

const materialTheme = themeFromSourceColor(argbFromHex(BRAND_SEED_COLOR));

type SchemeColors = Record<keyof ReturnType<typeof materialTheme.schemes.light.toJSON>, string>;

const schemeColors = (scheme: typeof materialTheme.schemes.light) =>
  Object.fromEntries(Object.entries(scheme.toJSON()).map(([role, argb]) => [role, hexFromArgb(argb)])) as SchemeColors;

const colors = schemeColors(materialTheme.schemes.light);

/**
 * Variables from the "📱 Pine one App" Figma file (app shell, node 47:2153).
 * Figma uses shadcn-style neutral tokens, so these override the generated
 * tonal roles where the design defines them: text is a true near-black rather
 * than green-tinted, and the active nav indicator is the lime `base/secondary`.
 * Roles Figma doesn't define (primary, tertiary, error…) stay generated from
 * the brand seed.
 */
export const FIGMA_TOKENS = {
  foreground: '#0a0a0a', // base/foreground
  background: '#ffffff', // base/background
  card: '#ffffff', // base/card
  accent: '#f5f5f5', // base/accent — page background, hairline dividers
  accentForeground: '#171717', // base/accent-foreground
  mutedForeground: '#737373', // base/muted-foreground
  secondary: '#d9f99d', // base/secondary — active nav indicator (under a 50% white layer)
  border: '#e5e5e5', // base/border
} as const;

// Cards are flat white on the grey page, with NO shadow — separation comes from
// that contrast alone. Card usages must also pass `elevation={0}` so Paper
// doesn't layer a tint on top.
colors.background = FIGMA_TOKENS.accent;
colors.surface = FIGMA_TOKENS.card;
colors.surfaceVariant = FIGMA_TOKENS.accent;
colors.onBackground = FIGMA_TOKENS.foreground;
colors.onSurface = FIGMA_TOKENS.foreground;
// A step darker than Figma's muted-foreground (#737373, 4.35:1 on the grey page): muted text is
// mostly on the page background, where #737373 misses WCAG AA for 14px text. #6b6b6b is 4.9:1.
colors.onSurfaceVariant = '#6b6b6b';
colors.outlineVariant = FIGMA_TOKENS.border;
colors.secondaryContainer = FIGMA_TOKENS.secondary;
colors.onSecondaryContainer = FIGMA_TOKENS.accentForeground;

// `Scheme.toJSON()` (the older MD3 role set material-color-utilities returns)
// doesn't include `elevation`, `surfaceDisabled`, or `onSurfaceDisabled` — without
// these, Paper silently falls back to its own MD3LightTheme defaults, which are
// hardcoded to Google's stock purple seed color, NOT ours. This is exactly why
// Menu/Dialog/Snackbar/TextInput surfaces were showing an unthemed purple tint
// regardless of the primary color set above — `elevation.levelN` is literally
// `surface` tinted with the *default* primary at Paper's own fixed opacities
// (see node_modules/react-native-paper/src/styles/themes/v3/LightTheme.tsx).
// Recomputed the same way, but tinted with OUR primary instead.
function additionalColors(scheme: SchemeColors) {
  const surface = color(scheme.surface);
  const primary = color(scheme.primary);
  const onSurface = color(scheme.onSurface);
  return {
    elevation: {
      level0: 'transparent',
      level1: surface.mix(primary, 0.05).hex(),
      level2: surface.mix(primary, 0.08).hex(),
      level3: surface.mix(primary, 0.11).hex(),
      level4: surface.mix(primary, 0.12).hex(),
      level5: surface.mix(primary, 0.14).hex(),
    },
    surfaceDisabled: onSurface.alpha(0.12).rgb().string(),
    onSurfaceDisabled: onSurface.alpha(0.38).rgb().string(),
  };
}

/**
 * Dark mode: the same structure as light — a near-black page, cards a step
 * lighter, hairlines and tiles a step lighter again — in Tailwind's neutral
 * greys (the web's dark tokens), so nothing reads green-tinted. Primary and
 * the other roles Figma doesn't define stay generated from the brand seed.
 */
const darkColors = schemeColors(materialTheme.schemes.dark);
darkColors.background = '#0a0a0a'; // page
darkColors.surface = '#171717'; // cards, header, navigation bar, sheets
darkColors.surfaceVariant = '#262626'; // hairlines, tiles, tracks
darkColors.onBackground = '#fafafa';
darkColors.onSurface = '#fafafa';
darkColors.onSurfaceVariant = '#a3a3a3';
darkColors.outlineVariant = '#333333';
darkColors.secondaryContainer = '#3f6212'; // lime-800: the lime role on dark
darkColors.onSecondaryContainer = '#e5e5e5';

// Each MD3 typescale role gets one of our four static Inter Display weights — these are
// discrete font files (assets/fonts), not a variable font, so
// fontWeight must stay 'normal' or RN will try (and fail) to synthetically bold.
// (Paper's public MD3TypescaleKey is exported type-only, so these are plain string
// literals rather than enum members — same 15 roles Paper's typescale defines.)
const TYPESCALE_FONT_FAMILY = {
  displayLarge: Fonts.bold,
  displayMedium: Fonts.bold,
  displaySmall: Fonts.bold,
  headlineLarge: Fonts.bold,
  headlineMedium: Fonts.bold,
  headlineSmall: Fonts.bold,
  titleLarge: Fonts.semiBold,
  titleMedium: Fonts.medium, // Figma text-base/leading-normal/medium
  titleSmall: Fonts.medium,
  bodyLarge: Fonts.medium,
  bodyMedium: Fonts.medium,
  bodySmall: Fonts.regular, // Figma text-xs/leading-normal/normal
  labelLarge: Fonts.medium,
  labelMedium: Fonts.medium,
  labelSmall: Fonts.regular,
} as const;

// Size/line-height/tracking for the roles the Figma file defines as text styles;
// the rest keep Paper's MD3 defaults.
const FIGMA_TEXT_METRICS: Partial<Record<keyof typeof TYPESCALE_FONT_FAMILY, object>> = {
  titleMedium: { fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodySmall: { fontSize: 12, lineHeight: 16, letterSpacing: 0 },
};

const fontConfig = Object.fromEntries(
  Object.entries(TYPESCALE_FONT_FAMILY).map(([key, fontFamily]) => [
    key,
    { fontFamily, fontWeight: 'normal' as const, ...FIGMA_TEXT_METRICS[key as keyof typeof TYPESCALE_FONT_FAMILY] },
  ])
);

const typescale = configureFonts({ config: fontConfig });

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...colors, ...additionalColors(colors) },
  // `default` is what a Text without a variant gets — including text nested inside another Text,
  // which Paper doesn't let inherit its parent's family. Left unset it's Roboto (San Francisco on iOS).
  fonts: { ...typescale, default: { ...typescale.default, fontFamily: Fonts.regular, fontWeight: 'normal' } },
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...darkColors, ...additionalColors(darkColors) },
  fonts: paperTheme.fonts,
};
