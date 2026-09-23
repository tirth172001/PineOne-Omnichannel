import { useState } from 'react';
import { type LayoutChangeEvent, ScrollView, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Badge, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

export type TabItem = {
  key: string;
  label: string;
  icon?: string;
  badge?: number;
};

type TabsProps = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** `primary`: top-level content views (indicator hugs the label). `secondary`: sub-views within one (full-width 2dp indicator). */
  variant?: 'primary' | 'secondary';
  /** Scrollable tabs for when labels don't fit at equal widths. */
  scrollable?: boolean;
  /** Defaults to `primary`; the app shell passes onSurface to match the Figma black underline. */
  indicatorColor?: string;
  /** Corner radius of each tab's press area; pass concentric() of the enclosing container. */
  tabRadius?: number;
  style?: StyleProp<ViewStyle>;
};

const PRIMARY_INDICATOR = 3;
const SECONDARY_INDICATOR = 2;

/**
 * M3 tabs — not in react-native-paper (Paper's BottomNavigation is a different
 * component). Primary tabs have a 3dp indicator sized to the content; secondary
 * tabs have a 2dp indicator spanning the whole tab. Secondary tabs follow the
 * Figma app shell (node 47:2371) rather than stock M3 sizing: 40dp tall, 16/24
 * Medium labels. Each tab's press area is rounded; the indicator sits outside
 * it (so the rounded corners don't clip its ends) and has fully rounded ends.
 */
export function Tabs({
  tabs,
  activeKey,
  onChange,
  variant = 'primary',
  scrollable = false,
  indicatorColor,
  tabRadius = Shape.small,
  style,
}: TabsProps) {
  const theme = useTheme();
  const [contentWidths, setContentWidths] = useState<Record<string, number>>({});
  const primary = variant === 'primary';

  const row = tabs.map((tab) => {
    const active = tab.key === activeKey;
    const color = active ? (primary ? theme.colors.primary : theme.colors.onSurface) : theme.colors.onSurfaceVariant;
    const onContentLayout = (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      setContentWidths((prev) => (prev[tab.key] === width ? prev : { ...prev, [tab.key]: width }));
    };

    return (
      <View key={tab.key} style={[styles.slot, !scrollable && styles.fixedSlot]}>
        <TouchableRipple
          onPress={() => onChange(tab.key)}
          accessibilityRole="tab"
          aria-selected={active}
          borderless
          style={[styles.tab, { borderRadius: tabRadius, minHeight: primary ? (tab.icon ? 64 : 48) : 40 }]}>
          <View
            onLayout={onContentLayout}
            style={[styles.tabContent, !primary && styles.secondaryContent, primary && tab.icon ? styles.stacked : styles.inline]}>
            {tab.icon ? <Icon source={tab.icon} size={24} color={color} /> : null}
            <Text variant={primary ? 'titleSmall' : 'titleMedium'} style={{ color }}>
              {tab.label}
            </Text>
            {tab.badge ? <Badge size={16}>{tab.badge}</Badge> : null}
          </View>
        </TouchableRipple>
        {active ? (
          <View
            pointerEvents="none"
            style={[
              primary ? styles.primaryIndicator : styles.secondaryIndicator,
              { backgroundColor: indicatorColor ?? theme.colors.primary },
              primary && { width: Math.max(contentWidths[tab.key] ?? 0, 24) },
            ]}
          />
        ) : null}
      </View>
    );
  });

  return (
    <View
      style={[styles.bar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.surfaceVariant }, style]}
      accessibilityRole="tablist">
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {row}
        </ScrollView>
      ) : (
        <View style={styles.fixedRow}>{row}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: 1 },
  fixedRow: { flexDirection: 'row' },
  slot: { alignItems: 'center' },
  fixedSlot: { flex: 1 },
  tab: { paddingHorizontal: 16, alignSelf: 'stretch', justifyContent: 'center' },
  tabContent: { alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
  secondaryContent: { paddingVertical: 8 },
  inline: { flexDirection: 'row', gap: 8 },
  stacked: { flexDirection: 'column', gap: 2, paddingVertical: 8 },
  primaryIndicator: { position: 'absolute', bottom: 0, height: PRIMARY_INDICATOR, borderRadius: PRIMARY_INDICATOR / 2 },
  secondaryIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SECONDARY_INDICATOR,
    borderRadius: SECONDARY_INDICATOR / 2,
  },
});
