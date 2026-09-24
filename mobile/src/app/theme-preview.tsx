import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Chip,
  Divider,
  Icon,
  ProgressBar,
  RadioButton,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { AppHeader } from '@/components/app-header';
import { AttentionBanner } from '@/components/attention-banner';
import { SearchBar } from '@/components/search-bar';
import { ShellTopBar } from '@/components/shell-top-bar';
import { StatCard } from '@/components/stat-card';
import { ThemePreviewSection } from '@/components/theme-preview-section';
import { ORGANISATIONS } from '@/data/businesses';

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
] as const;

// Unpaired structural/utility roles — outlines, inverse surface, shadow/scrim.
// Shown as plain swatches since most don't have a matching "on" color.
const UTILITY_COLORS = [
  'outline',
  'outlineVariant',
  'inverseSurface',
  'inverseOnSurface',
  'inversePrimary',
  'shadow',
  'scrim',
] as const;

// The 6 MD3 elevation levels — surface tinted with primary at increasing opacity.
// This is exactly what leaked Google's stock purple before it was fixed (see
// paper-theme.ts) — every level here should read as a green tint, not purple.
const ELEVATION_LEVELS = ['level0', 'level1', 'level2', 'level3', 'level4', 'level5'] as const;

// Our own spacing scale (not an MD3 mandate — MD3 leaves spacing to the app).
// These are the values actually used across the components built so far.
const SPACING_SCALE = [
  { label: '4', value: 4 },
  { label: '8', value: 8 },
  { label: '12', value: 12 },
  { label: '16', value: 16 },
  { label: '20', value: 20 },
  { label: '24', value: 24 },
  { label: '32', value: 32 },
] as const;

// A sample of the Phosphor icons used in this app. Every icon name must be
// registered in src/components/icons.tsx (Storybook's Foundations/Icons shows them all).
const ICON_SAMPLE = [
  'house',
  'wallet',
  'file-text',
  'chat-circle',
  'list',
  'bell',
  'caret-down',
  'magnifying-glass',
  'credit-card',
  'x',
  'trend-up',
  'trend-down',
  'check',
  'info',
  'users',
  'briefcase',
  'gear',
  'plus',
] as const;

const TYPESCALE_VARIANTS = [
  'displayLarge',
  'displayMedium',
  'displaySmall',
  'headlineLarge',
  'headlineMedium',
  'headlineSmall',
  'titleLarge',
  'titleMedium',
  'titleSmall',
  'bodyLarge',
  'bodyMedium',
  'bodySmall',
  'labelLarge',
  'labelMedium',
  'labelSmall',
] as const;

/**
 * One-page preview of the whole Material 3 design system with PineOne's theme
 * applied — colors, typography, Paper's core controls, and our own composite
 * components, all in one place to eyeball before iterating further on any one
 * screen. Not part of the 5-tab flow (see app-tabs.tsx, which hides the bottom
 * bar on this route) — reach it by navigating to /theme-preview directly.
 */
