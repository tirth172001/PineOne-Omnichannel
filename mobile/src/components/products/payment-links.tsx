import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

import { FilterMenuButton } from '@/components/shared/controls';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DETAIL_FOOTER_BUTTON_RADIUS, DetailScreen } from '@/components/shared/detail-screen';
import { DateTimeField, type DateTimeValue, FormField, FormTextInput } from '@/components/shared/form-fields';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, ListCard, ListingToolbar, ListRow, ListRowLine } from '@/components/shared/listing';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { RowActionsMenu } from '@/components/shared/row-actions';
import { StatusPill } from '@/components/shared/status';
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
 * is the pinned footer action.
 */
export function PaymentLinks({ startCreating = false }: { startCreating?: boolean }) {
  const theme = useTheme();
  const toast = useToast();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [rows, setRows] = useState<PaymentLinkRow[]>(PAYMENT_LINK_ROWS);
  const [searchField, setSearchField] = useState<PaymentLinkSearchField>('paymentId');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | PaymentLinkStatus>('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const [createOpen, setCreateOpen] = useState(startCreating);
  const [createSeed, setCreateSeed] = useState<Partial<CreatePaymentLinkValues>>();
  const lazy = useLazyList();
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

  return (
    <DetailScreen
      title="Payment links"
      fallbackHref="/more"
      footer={
        <Button mode="contained" icon="plus" onPress={() => openCreate()} style={styles.footerButton}>
          New payment link
        </Button>
      }>
      {/* Search floats above the footer; "Search by" picks the field it matches. */}
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder={`Enter ${activeField.label.toLowerCase()}`}
        filters={
          <>
            <FilterMenuButton
              value={searchField}
              onValueChange={(value) => {
                setSearchField(value);
                lazy.reset();
              }}
              options={SEARCH_FIELD_OPTIONS}
              accessibilityLabel="Search by"
            />
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="today" />
            <FilterMenuButton
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                lazy.reset();
              }}
              options={STATUS_OPTIONS}
              accessibilityLabel="Status"
            />
          </>
        }
        floatingActions={[{ label: 'Download filtered', icon: 'download-simple' }]}
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
          {filtered.slice(0, lazy.count).map((row) => (
            <ListRow key={row.id} accessibilityLabel={`Payment link ${row.paymentLink}, ${row.amount}, ${row.status}`}>
              <ListRowLine
                left={
                  <>
                    <Text variant="bodyMedium" style={styles.medium}>
                      {row.paymentLink}
                    </Text>
                    <Text variant="bodySmall" style={muted}>
                      {row.amount} · Invoice {row.invoiceNumber}
                    </Text>
                  </>
                }
                right={
                  <RowActionsMenu
                    accessibilityLabel={`Actions for ${row.paymentLink}`}
                    actions={[
                      {
                        label: 'Copy link',
                        icon: 'copy',
                        onPress: () => {
                          void Clipboard.setStringAsync(row.paymentLink);
                          toast('Payment link copied');
                        },
                      },
                      { label: 'Duplicate link', onPress: () => duplicate(row) },
                    ]}
                  />
                }
              />
              <Text variant="bodySmall">{row.description}</Text>
              <ListRowLine
                left={
                  <Text variant="bodySmall" style={muted}>
                    Created {row.createdDate}, {row.createdTime}
                    {'\n'}
                    Expires {row.expiryDate}
                    {row.expiryTime ? `, ${row.expiryTime}` : ''}
                  </Text>
                }
                right={<StatusPill label={row.status} tone={paymentLinkTone(row.status)} radius={LIST_ROW_INNER_RADIUS} />}
              />
            </ListRow>
          ))}
        </ListCard>
      )}
      {showEmptyState ? null : <LazyListFooter lazy={lazy} total={filtered.length} noun="payment links" />}

      <CreatePaymentLinkSheet visible={createOpen} onDismiss={() => setCreateOpen(false)} onCreate={create} initialValues={createSeed} />
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  center: { textAlign: 'center' },
  empty: { alignItems: 'center', gap: 8, padding: 32, borderWidth: 1, borderRadius: Shape.max },
  emptyIcon: { width: 36, height: 36, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
  panelButton: { borderRadius: PANEL_INNER_RADIUS },
});
