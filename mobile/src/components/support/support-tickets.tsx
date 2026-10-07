import { useMemo, useState } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { ListingCard } from '@/components/listing-hero/listing-card';
import { useListDates } from '@/components/listing-hero/time-scope';
import { DayGroupedList, dayTotals, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DetailScreen } from '@/components/shared/detail-screen';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar, selectFilter } from '@/components/shared/listing';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { StatusPill } from '@/components/shared/status';
import { LISTING_HERO_LAYOUT } from '@/constants/experiments';
import { Fonts } from '@/constants/theme';
import { applyTicketDraft, SUPPORT_TICKETS, type SupportTicket, TICKET_STATUSES, type TicketStatus, ticketStatusTone } from '@/data/support';
import { parseDisplayDate } from '@/data/transactions';
import { useToast } from '@/hooks/use-toast';

import { TicketDetailSheet, TicketEditSheet } from './ticket-sheets';

/** Tickets carry "6 May 26, 12:42 pm": the day as the lists show it ("6 May 2026"), and when. */
const raisedDay = (ticket: SupportTicket) => ticket.createdAt.split(',')[0].replace(/ (\d{2})$/, ' 20$1');
const raisedOn = (ticket: SupportTicket) => parseDisplayDate(raisedDay(ticket), ticket.createdAt.split(',')[1] ?? '12:00 PM');

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
  const raised = useListDates(tickets, raisedOn, { subject: 'tickets raised', presets: ['7d', '30d', '90d'], initial: '30d', onChange: lazy.reset });
  const applyStatus = (value: 'all' | TicketStatus) => {
    setStatus(value);
    lazy.reset();
  };
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

  const renderTicket = (ticket: SupportTicket) => (
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
  );

  if (LISTING_HERO_LAYOUT) {
    // The listing format (constants/experiments.ts): one card for search, filters and dates; tickets by the day they were raised.
    const shown = raised.inRange.filter((ticket) => {
      if (status !== 'all' && ticket.status !== status) return false;
      return !query || `${ticket.id} ${ticket.issue} ${ticket.category} ${ticket.product}`.toLowerCase().includes(query);
    });
    const shownLoaded = sortNewestFirst(shown, (ticket) => raisedOn(ticket)?.getTime() ?? -Infinity).slice(0, lazy.count);
    const open = raised.inRange.filter((ticket) => ticket.status === 'Open').length;
    const noun = { one: 'ticket', other: 'tickets' };
    return (
      <DetailScreen title="Support tickets" fallbackHref="/support">
        <ListingCard
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            lazy.reset();
          }}
          searchPlaceholder="Search support tickets"
          time={raised.scope}
          suggestions={
            open > 0 && status !== 'Open'
              ? [{ key: 'open', label: `${open} open`, icon: 'warning-circle', color: theme.colors.error, onPress: () => applyStatus('Open') }]
              : []
          }
          filters={[selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: status, onApply: applyStatus })]}
          totals={{ all: raised.inRange.length, shown: shown.length }}
          noun={noun}>
          <DayGroupedList
            flat
            groups={groupByDay(shownLoaded, (ticket) => raisedDay(ticket))}
            totals={dayTotals(shown, (ticket) => raisedDay(ticket))}
            noun={noun}
            empty={raised.inRange.length ? 'No tickets match. Try clearing the search or filters.' : 'No tickets raised in these dates.'}
            renderRow={renderTicket}
          />
          <LazyListFooter lazy={lazy} total={shown.length} noun="tickets" />
        </ListingCard>

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
        {loaded.map(renderTicket)}
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