export default function ThemePreviewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [radioValue, setRadioValue] = useState('a');
  const [segment, setSegment] = useState('day');
  const [text, setText] = useState('');

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Text variant="headlineSmall" style={styles.pageTitle}>
        Design system preview
      </Text>

      <ThemePreviewSection title="Colors">
        <View style={styles.colorGrid}>
          {COLOR_PAIRS.map(([bg, fg]) => (
            <View key={bg} style={[styles.swatch, { backgroundColor: theme.colors[bg] }]}>
              <Text variant="labelSmall" style={{ color: theme.colors[fg] }}>
                {bg}
              </Text>
            </View>
          ))}
        </View>
        <Text variant="labelSmall" style={[styles.subLabel, { color: theme.colors.onSurfaceVariant }]}>
          Utility roles
        </Text>
        <View style={styles.colorGrid}>
          {UTILITY_COLORS.map((role) => (
            <View
              key={role}
              style={[
                styles.swatch,
                { backgroundColor: theme.colors[role], borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.outline },
              ]}>
              <Text
                variant="labelSmall"
                style={{ color: role.startsWith('inverse') ? theme.colors.inverseOnSurface : theme.colors.onSurface }}>
                {role}
              </Text>
            </View>
          ))}
        </View>
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Elevation">
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Surface tinted with our primary at increasing opacity — this is exactly what leaked
          Google&rsquo;s stock purple before it was fixed; every step here should read green.
        </Text>
        <View style={styles.row}>
          {ELEVATION_LEVELS.map((level) => (
            <View key={level} style={styles.elevationItem}>
              <View style={[styles.elevationSwatch, { backgroundColor: theme.colors.elevation[level] }]} />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {level}
              </Text>
            </View>
          ))}
        </View>
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Spacing">
        <View style={styles.row}>
          {SPACING_SCALE.map((step) => (
            <View key={step.label} style={styles.spacingItem}>
              <View style={[styles.spacingBar, { width: step.value, backgroundColor: theme.colors.primary }]} />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Icons">
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          A sample of the Phosphor icons used in this app. The full registered set is in
          Storybook under Foundations/Icons.
        </Text>
        <View style={styles.iconGrid}>
          {ICON_SAMPLE.map((name) => (
            <View key={name} style={styles.iconItem}>
              <Icon source={name} size={24} color={theme.colors.onSurface} />
            </View>
          ))}
        </View>
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Typography (Inter Display)">
        <View style={styles.typeStack}>
          {TYPESCALE_VARIANTS.map((variant) => (
            <Text key={variant} variant={variant}>
              {variant}
            </Text>
          ))}
        </View>
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Buttons">
        <View style={styles.row}>
          <Button mode="elevated">Elevated</Button>
          <Button mode="contained">Contained</Button>
          <Button mode="contained-tonal">Tonal</Button>
        </View>
        <View style={styles.row}>
          <Button mode="outlined">Outlined</Button>
          <Button mode="text">Text</Button>
        </View>
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Selection controls">
        <View style={styles.row}>
          <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked((v) => !v)} />
          <Switch value={switchOn} onValueChange={setSwitchOn} />
          <RadioButton.Group onValueChange={setRadioValue} value={radioValue}>
            <View style={styles.row}>
              <RadioButton value="a" />
              <RadioButton value="b" />
            </View>
          </RadioButton.Group>
        </View>
        <SegmentedButtons
          value={segment}
          onValueChange={setSegment}
          buttons={[
            { value: 'day', label: 'Today' },
            { value: 'month', label: 'This month' },
          ]}
        />
        <View style={styles.row}>
          <Chip icon="check">Settled</Chip>
          <Chip mode="outlined">Pending</Chip>
        </View>
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Inputs">
        <TextInput mode="outlined" label="Email" value={text} onChangeText={setText} />
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Feedback">
        <View style={styles.row}>
          <ActivityIndicator animating />
          <Badge>3</Badge>
        </View>
        <ProgressBar progress={0.6} />
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Avatars">
        <View style={styles.row}>
          <Avatar.Text size={40} label="HG" />
          <Avatar.Icon size={40} icon="storefront" />
          <Avatar.Text size={40} label="M" style={{ backgroundColor: theme.colors.secondaryContainer }} />
        </View>
      </ThemePreviewSection>

      <Divider />

      <ThemePreviewSection title="Our components">
        <ShellTopBar>
          <AppHeader
            organisationName={ORGANISATIONS[0].name}
            shopName={ORGANISATIONS[0].shops[0].name}
            organisationLogo={ORGANISATIONS[0].logo}
          />
        </ShellTopBar>
        <SearchBar />
        <AttentionBanner
          title="Stay competitive — 65% of merchants in your area accept Amex"
          description="Enable American Express cards to avoid losing premium customers."
          ctaLabel="Explore Checkout"
        />
        <StatCard
          label="Transactions"
          amount="₹2,34,86,400.54"
          trend={{ label: '+5.2%', direction: 'up', tone: 'success' }}
          linkLabel="View payment details"
        />
      </ThemePreviewSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 24,
  },
  pageTitle: {
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subLabel: {
    marginTop: 4,
  },
  elevationItem: {
    alignItems: 'center',
    gap: 4,
  },
  elevationSwatch: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  spacingItem: {
    alignItems: 'center',
    gap: 4,
  },
  spacingBar: {
    height: 16,
    borderRadius: 2,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconItem: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 96,
    height: 64,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'flex-end',
  },
  typeStack: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
});
