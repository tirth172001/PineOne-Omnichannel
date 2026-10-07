import color from 'color';
import { useTheme } from 'react-native-paper';

import { BRAND_SEED_COLOR } from './paper-theme';

/**
 * The app's own colours beyond the Material roles, for light and dark: use
 * these instead of fixed hex values so every surface follows the theme.
 */
export function useAppColors() {
  const theme = useTheme();
  const dark = theme.dark;
  return {
    /**
     * The lime highlight: the navigation bar's active indicator, a selected
     * row's icon tile, applied filters, the scope line's pulse. Figma layers a
     * 50% white over base/secondary; on dark, the lime glows faintly instead.
     */
    highlight: dark ? 'rgba(190, 242, 100, 0.18)' : color(theme.colors.secondaryContainer).mix(color('#ffffff'), 0.5).hex(),
    /** Its border, where a highlighted control needs an edge (e.g. Filters with filters applied). */
    highlightBorder: dark ? 'rgba(190, 242, 100, 0.35)' : color(theme.colors.secondaryContainer).darken(0.25).hex(),
    /** Brand marks such as the initials avatar: the brand green, or lime where green wouldn't show on dark. */
    brand: dark ? '#bef264' : BRAND_SEED_COLOR,
    /** Soft tinted backgrounds (Tailwind's 50 shades on light, a faint wash on dark). */
    tint: {
      indigo: dark ? 'rgba(99, 102, 241, 0.16)' : '#eef2ff',
      pink: dark ? 'rgba(219, 39, 119, 0.18)' : '#fdf2f8',
      orange: dark ? 'rgba(234, 88, 12, 0.18)' : '#fff7ed',
      teal: dark ? 'rgba(20, 184, 166, 0.14)' : '#f0fdfa',
    },
    /** Text on an amber warning wash. */
    amberText: dark ? '#fcd34d' : '#78350f',
  };
}
