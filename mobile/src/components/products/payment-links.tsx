import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

import { AnswerHero, HERO_OVERLAP } from '@/components/listing-hero/answer-hero';
import { ListingCard } from '@/components/listing-hero/listing-card';
import { type RangeScope, type RangeValue, rangePhrase, resolveRange } from '@/components/listing-hero/time-scope';
import { getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DateTimeField, type DateTimeValue, FormField, FormTextInput } from '@/components/shared/form-fields';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, ListCard, ListingToolbar, ListRow, ListRowLine, selectFilter } from '@/components/shared/listing';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet, SHEET_BUTTON, SheetRow, SheetSection } from '@/components/shared/panel-sheet';
import { StatusPill } from '@/components/shared/status';
import { TabScreen } from '@/components/tab-screen';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import {
  formatCreatedNow,
  generatePaymentLinkId,
  matchesSearchField,
  PAYMENT_LINK_DESCRIPTION_MAX,
  PAYMENT_LINK_ROWS,
  PAYMENT_LINK_SEARCH_FIELDS,
  PAYMENT_LINK_STATUSES,
  type PaymentLinkRow,
  type PaymentLinkSearchField,
  type PaymentLinkStatus,
  paymentLinkTone,
} from '@/data/payment-links';
import { LISTING_HERO_LAYOUT } from '@/constants/experiments';
import { parseInr } from '@/data/common';
import { parseDisplayDate } from '@/data/transactions';
import { useToast } from '@/hooks/use-toast';

export type CreatePaymentLinkValues = {
  amount: string;
  description: string;
  customerEmail: string;
  invoiceNumber: string;
  customerMobile: string;
  expiry: DateTimeValue;
};

function emptyValues(): CreatePaymentLinkValues {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return { amount: '', description: '', customerEmail: '', invoiceNumber: '', customerMobile: '', expiry: { date, time: '10:30 AM' } };
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * "Create new payment link" panel (web: CreatePaymentLinkSheet): amount,
 * description (110 characters), customer email, invoice number, customer
 * mobile, and link expiry. Needs an amount and an email or mobile.
 */
export function CreatePaymentLinkSheet({
  visible,
  onDismiss,
  onCreate,
  initialValues,
}: {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (values: CreatePaymentLinkValues) => void;
  /** Pre-fills the form, e.g. when duplicating a link. */
  initialValues?: Partial<CreatePaymentLinkValues>;
}) {
  const theme = useTheme();
  const [values, setValues] = useState<CreatePaymentLinkValues>(emptyValues);
  // Re-seed each time the panel opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setValues({ ...emptyValues(), ...initialValues });
  }
  const set = <K extends keyof CreatePaymentLinkValues>(key: K, value: CreatePaymentLinkValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const hasContact = values.customerEmail.trim().length > 0 || values.customerMobile.trim().length > 0;
  const canCreate = values.amount.trim().length > 0 && hasContact && Boolean(values.expiry.date);
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Create new payment link"
      footer={
        <Button
          mode="contained"
          disabled={!canCreate}
          onPress={() => {
            onCreate(values);
            onDismiss();
          }}
          style={styles.panelButton}>
          Create payment link
        </Button>
      }>
      <PanelSection last>
        <FormField label="Amount to be collected">
          <FormTextInput
            value={values.amount}
            onChangeText={(value) => set('amount', value.replace(/[^\d.]/g, ''))}
            placeholder="0"
            prefix="₹"
            keyboardType="decimal-pad"
            accessibilityLabel="Amount to be collected"
          />
        </FormField>
        <FormField label="Description">
          <FormTextInput
            value={values.description}
            onChangeText={(value) => set('description', value.slice(0, PAYMENT_LINK_DESCRIPTION_MAX))}
            placeholder="Payment for Invoice Number 20758TYUS"
            multiline
            accessibilityLabel="Description"
          />
          <Text variant="bodySmall" style={muted}>
            {PAYMENT_LINK_DESCRIPTION_MAX - values.description.length} characters left
          </Text>
        </FormField>
        <FormField label="Customer email id">
          <FormTextInput
            value={values.customerEmail}
            onChangeText={(value) => set('customerEmail', value)}
            placeholder="test@pinelabs.com"
            keyboardType="email-address"
            accessibilityLabel="Customer email id"
          />
        </FormField>
        <FormField label="Invoice number">
          <FormTextInput
            value={values.invoiceNumber}
            onChangeText={(value) => set('invoiceNumber', value)}
            placeholder="Invoice number for payment"
            accessibilityLabel="Invoice number"
          />
        </FormField>
        <FormField label="Customer mobile">
          <FormTextInput
            value={values.customerMobile}
            onChangeText={(value) => set('customerMobile', value.replace(/\D/g, '').slice(0, 10))}
            placeholder="8950948704"
            prefix="+91"
            keyboardType="number-pad"
            accessibilityLabel="Customer mobile"
          />
        </FormField>
        <Text variant="bodySmall" style={muted}>
          Add at least one customer mobile or email. Payment links and reminders will be sent here.
        </Text>
        <FormField label="Link expiry date">
          <DateTimeField value={values.expiry} onChange={(expiry) => set('expiry', expiry)} minDate={startOfToday()} />
        </FormField>
      </PanelSection>
    </PanelSheet>
  );
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Status' },
  ...PAYMENT_LINK_STATUSES.map((status) => ({ value: status, label: status })),
] as const;
const SEARCH_FIELD_OPTIONS = PAYMENT_LINK_SEARCH_FIELDS.map((field) => ({ value: field.id, label: field.label }));

