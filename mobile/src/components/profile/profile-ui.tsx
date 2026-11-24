import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DETAIL_FOOTER_BUTTON_RADIUS } from '@/components/shared/detail-screen';
import { PAGE_PADDING } from '@/components/tab-screen';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

/**
 * Parts shared by the pages opened from the profile (personal details,
 * security, notifications, language, Suggest & Report, referrals, rewards),
 * copied from the app-layout pages so they match: the preferences card
 * (Settlement preferences), the open timeline (Business profile requests)
 * and the 48dp footer buttons.
 */

/** Settlement preferences' card: the icon and its state on one row, then a 16 semibold title and a muted line. */
export function FeatureCard({
  icon,
  title,
  line,
  trailing,
  onPress,
  children,
  accessibilityLabel,
}: {
  icon: string;
  title: string;
  line?: string;
  /** At the icon row's end: a switch, a tag, or a caret. */
  trailing?: ReactNode;
  onPress?: () => void;
  children?: ReactNode;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const body = (
    <View style={styles.cardInner}>
      <View style={styles.cardTop}>
        <Icon source={icon} size={24} color={theme.colors.primary} />
        {trailing ?? (onPress ? <Icon source="caret-right" size={20} color={theme.colors.onSurface} /> : null)}
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        {line ? <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>{line}</Text> : null}
      </View>
      {children}
    </View>
  );
  return onPress ? (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [title, line].filter(Boolean).join(', ')}
      style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {body}
    </TouchableRipple>
  ) : (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>{body}</View>
  );
}

/** The profile's list row as a card (icon, title, a muted line, caret), for links inside a page. */
export function LinkCard({ icon, title, line, trailing, onPress }: { icon: string; title: string; line?: string; trailing?: ReactNode; onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="button"
      accessibilityLabel={[title, line].filter(Boolean).join(', ')}
      style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.link, line ? styles.linkTall : null]}>
        <Icon source={icon} size={24} color={theme.colors.primary} />
        <View style={styles.flex}>
          <Text numberOfLines={1} style={[styles.medium, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          {line ? <Text style={[styles.small, { color: theme.colors.onSurfaceVariant }]}>{line}</Text> : null}
        </View>
        {trailing}
        <Icon source="caret-right" size={20} color={theme.colors.onSurface} />
      </View>
    </TouchableRipple>
  );
}

/** A 48dp footer button for DetailScreen's pinned bar; lay two side by side, primary last. */
export function FooterButton({ label, onPress, mode = 'contained', disabled = false, icon }: { label: string; onPress: () => void; mode?: 'contained' | 'outlined'; disabled?: boolean; icon?: string }) {
  const theme = useTheme();
  return (
    <Button
      mode={mode}
      icon={icon}
      onPress={onPress}
      disabled={disabled}
      textColor={mode === 'outlined' ? theme.colors.onSurface : undefined}
      style={[styles.footerButton, mode === 'outlined' && { borderColor: theme.colors.outlineVariant }]}
      contentStyle={styles.footerContent}
      labelStyle={styles.footerLabel}>
      {label}
    </Button>
  );
}

export type TimelineStep = { title: string; line?: string; at?: string; state: 'done' | 'current' | 'todo' | 'failed' };

/** Business profile's request history: a check per step on a thin rail, a dashed circle for what's still to come. */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };
  const mark = { done: { icon: 'check-circle-fill', color: '#16a34a' }, current: { icon: 'circle', color: '#3b82f6' }, todo: { icon: 'circle-dashed', color: theme.colors.onSurfaceVariant }, failed: { icon: 'x-circle-fill', color: '#dc2626' } };
  return (
    <View>
      {steps.map((step, index) => (
        <View key={`${step.title}-${index}`} style={styles.step}>
          <View style={styles.stepRail}>
            <Icon source={mark[step.state].icon} size={16} color={mark[step.state].color} />
            {index < steps.length - 1 ? <View style={[styles.stepLine, { backgroundColor: theme.colors.outlineVariant }]} /> : null}
          </View>
          <View style={styles.stepText}>
            <Text style={[styles.medium, step.state === 'todo' ? muted : { color: theme.colors.onSurface }]}>{step.title}</Text>
            {step.line ? <Text style={[styles.small, muted]}>{step.line}</Text> : null}
            {step.at ? <Text style={[styles.small, muted]}>{step.at}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/** A muted note with an icon (Business profile's IFSC warning). */
export function Note({ icon = 'info', children }: { icon?: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.note, { backgroundColor: theme.colors.background }]}>
      <Icon source={icon} size={16} color={theme.colors.onSurfaceVariant} />
      <Text style={[styles.noteText, { color: theme.colors.onSurfaceVariant }]}>{children}</Text>
    </View>
  );
}

export const profileStyles = StyleSheet.create({
  /** The first block sits 8dp further under the bar (DetailScreen adds none). */
  first: { marginTop: PAGE_PADDING },
  stack: { gap: 8 },
  flex: { flex: 1, minWidth: 0 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  medium: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  title: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  card: { borderRadius: Shape.max, padding: 12, gap: 12 },
  centre: { alignItems: 'center', gap: 8 },
  centreText: { textAlign: 'center' },
  sheetTitle: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  // A card's 16dp body padding undone, so row rules reach both edges.
  edge: { marginHorizontal: -16, marginVertical: -16 },
  edgeRow: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { borderTopWidth: 1 },
});

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { borderRadius: Shape.max },
  cardInner: { padding: 12, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 24 },
  cardText: { gap: 4 },
  cardTitle: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  medium: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 12 },
  linkTall: { minHeight: 62 },
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
  footerContent: { height: 48 },
  footerLabel: { fontFamily: Fonts.medium, fontSize: 16 },
  step: { flexDirection: 'row', gap: 12 },
  stepRail: { alignItems: 'center', width: 16, paddingTop: 2 },
  stepLine: { width: 1, flex: 1, marginTop: 4, minHeight: 16 },
  stepText: { flex: 1, gap: 2, paddingBottom: 16 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 8, borderRadius: 10 },
  noteText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
});
