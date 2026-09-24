import { useMemo, useState } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { FilterMenuButton } from '@/components/shared/controls';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DetailScreen } from '@/components/shared/detail-screen';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar } from '@/components/shared/listing';
import { PaginationBar } from '@/components/shared/pagination-bar';
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
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
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paged = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <DetailScreen title="Support tickets" fallbackHref="/support">
      <Text variant="bodyMedium" style={[muted, styles.subtitle]}>
        {rows.length} of {tickets.length} tickets
      </Text>
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search support tickets"
        filters={
          <>
            <FilterMenuButton
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
              accessibilityLabel="Status"
            />
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="today" />
          </>
        }
      />
      <ListCard empty="No support tickets found.">
        {paged.map((ticket) => (
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
      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalRows={rows.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(1);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />

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