/**
 * Payment links (web: PaymentLinksListingContent): search by a chosen field
 * (payment ID, amount, invoice, phone or email), date and status filters,
 * and the links as stacked records (link ID, amount, invoice, description,
 * created and expiry dates, status) with Copy / Duplicate. New payment link
 * is the header action.
 */
export function PaymentLinks({ startCreating = false }: { startCreating?: boolean }) {
  const theme = useTheme();
  const toast = useToast();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [rows, setRows] = useState<PaymentLinkRow[]>(PAYMENT_LINK_ROWS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchField, setSearchField] = useState<PaymentLinkSearchField>('paymentId');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | PaymentLinkStatus>('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const [createOpen, setCreateOpen] = useState(startCreating);
  const [createSeed, setCreateSeed] = useState<Partial<CreatePaymentLinkValues>>();
  const lazy = useLazyList();
  const [range, setRange] = useState<RangeValue>({ preset: '30d' });
  const [heroView, setHeroView] = useState<'paid' | 'open'>('paid');
  const muted = { color: theme.colors.onSurfaceVariant };
  const activeField = PAYMENT_LINK_SEARCH_FIELDS.find((field) => field.id === searchField) ?? PAYMENT_LINK_SEARCH_FIELDS[0];

  const filtered = rows.filter((row) => (status === 'all' || row.status === status) && matchesSearchField(row, searchField, search));
  const showEmptyState = rows.length === 0 && !search.trim() && status === 'all';

  const openCreate = (seed?: Partial<CreatePaymentLinkValues>) => {
    setCreateSeed(seed);
    setCreateOpen(true);
  };
  const create = (values: CreatePaymentLinkValues) => {
    const { date, time } = formatCreatedNow();
    const newRow: PaymentLinkRow = {
      id: `plink-${Date.now()}`,
      createdDate: date,
      createdTime: time,
      paymentLink: generatePaymentLinkId(),
      invoiceNumber: values.invoiceNumber || '-',
      amount: `₹ ${Number(values.amount || 0).toLocaleString('en-IN')}`,
      description: values.description || '-',
      expiryDate: values.expiry.date ? values.expiry.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      expiryTime: values.expiry.date ? values.expiry.time : '',
      customerEmail: values.customerEmail,
      customerMobile: values.customerMobile,
      status: 'Created',
    };
    setRows((current) => [newRow, ...current]);
    toast(`Payment link ${newRow.paymentLink} generated`);
  };
  const duplicate = (row: PaymentLinkRow) =>
    openCreate({
      amount: row.amount.replace(/[^\d.]/g, ''),
      description: row.description === '-' ? '' : row.description,
      customerEmail: row.customerEmail,
      invoiceNumber: row.invoiceNumber === '-' ? '' : row.invoiceNumber,
      customerMobile: row.customerMobile,
    });

  // Four things per link — how much, what for, which link and when, where it stands; the rest is in its sheet.
  const renderRow = (row: PaymentLinkRow) => (
    <ListRow
      key={row.id}
      onPress={() => setSelectedId(row.id)}
      accessibilityLabel={`${row.amount}, ${row.description}, payment link ${row.paymentLink}, ${row.status}. Open details`}>
      <ListRowLine
        left={
          <>
            <Text variant="titleMedium" style={styles.amount}>
              {row.amount}
            </Text>
            <Text variant="bodySmall" numberOfLines={1}>
              {row.description === '-' ? 'No description' : row.description}
            </Text>
            <Text variant="bodySmall" numberOfLines={1} style={muted}>
              {row.paymentLink} · {row.createdTime}
            </Text>
          </>
        }
        right={<StatusPill label={row.status} tone={paymentLinkTone(row.status)} radius={LIST_ROW_INNER_RADIUS} />}
      />
    </ListRow>
  );
  const copyLink = (row: PaymentLinkRow) => {
    void Clipboard.setStringAsync(row.paymentLink);
    toast('Payment link copied');
  };
  const cancelLink = (row: PaymentLinkRow) => {
    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, status: 'Cancelled' } : item)));
    toast(`Payment link ${row.paymentLink} cancelled`);
  };
  const selectedLink = rows.find((row) => row.id === selectedId) ?? null;
  const linkSheet = (
    <PaymentLinkSheet
      link={selectedLink}
      onDismiss={() => setSelectedId(null)}
      onCopy={copyLink}
      onDuplicate={(row) => {
        setSelectedId(null);
        setTimeout(() => duplicate(row), 250);
      }}
      onCancel={cancelLink}
    />
  );

  // The listing hero experiment (constants/experiments.ts): the answer, then the records.
  const latest = new Date(Math.max(0, ...rows.map((row) => createdAt(row)?.getTime() ?? 0)));
  const [rangeFrom, rangeTo] = resolveRange(range, latest);
  const inRange = rows.filter((row) => {
    const at = createdAt(row);
    return !!at && at >= rangeFrom && at < rangeTo;
  });
  const heroFiltered = inRange.filter((row) => (status === 'all' || row.status === status) && matchesSearchField(row, searchField, search));
  const heroLoaded = sortNewestFirst(heroFiltered, (row) => displayTimestamp(row.createdDate, row.createdTime)).slice(0, lazy.count);
  const paid = inRange.filter((row) => row.status === 'Fully paid');
  // Open links are a balance right now, whatever the dates.
  const open = rows.filter((row) => row.status === 'Created');
  const expired = inRange.filter((row) => row.status === 'Expired').length;
  const linkTotal = (list: PaymentLinkRow[]) => list.reduce((sum, row) => sum + parseInr(row.amount), 0);
  const dates: RangeScope = {
    kind: 'range',
    subject: 'payment links',
    presets: ['today', 'yesterday', '7d', '30d', '90d'],
    value: range,
    onChange: (value) => {
      setRange(value);
      lazy.reset();
    },
    allowCustom: true,
    maxDays: 90,
  };
  const linkFilters = [
    selectFilter({
      label: 'Search by',
      options: SEARCH_FIELD_OPTIONS,
      value: searchField,
      onApply: (value) => {
        setSearchField(value);
        lazy.reset();
      },
    }),
    selectFilter({
      label: 'Status',
      options: STATUS_OPTIONS,
      value: status,
      onApply: (value) => {
        setStatus(value);
        lazy.reset();
      },
    }),
  ];

  if (LISTING_HERO_LAYOUT) {
    return (
      <TabScreen tab="payment-links" actions={[{ label: 'New payment link', shortLabel: 'New link', icon: 'plus', onPress: () => openCreate() }]}>
        <View style={styles.heroContainer}>
          <AnswerHero
            activeKey={heroView}
            onActiveChange={(key) => setHeroView(key as 'paid' | 'open')}
            views={[
              {
                key: 'paid',
                label: 'Paid via links',
                amount: linkTotal(paid),
                line: paid.length ? `${paid.length} ${paid.length === 1 ? 'link' : 'links'} paid ${rangePhrase(range)}` : `No links paid ${rangePhrase(range)}`,
                time: dates,
              },
              {
                key: 'open',
                label: 'Open links',
                amount: linkTotal(open),
                line: `${open.length} ${open.length === 1 ? 'link is' : 'links are'} waiting to be paid`,
                time: { kind: 'live' },
              },
            ]}
          />
          <ListingCard
            style={styles.overHero}
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              lazy.reset();
            }}
            searchPlaceholder={`Enter ${activeField.label.toLowerCase()}`}
            time={heroView === 'open' ? dates : undefined}
            suggestions={
              expired > 0 && status !== 'Expired'
                ? [
                    {
                      key: 'expired',
                      label: `${expired} expired`,
                      icon: 'warning-circle',
                      color: theme.colors.error,
                      onPress: () => {
                        setStatus('Expired');
                        lazy.reset();
                      },
                    },
                  ]
                : []
            }
            filters={linkFilters}
            actions={[{ label: 'Download filtered', icon: 'download-simple' }]}
            totals={{ all: inRange.length, shown: heroFiltered.length, amount: linkTotal(heroFiltered) }}
            noun={{ one: 'link', other: 'links' }}>
            <DayGroupedList
              flat
              groups={groupByDay(heroLoaded, (row) => row.createdDate)}
              totals={dayTotals(heroFiltered, (row) => row.createdDate)}
              noun={{ one: 'link', other: 'links' }}
              empty={inRange.length ? 'No payment links match. Try clearing the search or filters.' : 'No payment links created in these dates.'}
              renderRow={renderRow}
            />
            <LazyListFooter lazy={lazy} total={heroFiltered.length} noun="payment links" />
          </ListingCard>
        </View>
        <CreatePaymentLinkSheet visible={createOpen} onDismiss={() => setCreateOpen(false)} onCreate={create} initialValues={createSeed} />
      {linkSheet}
      </TabScreen>
    );
  }

  return (
    <TabScreen tab="payment-links" actions={[{ label: 'New payment link', shortLabel: 'New link', icon: 'plus', onPress: () => openCreate() }]}>
      {/* Search floats above the footer; "Search by" picks the field it matches. */}
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder={`Enter ${activeField.label.toLowerCase()}`}
        filters={[
          selectFilter({
            label: 'Search by',
            options: SEARCH_FIELD_OPTIONS,
            value: searchField,
            onApply: (value) => {
              setSearchField(value);
              lazy.reset();
            },
          }),
          { type: 'date', presets, value: dateRange, onApply: setDateRange, initialPresetId: 'today' },
          selectFilter({
            label: 'Status',
            options: STATUS_OPTIONS,
            value: status,
            onApply: (value) => {
              setStatus(value);
              lazy.reset();
            },
          }),
        ]}
        actions={[{ label: 'Download filtered', icon: 'download-simple' }]}
      />

      {showEmptyState ? (
        <View style={[styles.empty, { borderColor: theme.colors.outlineVariant }]}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Icon source="link-break" size={16} color={theme.colors.onSurface} />
          </View>
          <Text variant="titleSmall" style={styles.semiBold}>
            No payment links created yet
          </Text>
          <Text variant="bodyMedium" style={[muted, styles.center]}>
            Create a payment link to view it&apos;s status and details here
          </Text>
        </View>
      ) : (
        <ListCard empty="No payment links found for current filters.">
          {filtered.slice(0, lazy.count).map(renderRow)}
        </ListCard>
      )}
      {showEmptyState ? null : <LazyListFooter lazy={lazy} total={filtered.length} noun="payment links" />}

      <CreatePaymentLinkSheet visible={createOpen} onDismiss={() => setCreateOpen(false)} onCreate={create} initialValues={createSeed} />
      {linkSheet}
    </TabScreen>
  );
}

