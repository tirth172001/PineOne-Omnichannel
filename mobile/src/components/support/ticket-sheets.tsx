import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

import { OutlinedActionButton } from '@/components/shared/controls';
import { FormField, FormTextInput } from '@/components/shared/form-fields';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { StatusPill } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import {
  buildTicketTrail,
  draftFromTicket,
  expectedResolution,
  getSupportTopic,
  type SupportTicket,
  type TicketEditDraft,
  ticketStatusTone,
} from '@/data/support';

function DetailRow({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.detailRow, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.outlineVariant }]}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={[styles.medium, styles.detailValue]}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Ticket detail panel (web: TicketDetailPanel): reference and status, the
 * issue, ticket facts, expected resolution, and the trail of changes, with
 * Edit opening the edit panel.
 */
export function TicketDetailSheet({
  visible,
  onDismiss,
  ticket,
  onEdit,
}: {
  visible: boolean;
  onDismiss: () => void;
  ticket: SupportTicket | null;
  onEdit: (ticket: SupportTicket) => void;
}) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };
  if (!ticket) return null;
  const topic = getSupportTopic(ticket.topicSlug);
  const trail = buildTicketTrail(ticket);
  const rows: [string, string | undefined][] = [
    ['Topic', topic?.label ?? ticket.category],
    ['Product', ticket.product],
    ['Priority', ticket.priority],
    ['Last updated', ticket.updatedAt],
    ['Device ID', ticket.deviceId],
    ['Diagnostic run ID', ticket.diagnosticRunId],
    ['Created', ticket.createdAt],
  ];

  return (
    <PanelSheet visible={visible} onDismiss={onDismiss} title={ticket.id}>
      <PanelSection>
        <View style={styles.headerRow}>
          <StatusPill label={ticket.status} tone={ticketStatusTone(ticket.status)} radius={PANEL_INNER_RADIUS} />
        </View>
        <Text variant="bodyMedium" style={muted}>
          {ticket.issue}
        </Text>
        <View>
          {rows
            .filter((row): row is [string, string] => Boolean(row[1]))
            .map(([label, value], index) => (
              <DetailRow key={label} label={label} value={value} first={index === 0} />
            ))}
        </View>
      </PanelSection>
      <PanelSection last>
        <View style={styles.trailHeader}>
          <Text variant="titleSmall" style={styles.semiBold}>
            Trail of changes
          </Text>
          <OutlinedActionButton label="Edit" icon="pencil-simple" onPress={() => onEdit(ticket)} />
        </View>
        <View style={[styles.expected, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelSmall" style={[styles.overline, muted]}>
            EXPECTED RESOLUTION
          </Text>
          <Text variant="bodyMedium">{expectedResolution(ticket)}</Text>
        </View>
        <View style={styles.trail}>
          <View style={[styles.trailLine, { backgroundColor: theme.colors.outlineVariant }]} />
          {trail.map((step) => (
            <View key={step.title} style={styles.trailStep}>
              <View style={[styles.trailIcon, { backgroundColor: theme.colors.surface }]}>
                <Icon source={step.complete ? 'check-circle-fill' : 'circle'} size={16} color={step.complete ? '#059669' : '#f59e0b'} />
              </View>
              <View style={styles.flex}>
                <Text variant="bodySmall" style={muted}>
                  {step.timestamp}
                </Text>
                <Text variant="bodyMedium" style={styles.medium}>
                  {step.title}
                </Text>
                <Text variant="bodyMedium" style={muted}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </PanelSection>
    </PanelSheet>
  );
}

/**
 * "Edit ticket details" panel (web: TicketEditPanel): ticket details
 * (category, product, topic, POS ID, issue, health check report) and store
 * details, with Cancel and Save changes. Seeds from a ticket, or from a chat
 * draft that has no ticket record yet.
 */
export function TicketEditSheet({
  visible,
  onDismiss,
  ticket,
  initialDraft,
  onSave,
}: {
  visible: boolean;
  onDismiss: () => void;
  ticket: SupportTicket | null;
  initialDraft?: TicketEditDraft;
  onSave: (draft: TicketEditDraft) => void;
}) {
  const [draft, setDraft] = useState<TicketEditDraft>(() => initialDraft ?? draftFromTicket(ticket));
  // Re-seed each time the panel opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(initialDraft ?? draftFromTicket(ticket));
  }
  const theme = useTheme();
  const field = (label: string, key: keyof TicketEditDraft, options: { multiline?: boolean; half?: boolean } = {}) => (
    <View key={key} style={options.half ? styles.half : undefined}>
      <FormField label={label}>
        <FormTextInput
          value={draft[key]}
          onChangeText={(value) => setDraft((current) => ({ ...current, [key]: value }))}
          accessibilityLabel={label}
          multiline={options.multiline}
        />
      </FormField>
    </View>
  );

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Edit ticket details"
      footer={
        <View style={styles.footer}>
          <Button mode="outlined" onPress={onDismiss} textColor={theme.colors.onSurface} style={[styles.button, { borderColor: theme.colors.outlineVariant }]}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              onSave(draft);
              onDismiss();
            }}
            style={styles.button}>
            Save changes
          </Button>
        </View>
      }>
      <PanelSection>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {draft.issueDescription || ticket?.issue || "Update this ticket's details."}
        </Text>
        <Text variant="titleSmall" style={styles.semiBold}>
          Ticket details
        </Text>
        <View style={styles.grid}>
          {field('Category', 'category', { half: true })}
          {field('Product', 'product', { half: true })}
          {field('Topic', 'topic', { half: true })}
          {field('POS ID', 'posId', { half: true })}
        </View>
        {field('Issue description', 'issueDescription', { multiline: true })}
        {field('Health check report', 'healthCheckReport')}
      </PanelSection>
      <PanelSection last>
        <Text variant="titleSmall" style={styles.semiBold}>
          Store details
        </Text>
        <View style={styles.grid}>
          {field('Name', 'storeName', { half: true })}
          {field('Contact', 'storeContact', { half: true })}
        </View>
        {field('Address', 'storeAddress', { multiline: true })}
      </PanelSection>
    </PanelSheet>
  );
}

const TRAIL_ICON = 16;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  headerRow: { flexDirection: 'row' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 8 },
  detailValue: { flexShrink: 1, textAlign: 'right' },
  trailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  expected: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: PANEL_INNER_RADIUS, gap: 2 },
  overline: { letterSpacing: 0.5 },
  trail: { gap: 20 },
  trailLine: { position: 'absolute', left: TRAIL_ICON / 2 - 0.5, top: 8, bottom: 8, width: 1 },
  trailStep: { flexDirection: 'row', gap: 16 },
  trailIcon: { width: TRAIL_ICON, height: TRAIL_ICON, borderRadius: TRAIL_ICON / 2, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  half: { flexBasis: '45%', flexGrow: 1 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  button: { borderRadius: PANEL_INNER_RADIUS },
});
