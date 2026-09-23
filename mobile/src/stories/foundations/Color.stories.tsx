import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { BRAND_SEED_COLOR, FIGMA_TOKENS } from '@/constants/paper-theme';

// Every paired MD3 color role — a container role always shown with its "on" foreground.
const COLOR_PAIRS = [
  ['primary', 'onPrimary'],
  ['primaryContainer', 'onPrimaryContainer'],
  ['secondary', 'onSecondary'],
  ['secondaryContainer', 'onSecondaryContainer'],
  ['tertiary', 'onTertiary'],
  ['tertiaryContainer', 'onTertiaryContainer'],
  ['error', 'onError'],
  ['errorContainer', 'onErrorContainer'],
  ['background', 'onBackground'],
  ['surface', 'onSurface'],
  ['surfaceVariant', 'onSurfaceVariant'],
  ['inverseSurface', 'inverseOnSurface'],
] as const;

const UTILITY_COLORS = ['outline', 'outlineVariant', 'inversePrimary', 'shadow', 'scrim'] as const;

// The six key tonal palettes the whole scheme is derived from — each role above
// is just one tone picked out of one of these.
const materialTheme = themeFromSourceColor(argbFromHex(BRAND_SEED_COLOR));
const PALETTES = [
  ['Primary', materialTheme.palettes.primary],
  ['Secondary', materialTheme.palettes.secondary],
  ['Tertiary', materialTheme.palettes.tertiary],
  ['Error', materialTheme.palettes.error],
  ['Neutral', materialTheme.palettes.neutral],
  ['Neutral variant', materialTheme.palettes.neutralVariant],
] as const;
const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

// Figma variable → the Material role(s) it overrides in paper-theme.ts.
const FIGMA_TOKEN_ROLES: { token: keyof typeof FIGMA_TOKENS; figma: string; roles: string }[] = [
  { token: 'foreground', figma: 'base/foreground', roles: 'onSurface, onBackground' },
  { token: 'mutedForeground', figma: 'base/muted-foreground', roles: 'onSurfaceVariant' },
  { token: 'accentForeground', figma: 'base/accent-foreground', roles: 'onSecondaryContainer' },
  { token: 'card', figma: 'base/card, base/background', roles: 'surface' },
  { token: 'accent', figma: 'base/accent', roles: 'background, surfaceVariant' },
  { token: 'border', figma: 'base/border', roles: 'outlineVariant' },
  { token: 'secondary', figma: 'base/secondary', roles: 'secondaryContainer (nav indicator)' },
];

function ColorRolesDemo() {
  const theme = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.stack}>
      <Text variant="titleSmall">Color roles</Text>
      <View style={styles.grid}>
        {COLOR_PAIRS.map(([bg, fg]) => (
          <View key={bg} style={[styles.swatch, { backgroundColor: theme.colors[bg] }]}>
            <Text variant="labelMedium" style={{ color: theme.colors[fg] }}>
              {bg}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors[fg] }}>
              {theme.colors[bg]}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="titleSmall">Utility roles</Text>
      <View style={styles.grid}>
        {UTILITY_COLORS.map((role) => (
          <View key={role} style={styles.utilityItem}>
            <View
              style={[styles.utilitySwatch, { backgroundColor: theme.colors[role], borderColor: theme.colors.outlineVariant }]}
            />
            <Text variant="labelSmall">{role}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function FigmaTokensDemo() {
  const theme = useTheme();

  return (
    <View style={styles.stack}>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Variables from the “📱 Pine one App” Figma file, mapped onto Material roles. Roles not listed stay generated from the brand seed.
      </Text>
      {FIGMA_TOKEN_ROLES.map(({ token, figma, roles }) => (
        <View key={token} style={styles.tokenRow}>
          <View style={[styles.tokenSwatch, { backgroundColor: FIGMA_TOKENS[token], borderColor: theme.colors.outlineVariant }]} />
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium">{figma}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {FIGMA_TOKENS[token]} → {roles}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function TonalPalettesDemo() {
  return (
    <ScrollView contentContainerStyle={styles.stack}>
      <Text variant="bodySmall">Seed {BRAND_SEED_COLOR} → six tonal palettes (tone 0–100)</Text>
      {PALETTES.map(([name, palette]) => (
        <View key={name} style={{ gap: 4 }}>
          <Text variant="labelMedium">{name}</Text>
          <View style={styles.toneRow}>
            {TONES.map((tone) => (
              <View key={tone} style={[styles.tone, { backgroundColor: hexFromArgb(palette.tone(tone)) }]}>
                <Text variant="labelSmall" style={{ color: tone < 60 ? '#fff' : '#000', fontSize: 9 }}>
                  {tone}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const meta = {
  title: 'Foundations/Color',
  component: ColorRolesDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: always reference color by role (primary, surface, onSurfaceVariant…) via useTheme(), never by hex — roles are paired so every "on" color is contrast-checked against its container. Our whole scheme is generated from one seed (the PineOne brand green) with Google’s material-color-utilities.',
      },
    },
  },
} satisfies Meta<typeof ColorRolesDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Roles: Story = {};

export const FigmaTokens: Story = {
  render: () => <FigmaTokensDemo />,
};

export const TonalPalettes: Story = {
  render: () => <TonalPalettesDemo />,
};

const styles = StyleSheet.create({
  stack: { gap: 12, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 150, height: 72, borderRadius: 12, padding: 8, justifyContent: 'flex-end' },
  utilityItem: { alignItems: 'center', gap: 4 },
  utilitySwatch: { width: 56, height: 56, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  toneRow: { flexDirection: 'row' },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tokenSwatch: { width: 40, height: 40, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  tone: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
});