/**
 * A payment link's details (opened from its row), in the app's sheet format:
 * the amount and where it stands, the link and invoice, who it's for, when it
 * was made and when it lapses — with what can be done with it pinned at the
 * bottom: an open link can be copied (the main action), duplicated or
 * cancelled; a settled one only duplicated.
 */
function PaymentLinkSheet({
  link,
  onDismiss,
  onCopy,
  onDuplicate,
  onCancel,
}: {
  link: PaymentLinkRow | null;
  onDismiss: () => void;
  onCopy: (link: PaymentLinkRow) => void;
  onDuplicate: (link: PaymentLinkRow) => void;
  onCancel: (link: PaymentLinkRow) => void;
}) {
  const theme = useTheme();
  // Keeps the last link while the sheet slides away, so it doesn't blank mid-animation.
  const [shown, setShown] = useState<PaymentLinkRow | null>(link);
  if (link && link !== shown) setShown(link);
  const current = link ?? shown;
  if (!current) return null;
  const open = current.status === 'Created';
  const outlined = { ...SHEET_BUTTON, style: [SHEET_BUTTON.style, { borderColor: theme.colors.outlineVariant }] };

  return (
    <PanelSheet
      visible={link !== null}
      onDismiss={onDismiss}
      title={`Payment link ${current.paymentLink}`}
      height={open ? 680 : 600}
      footer={
        <View style={styles.sheetActions}>
          {open ? (
            <Button mode="contained" icon="copy" onPress={() => onCopy(current)} {...SHEET_BUTTON}>
              Copy link
            </Button>
          ) : null}
          <Button
            mode={open ? 'outlined' : 'contained'}
            icon="files"
            onPress={() => onDuplicate(current)}
            textColor={open ? theme.colors.onSurface : undefined}
            {...(open ? outlined : SHEET_BUTTON)}>
            Duplicate link
          </Button>
          {open ? (
            <Button mode="outlined" icon="x-circle" onPress={() => onCancel(current)} textColor={theme.colors.error} {...outlined}>
              Cancel link
            </Button>
          ) : null}
        </View>
      }>
      <View style={styles.sheetBody}>
        <View style={styles.sheetHero}>
          <Text style={styles.sheetAmount}>{current.amount}</Text>
          {/* The pill sizes itself to the start of its row; centred here under the amount. */}
          <View style={styles.sheetPill}>
            <StatusPill label={current.status} tone={paymentLinkTone(current.status)} radius={LIST_ROW_INNER_RADIUS} />
          </View>
        </View>
        <SheetSection label="Details">
          <SheetRow first icon="link-simple" title={current.paymentLink} description="Payment link" />
          <SheetRow icon="text-align-left" title={current.description === '-' ? 'No description' : current.description} description="Description" />
          <SheetRow icon="receipt" title={current.invoiceNumber === '-' ? 'None' : current.invoiceNumber} description="Invoice number" />
        </SheetSection>
        <SheetSection label="Customer">
          <SheetRow first icon="envelope-simple" title={current.customerEmail || 'Not given'} description="Email" />
          <SheetRow icon="phone" title={current.customerMobile ? `+91 ${current.customerMobile}` : 'Not given'} description="Mobile" />
        </SheetSection>
        <SheetSection label="Dates">
          <SheetRow first icon="calendar-blank" title={`${current.createdDate}, ${current.createdTime}`} description="Created" />
          <SheetRow
            icon="clock"
            title={`${current.expiryDate}${current.expiryTime ? `, ${current.expiryTime}` : ''}`}
            description={current.status === 'Expired' ? 'Expired' : 'Expires'}
          />
        </SheetSection>
      </View>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  medium: { fontFamily: Fonts.medium },
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  sheetBody: { padding: 16, gap: 16 },
  sheetHero: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  sheetAmount: { fontFamily: Fonts.semiBold, fontSize: 28, lineHeight: 34, fontVariant: ['tabular-nums'] },
  sheetActions: { gap: 8 },
  sheetPill: { flexDirection: 'row', justifyContent: 'center' },
  semiBold: { fontFamily: Fonts.semiBold },
  center: { textAlign: 'center' },
  empty: { alignItems: 'center', gap: 8, padding: 32, borderWidth: 1, borderRadius: Shape.max },
  emptyIcon: { width: 36, height: 36, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  panelButton: { borderRadius: PANEL_INNER_RADIUS },
  heroContainer: { gap: 16 },
  // The container's gap plus the hero's open foot.
  overHero: { marginTop: -(16 + HERO_OVERLAP) },
});

/** When a link was created (rows carry "12 Aug 2026" + "10:10 PM"). */
function createdAt(row: PaymentLinkRow) {
  return parseDisplayDate(row.createdDate, row.createdTime);
}
