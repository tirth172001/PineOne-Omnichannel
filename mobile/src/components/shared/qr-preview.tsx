import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import Svg, { Rect } from 'react-native-svg';

import { Fonts } from '@/constants/theme';

export const QR_BACKGROUND_SWATCHES = ['#FFFFFF', '#5478F8', '#4FD387', '#053B29', '#43A114', '#CC8108'] as const;

function hashSeed(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isFinder(x: number, y: number, ox: number, oy: number) {
  if (x < ox || x >= ox + 7 || y < oy || y >= oy + 7) return false;
  const lx = x - ox;
  const ly = y - oy;
  if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true;
  return lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
}

/** Web: createQrMatrix() — a deterministic, seed-driven fake QR (not scannable). */
function createQrMatrix(seed: string, size = 29) {
  const base = hashSeed(seed);
  const finders: [number, number][] = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      if (finders.some(([ox, oy]) => isFinder(x, y, ox, oy))) return true;
      const value = ((x + 17) * 2246822519) ^ ((y + 31) * 3266489917) ^ base;
      return Math.abs(Math.sin(value) * 10000) % 1 > 0.55;
    })
  );
}

/** The bare scan pattern (web: QrCodeGrid). */
export function QrCodeGrid({ seed, color = '#1F1F1F', size = 232 }: { seed: string; color?: string; size?: number }) {
  const matrix = useMemo(() => createQrMatrix(seed), [seed]);
  const count = matrix.length;
  const cell = size / count;
  return (
    <Svg width={size} height={size}>
      {matrix.flatMap((row, y) =>
        row.map((filled, x) => (filled ? <Rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell - 1} height={cell - 1} rx={1} fill={color} /> : null))
      )}
    </Svg>
  );
}

/**
 * Branded store UPI QR (web: QrMatrixPreview): "pine labs", the scan pattern,
 * UPI app marks, and the VPA bar. The pattern re-seeds per store and colour.
 */
export function QrPreview({ seed, backgroundColor, upiId, radius }: { seed: string; backgroundColor: string; upiId?: string; radius: number }) {
  const theme = useTheme();
  const dark = backgroundColor !== '#FFFFFF';
  const qrColor = dark ? '#FFFFFF' : '#1F1F1F';
  return (
    <View style={[styles.frame, { borderRadius: radius, borderColor: theme.colors.outlineVariant }]}>
      <View style={[styles.body, { backgroundColor }]}>
        <View style={styles.center}>
          <Text style={[styles.brand, { color: qrColor }]}>pine labs</Text>
          <Text variant="bodyMedium" style={[styles.medium, { color: dark ? 'rgba(255,255,255,0.85)' : '#333333' }]}>
            Scan & pay via any UPI apps
          </Text>
        </View>
        <QrCodeGrid seed={seed} color={qrColor} />
        <View style={styles.apps}>
          {['PhonePe', 'Paytm', 'GPay', 'CRED', '+50'].map((label) => (
            <View
              key={label}
              style={[
                styles.app,
                {
                  borderColor: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)',
                  backgroundColor: dark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.72)',
                },
              ]}>
              <Text style={[styles.appLabel, { color: qrColor }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
      {upiId ? (
        <View style={[styles.vpa, { backgroundColor: theme.colors.surface }]}>
          <Text variant="bodyMedium" style={styles.medium}>
            UPI ID / VPA: {upiId}
          </Text>
          <Icon source="copy" size={16} color={theme.colors.onSurfaceVariant} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1, overflow: 'hidden' },
  body: { alignItems: 'center', gap: 24, paddingHorizontal: 24, paddingVertical: 32 },
  center: { alignItems: 'center', gap: 8 },
  brand: { fontFamily: Fonts.semiBold, fontSize: 40, lineHeight: 44, letterSpacing: -1.2 },
  medium: { fontFamily: Fonts.medium },
  apps: { flexDirection: 'row', gap: 8 },
  app: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  appLabel: { fontSize: 7, fontFamily: Fonts.medium },
  vpa: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
});
