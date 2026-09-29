import { useMemo, useState } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DetailScreen } from '@/components/shared/detail-screen';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar, selectFilter } from '@/components/shared/listing';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { StatusPill } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import { applyTicketDraft, SUPPORT_TICKETS, type SupportTicket, TICKET_STATUSES, type TicketStatus, ticketStatusTone } from '@/data/support';
import { useToast } from '@/hooks/use-toast';

import { TicketDetailSheet, TicketEditSheet } from './ticket-sheets';

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...TICKET_STATUSES.map((status) => ({ value: status, label: status }))] as const;

/**
 * Support tickets (web: SupportTicketsListingContent): "x of y tickets",
 * search, status and date filters, and the tickets as stacked records
 * (reference, issue and category, status, priority, product, created and
 * updated). Rows open the detail panel, which leads to Edit. As on web the
 * date filter doesn't narrow the list. The web's pagination is a static
 * mock; here it pages for real.
 */
export function SupportTickets() {
  const theme = useTheme();
  const toast = useToast();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | TicketStatus>('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const lazy = useLazyList();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const muted = { color: theme.colors.onSurfaceVariant };

  const query = search.trim().toLowerCase();
  const rows = tickets.filter((ticket) => {
    if (status !== 'all' && ticket.status !== status) return false;
    return !query || `${ticket.id} ${ticket.issue} ${ticket.category} ${ticket.product}`.toLowerCase().includes(query);
  });
  const loaded = rows.slice(0, lazy.count);

  return (
    <DetailScreen title="Support tickets" fallbackHref="/support">
      <Text variant="bodyMedium" style={[muted, styles.subtitle]}>
        {rows.length} of {tickets.length} tickets
      </Text>
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder="Search support tickets"
        filters={[
          selectFilter({
            label: 'Status',
            options: STATUS_OPTIONS,
            value: status,
            onApply: (value) => {
              setStatus(value);
              lazy.reset();
            },
          }),
          { type: 'date', presets, value: dateRange, onApply: setDateRange, initialPresetId: 'today' },
        ]}
      />
      <ListCard empty="No support tickets found.">
        {loaded.map((ticket) => (
          <ListRow
            key={ticket.id}
            onPress={() => {
              setSelectedId(ticket.id);
              setDetailOpen(true);
            }}
            accessibilityLabel={`${ticket.id}, ${ticket.issue}, ${ticket.status}`}>
            <ListRowLine
              left={<Text variant="bodyMedium" style={styles.medium}>{ticket.id}</Text>}
              right={<StatusPill label={ticket.status} tone={ticketStatusTone(ticket.status)} radius={LIST_ROW_INNER_RADIUS} />}
            />
            <ListRowLine
              left={
                <>
                  <Text variant="bodyMedium">{ticket.issue}</Text>
                  <Text variant="bodySmall" style={muted}>
                    {ticket.category}
                  </Text>
                </>
              }
            />
            <Text variant="bodySmall" style={muted}>
              <RNText style={styles.medium}>{ticket.priority}</RNText> · {ticket.product}
            </Text>
            <Text variant="bodySmall" style={muted}>
              Created {ticket.createdAt} · Updated {ticket.updatedAt}
            </Text>
          </ListRow>
        ))}
      </ListCard>
      <LazyListFooter lazy={lazy} total={rows.length} noun="tickets" />

      <TicketDetailSheet
        visible={detailOpen}
        onDismiss={() => setDetailOpen(false)}
        ticket={selected}
        onEdit={() => {
          setDetailOpen(false);
          setEditOpen(true);
        }}
      />
      <TicketEditSheet
        visible={editOpen}
        onDismiss={() => setEditOpen(false)}
        ticket={selected}
        onSave={(draft) => {
          setTickets((current) => current.map((ticket) => (ticket.id === selectedId ? applyTicketDraft(ticket, draft) : ticket)));
          toast('Ticket details updated');
        }}
      />
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  medium: { fontFamily: Fonts.medium },
  subtitle: { marginTop: -12 },
});
