import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useSvgId } from '@/components/shared/hatch';

/**
 * An Android POS terminal (the Pine Labs "Touch" family), drawn rather than a
 * photo: a dark body with the printer slot on top, the screen with a payment
 * on it, and the card slot and keys below. `inactive` greys the screen out.
 * Swap for product photos when they're available.
 */
export function TerminalImage({ size = 48, inactive = false }: { size?: number; inactive?: boolean }) {
  const bodyId = useSvgId('terminal-body');
  const screenId = useSvgId('terminal-screen');
  const width = size * 0.68;
  return (
    <Svg width={width} height={size} viewBox="0 0 68 100" accessibilityElementsHidden importantForAccessibility="no">
      <Defs>
        <LinearGradient id={bodyId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3a3a36" />
          <Stop offset="1" stopColor="#1d1d16" />
        </LinearGradient>
        <LinearGradient id={screenId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={inactive ? '#d4d4d4' : '#f1fbe2'} />
          <Stop offset="1" stopColor={inactive ? '#bdbdbd' : '#d7f0b4'} />
        </LinearGradient>
      </Defs>
      {/* Printer housing and paper slot. */}
      <Rect x="6" y="0" width="56" height="18" rx="7" fill="#2b2b26" />
      <Rect x="14" y="5" width="40" height="3" rx="1.5" fill="#0f0f0c" />
      {/* Body. */}
      <Rect x="2" y="10" width="64" height="88" rx="10" fill={`url(#${bodyId})`} />
      {/* Screen with a payment on it. */}
      <Rect x="8" y="16" width="52" height="50" rx="5" fill={`url(#${screenId})`} />
      <Rect x="14" y="24" width="22" height="4" rx="2" fill={inactive ? '#9e9e9e' : '#4d7c0f'} opacity={0.7} />
      <Rect x="14" y="33" width="34" height="7" rx="2" fill={inactive ? '#8a8a8a' : '#1d1d16'} opacity={0.85} />
      <Rect x="14" y="52" width="40" height="8" rx="4" fill={inactive ? '#a3a3a3' : '#84cc16'} />
      {/* Keys and card slot. */}
      <Circle cx="22" cy="78" r="3.5" fill="#55554f" />
      <Circle cx="34" cy="78" r="3.5" fill="#55554f" />
      <Circle cx="46" cy="78" r="3.5" fill="#55554f" />
      <Rect x="16" y="89" width="36" height="3" rx="1.5" fill="#0f0f0c" />
    </Svg>
  );
}
