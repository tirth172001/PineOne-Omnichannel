import { StyleSheet, View } from 'react-native';
import { Appbar, Icon, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { OutlineTag } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';

type AppHeaderProps = {
  /** The user's name on Overview, the page name on the other tabs. */
  title: string;
  /** The current store / channel scope, under the title. */
  scope: string;
  /** Shown next to the title, e.g. the user's role ("Admin"). */
  badge?: string;
  /** Opens the store / channel switcher. */
  onPressSwitcher?: () => void;
  onPressNotifications?: () => void;
};

/**
 * App shell header (Figma node 47:2350): the title (with an optional badge)
 * and the store / channel scope under it, opening the switcher, on the left;
 * notifications on the right. The Figma's org logo tile and account avatar are
 * left out (user decisions); account lives in the More tab. Built on Paper's
 * Appbar.Header (which handles the status-bar inset and 64dp height).
 * Transparent: it sits inside the shell's rounded top bar, which paints the surface.
 */
export function AppHeader({ title, scope, badge, onPressSwitcher, onPressNotifications }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header mode="small" elevated={false} style={[styles.appbar, { backgroundColor: 'transparent' }]}>
      <View style={styles.row}>
        <TouchableRipple
          onPress={onPressSwitcher}
          borderless
          accessibilityRole="button"
          accessibilityLabel={`${title}${badge ? `, ${badge}` : ''}, ${scope}. Switch store or channel`}
          style={styles.switcher}>
          <View style={styles.switcherContent}>
            <View style={styles.titleRow}>
              <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
                {title}
              </Text>
              {badge ? <OutlineTag label={badge} /> : null}
            </View>
            <View style={styles.scopeRow}>
              <Text variant="bodySmall" numberOfLines={1} style={[styles.scope, { color: theme.colors.onSurfaceVariant }]}>
                {scope}
              </Text>
              <Icon source="caret-down" size={14} color={theme.colors.onSurfaceVariant} />
            </View>
          </View>
        </TouchableRipple>

        <IconButton
          icon="bell"
          size={24}
          iconColor={theme.colors.onSurface}
          onPress={onPressNotifications}
          accessibilityLabel="Notifications"
          style={styles.iconButton}
        />
      </View>
    </Appbar.Header>
  );
}

// Nested shapes: the shell's top bar (Shape.max) → 40dp touch targets inset 12dp (the row padding).
const ROW_PADDING = 12;
const TARGET_RADIUS = concentric(Shape.max, ROW_PADDING, 40);

const styles = StyleSheet.create({
  appbar: { paddingHorizontal: 0 },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: ROW_PADDING,
  },
  switcher: { borderRadius: TARGET_RADIUS, flexShrink: 1 },
  switcherContent: { paddingHorizontal: 4, paddingVertical: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flexShrink: 1 },
  scopeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  scope: { flexShrink: 1 },
  iconButton: { margin: 0, borderRadius: TARGET_RADIUS },
});
