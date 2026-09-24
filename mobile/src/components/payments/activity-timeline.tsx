import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { CopyableValue } from '@/components/shared/copyable-value';
import { DetailRow } from '@/components/shared/detail-rows';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { StatusPill } from '@/components/shared/status';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { ACTIVITY_PANEL, type ActivityEvent, type ActivityTone } from '@/data/transaction-detail';

const TONE_ICON: Record<ActivityTone, { icon: string; color: string }> = {
  success: { icon: 'check-circle', color: '#10b981' },
  failed: { icon: 'x-circle', color: '#ef4444' },
  processing: { icon: 'arrow-counter-clockwise', color: '#f59e0b' },
  initiated: { icon: 'circle', color: '#8b5cf6' },
};

/** An activity event, optionally with its own icon (e.g. the dispute's amber lightning). */
export type TimelineEvent = ActivityEvent & { icon?: { icon: string; color: string } };

/**
 * The detail pages' Activity section (web: the Activity column of the
 * transaction and dispute detail pages): a vertical timeline whose events
 * open the activity side panel. Shared by Transaction and Dispute details.
 */
export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  const theme = useTheme();
  const [activityEvent, setActivityEvent] = useState<ActivityEvent | null>(null);
  return (
    <>
    <View style={styles.block}>
      <Text style={styles.sectionTitle}>Activity</Text>
      <View style={styles.timeline}>
        <View style={[styles.timelineLine, { backgroundColor: theme.colors.outlineVariant }]} />
        {events.map((event) => (
          <View key={event.id} style={styles.event}>
            <View style={[styles.eventIcon, { backgroundColor: theme.colors.background }]}>
              <Icon source={(event.icon ?? TONE_ICON[event.tone]).icon} size={16} color={(event.icon ?? TONE_ICON[event.tone]).color} />
            </View>
            <View style={styles.eventBody}>
              <View style={styles.eventTitleRow}>
                <Text variant="bodyMedium" style={styles.regular}>
                  {event.title}
                </Text>
                {event.badge ? (
                  <View style={[styles.badge, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.badgeText}>{event.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text variant="bodyMedium" style={[styles.regular, { color: theme.colors.onSurfaceVariant }]}>
                {event.timestamp}
              </Text>
              <TouchableRipple onPress={() => setActivityEvent(event)} accessibilityRole="button" borderless style={styles.eventLink}>
                <View style={styles.inlineLink}>
                  <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                    View details
                  </Text>
                  <Icon source="caret-right" size={14} color={theme.colors.primary} />
                </View>
              </TouchableRipple>
            </View>
          </View>
        ))}
      </View>
    </View>
      <ActivityPanel event={activityEvent} onDismiss={() => setActivityEvent(null)} />
    </>
  );
}

/** Web: ActivityTimelineSidepanel (fixed demo content for every event, as on web). */
export function ActivityPanel({ event, onDismiss }: { event: ActivityEvent | null; onDismiss: () => void }) {
  const theme = useTheme();
  return (
    <PanelSheet visible={event !== null} onDismiss={onDismiss} title="Transaction details">
      <PanelSection>
        <View style={[styles.panelTile, { backgroundColor: theme.colors.primary }]}>
          <Icon source="credit-card" size={24} color={theme.colors.onPrimary} />
        </View>
        <View style={styles.amountRow}>
          <DimmedDecimalAmount value={ACTIVITY_PANEL.amount} size="large" />
          <StatusPill label={ACTIVITY_PANEL.statusLabel} tone="failed" radius={PANEL_INNER_RADIUS} />
        </View>
        <Text variant="bodyMedium" style={[styles.regular, { color: theme.colors.onSurfaceVariant }]}>
          {ACTIVITY_PANEL.meta.join('  |  ')}
        </Text>
        <View style={styles.panelRows}>
          {ACTIVITY_PANEL.fields.map((field, index) => (
            <DetailRow key={`${field.label}-${index}`} label={field.label}>
              {'copyable' in field && field.copyable ? <CopyableValue value={field.value} /> : <Text variant="bodyMedium">{field.value}</Text>}
            </DetailRow>
          ))}
        </View>
      </PanelSection>
      <PanelSection>
        <Text variant="titleMedium" style={styles.semiBold}>
          Error details
        </Text>
        {ACTIVITY_PANEL.errorFields.map((field) => (
          <DetailRow key={field.label} label={field.label} value={field.value} />
        ))}
      </PanelSection>
      <PanelSection last>
        <Text variant="titleMedium" style={styles.semiBold}>
          Custom fields
        </Text>
        {ACTIVITY_PANEL.customFields.map((field) => (
          <DetailRow key={field.label} label={field.label} value={field.value} />
        ))}
      </PanelSection>
    </PanelSheet>
  );
}

const TIMELINE_ICON = 16;

const styles = StyleSheet.create({
  block: { gap: 12 },
  // Web: text-xl font-medium.
  sectionTitle: { fontFamily: Fonts.medium, fontSize: 20, lineHeight: 24 },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeline: { gap: 20 },
  timelineLine: { position: 'absolute', left: TIMELINE_ICON / 2 - 0.5, top: 8, bottom: 8, width: 1 },
  event: { flexDirection: 'row', gap: 16 },
  eventIcon: { paddingTop: 2 },
  eventBody: { flex: 1, gap: 2 },
  eventTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  badge: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Shape.small, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, lineHeight: 14, fontFamily: Fonts.regular },
  eventLink: { alignSelf: 'flex-start', borderRadius: Shape.extraSmall, marginTop: 2 },
  regular: { fontFamily: Fonts.regular },
  semiBold: { fontFamily: Fonts.semiBold },
  panelTile: { width: 36, height: 36, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  panelRows: { gap: 12, marginTop: 8 },
});
