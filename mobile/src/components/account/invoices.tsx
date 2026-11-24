import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

import { ListingCard } from '@/components/listing-hero/listing-card';
import { useListDates } from '@/components/listing-hero/time-scope';
import { Tabs } from '@/components/material3/tabs';
import { DotSeparated, RowAmount } from '@/components/payments/payment-row';
import { DimmedDecimalAmount } from '@/components/shared/amount';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { DetailScreen } from '@/components/shared/detail-screen';
import { ListDivider, ListRow, ListRowLine, selectFilter, StatusStack } from '@/components/shared/listing';
import { PanelSheet } from '@/components/shared/panel-sheet';
import { OptionCard, PaymentSummary, SheetBlock, SheetButton, SheetField, SheetHeading, SheetRow, SheetSuccess } from '@/components/shared/sheet-parts';
import { DotStatusBadge } from '@/components/shared/status';
import { PAGE_PADDING } from '@/components/tab-screen';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { daysBetween, dueIn, formatInr } from '@/data/common';
import { BUSINESS_DETAILS } from '@/data/business-profile';
import { type Due, dueDateOf, type DuePayment, DUES_TODAY, INVOICE_SELLER, invoiceLines, outstandingOf, type PaidInvoice, payDues, useDues } from '@/data/invoices';
import { parseDisplayDate } from '@/data/transactions';
import { useToast } from '@/hooks/use-toast';

const byDueDate = (a: Due, b: Due) => dueDateOf(a).getTime() - dueDateOf(b).getTime();
const daysLeft = (due: Due) => daysBetween(DUES_TODAY, dueDateOf(due));
const shortDate = (date: string) => date.replace(/ \d{4}$/, '');

/** Unpaid, or past its date; the note under it says how soon, red from a day out. */
function dueStatus(due: Due) {
  const days = daysLeft(due);
  return {
    badge: <DotStatusBadge label={days < 0 ? 'Overdue' : 'Unpaid'} tone={days < 0 ? 'danger' : 'warning'} />,
    note: dueIn(dueDateOf(due), DUES_TODAY),
    urgent: days <= 1,
  };
}

/**
 * Invoices (profile → Manage → Invoices), as Figma 7804:118368: Back and
 * the title in the bar, then Pending / All Invoices tabs. Pending is the
 * amount owed (View invoices opens the unpaid ones in a sheet; Pay now
 * asks for full or partial payment) over the payments made so far, by day. All
 * Invoices lists every invoice with its status; a row opens its preview with a
 * download. Payments go towards the balance in bulk and aren't matched to
 * invoices, so neither side links to the other and there's no paying one
 * invoice on its own: a partial payment lowers the balance, not an invoice.
 */
export function Invoices() {
  const { dues, payments, paid, credit } = useDues();
  const owed = outstandingOf({ dues, credit });
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [paying, setPaying] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  return (
    <DetailScreen title="Invoices" fallbackHref="/">
      <View style={styles.tabs}>
        <Tabs
          variant="secondary"
          tabs={[
            { key: 'pending', label: 'Pending' },
            { key: 'all', label: 'All Invoices' },
          ]}
          activeKey={tab}
          onChange={(key) => setTab(key as typeof tab)}
        />
      </View>

      {tab === 'pending' ? (
        <View style={styles.stack}>
          <PendingAmountCard dues={dues} owed={owed} credit={credit} onViewInvoices={() => setListOpen(true)} onPay={() => setPaying(true)} />
          <PastPayments payments={payments} />
        </View>
      ) : (
        <AllInvoices dues={dues} paid={paid} />
      )}

      <PendingInvoicesSheet visible={listOpen} dues={dues} owed={owed} onDismiss={() => setListOpen(false)} />
      <PayDuesSheet visible={paying} dues={dues} owed={owed} onDismiss={() => setPaying(false)} />
    </DetailScreen>
  );
}

/**
 * Figma 7804:118701: PENDING AMOUNT with the hourglass, a hairline, the total
 * (20/28, faint paise) over "7 Pending invoices  View invoices", a hairline,
 * then Pay now at the end.
 */
function PendingAmountCard({
  dues,
  owed,
  credit,
  onViewInvoices,
  onPay,
}: {
  dues: Due[];
  owed: number;
  credit: number;
  onViewInvoices: () => void;
  onPay: () => void;
}) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };
  const rule = { borderColor: theme.colors.background };
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.cardHeader, styles.ruleBelow, rule]}>
        <Icon source="hourglass-low" size={20} color={theme.colors.onSurfaceVariant} />
        <Text accessibilityRole="header" style={[styles.medium, muted]}>
          PENDING AMOUNT
        </Text>
      </View>
      <View style={styles.amountBlock}>
        <DimmedDecimalAmount value={formatInr(owed)} size="medium" />
        {credit > 0 ? <Text style={[styles.medium, muted]}>After {formatInr(credit)} already paid</Text> : null}
        {dues.length ? (
          <View style={styles.countRow}>
            <Text style={[styles.medium, muted]}>
              {dues.length} Pending {dues.length === 1 ? 'invoice' : 'invoices'}
            </Text>
            <Text onPress={onViewInvoices} accessibilityRole="button" style={[styles.medium, styles.link, { color: theme.colors.primary }]}>
              View invoices
            </Text>
          </View>
        ) : (
          <Text style={[styles.medium, muted]}>You have no pending invoices</Text>
        )}
      </View>
      {dues.length ? (
        <View style={[styles.cardFooter, styles.ruleAbove, rule]}>
          <Button mode="contained" onPress={onPay} style={styles.smallButton} contentStyle={styles.smallButtonContent} labelStyle={styles.smallButtonLabel}>
            Pay now
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const PAY_METHOD_ICON: Record<DuePayment['method'], string> = { UPI: 'bank', 'Net banking': 'bank', Card: 'credit-card' };

/**
 * Figma 7804:119252: "Past payments" heading the card, then a grey band per
 * day and its payments — the amount, "10:30 am · UPI", and Success or Failed.
 * Payments cover the balance in bulk, so a row names no invoice.
 */
function PastPayments({ payments }: { payments: DuePayment[] }) {
  const theme = useTheme();
  const sorted = sortNewestFirst(payments, (payment) => displayTimestamp(payment.date, payment.time.toUpperCase()));
  const renderPayment = (payment: DuePayment) => {
    const label = payment.status === 'Paid' ? 'Success' : 'Failed';
    return (
      <ListRow key={payment.id} icon={PAY_METHOD_ICON[payment.method]} accessibilityLabel={`${formatInr(payment.amount)} at ${payment.time} by ${payment.method}, ${label}`}>
        <ListRowLine
          centered
          left={
            <>
              <RowAmount value={formatInr(payment.amount)} />
              <DotSeparated parts={[payment.time, payment.method]} />
            </>
          }
          right={<DotStatusBadge label={label} tone={payment.status === 'Paid' ? 'success' : 'danger'} />}
        />
      </ListRow>
    );
  };
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text accessibilityRole="header" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
        Past payments
      </Text>
      <DayGroupedList
        flat
        groups={groupByDay(sorted, (payment) => payment.date)}
        totals={paidTotals(sorted)}
        renderRow={renderPayment}
        empty="No payments made yet."
        noun={{ one: 'payment', other: 'payments' }}
      />
    </View>
  );
}

/** Each day's band: what was paid that day, or its count when every attempt failed (never "₹0.00"). */
function paidTotals(payments: DuePayment[]) {
  const totals = dayTotals(payments, (payment) => payment.date, (payment) => (payment.status === 'Paid' ? payment.amount : 0));
  totals.forEach((total) => {
    if (!total.amount) total.amount = undefined;
  });
  return totals;
}

type InvoiceEntry = { due: Due; paid: boolean };

type InvoiceStatus = 'Unpaid' | 'Overdue' | 'Paid';
const invoiceStatus = (entry: InvoiceEntry): InvoiceStatus => (entry.paid ? 'Paid' : daysLeft(entry.due) < 0 ? 'Overdue' : 'Unpaid');
const INVOICE_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Unpaid', label: 'Unpaid' },
  { value: 'Overdue', label: 'Overdue' },
  { value: 'Paid', label: 'Paid' },
] as const;
const issuedOn = (entry: InvoiceEntry) => parseDisplayDate(entry.due.invoiceUpdated, '12:00 PM');

/**
 * All Invoices, as the app's other listings: the date pill over the list,
 * then one card with search (invoice number or amount) and a Status filter,
 * and the invoices in grey bands by the day they were issued, newest first.
 */
function AllInvoices({ dues, paid }: { dues: Due[]; paid: PaidInvoice[] }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | InvoiceStatus>('all');
  const [preview, setPreview] = useState<InvoiceEntry | null>(null);
  const entries: InvoiceEntry[] = sortNewestFirst(
    [...[...dues].sort(byDueDate).map((due) => ({ due, paid: false })), ...paid.map((invoice) => ({ due: invoice, paid: true }))],
    (entry) => displayTimestamp(entry.due.invoiceUpdated, '12:00 PM'),
  );
  const issued = useListDates(entries, issuedOn, { subject: 'invoices issued', presets: ['30d', '90d', 'all'], initial: 'all' });
  const query = search.trim().toLowerCase().replace(/[₹,\s]/g, '');
  const shown = issued.inRange.filter((entry) => {
    if (status !== 'all' && invoiceStatus(entry) !== status) return false;
    return !query || `${entry.due.invoiceNumber} ${entry.due.amount}`.toLowerCase().includes(query);
  });
  const noun = { one: 'invoice', other: 'invoices' };
  return (
    <ListingCard
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search invoices"
      time={issued.scope}
      filters={[selectFilter({ label: 'Status', options: INVOICE_STATUS_OPTIONS, value: status, onApply: setStatus })]}
      totals={{ all: issued.inRange.length, shown: shown.length, amount: shown.reduce((sum, entry) => sum + entry.due.amount, 0) }}
      noun={noun}>
      <DayGroupedList
        flat
        groups={groupByDay(shown, (entry) => entry.due.invoiceUpdated)}
        totals={dayTotals(shown, (entry) => entry.due.invoiceUpdated, (entry) => entry.due.amount)}
        noun={noun}
        renderRow={(entry) => <InvoiceRow key={entry.due.id} due={entry.due} paid={entry.paid} onPress={() => setPreview(entry)} />}
        empty={issued.inRange.length ? 'No invoices match. Try clearing the search or filters.' : 'No invoices issued in these dates.'}
      />
      <InvoicePreviewSheet entry={preview} onDismiss={() => setPreview(null)} />
    </ListingCard>
  );
}

/**
 * An invoice's row, no icon (here and in the View invoices sheet): the amount
 * over its number; at the end its status with its due date (or how late, in
 * red), then the chevron. Tapping it opens the invoice's preview and download.
 * A paid invoice shows no paid date: payments clear the balance in bulk, not a
 * given invoice.
 */
function InvoiceRow({ due, paid = false, onPress }: { due: Due; paid?: boolean; onPress: () => void }) {
  const status = paid ? null : dueStatus(due);
  const statusLabel = paid ? 'Paid' : daysLeft(due) < 0 ? 'Overdue' : 'Unpaid';
  const note = status?.urgent ? status.note : `Due ${shortDate(due.dueDate)}`;
  return (
    <ListRow onPress={onPress} accessibilityLabel={`${formatInr(due.amount)}, invoice ${due.invoiceNumber}, ${statusLabel}, ${note}. Opens the invoice`}>
      <ListRowLine
        centered
        left={
          <>
            <RowAmount value={formatInr(due.amount)} />
            <DotSeparated parts={[due.invoiceNumber]} />
          </>
        }
        right={<StatusStack status={status ? status.badge : <DotStatusBadge label="Paid" tone="success" />} note={note} urgent={status?.urgent} />}
      />
    </ListRow>
  );
}

/** View invoices: the unpaid invoices, soonest due first. A row opens its preview; Pay now under them asks how much to pay. */
function PendingInvoicesSheet({ visible, dues, owed, onDismiss }: { visible: boolean; dues: Due[]; owed: number; onDismiss: () => void }) {
  const [paying, setPaying] = useState(false);
  const [preview, setPreview] = useState<Due | null>(null);
  const sorted = [...dues].sort(byDueDate);
  return (
    <>
      <PanelSheet
        visible={visible && !paying && !preview}
        onDismiss={onDismiss}
        title={`Pending invoices (${dues.length})`}
        fit
        footer={dues.length ? <SheetButton label={`Pay now · ${formatInr(owed)}`} onPress={() => setPaying(true)} /> : undefined}>
        {sorted.length ? (
          sorted.map((due, index) => (
            <View key={due.id}>
              {index > 0 ? <ListDivider /> : null}
              <InvoiceRow due={due} onPress={() => setPreview(due)} />
            </View>
          ))
        ) : (
          <SheetBlock last>
            <Text style={styles.body}>No unpaid invoices. You&apos;re all caught up.</Text>
          </SheetBlock>
        )}
      </PanelSheet>
      {/* Back from the preview returns to this list. */}
      <InvoicePreviewSheet entry={preview ? { due: preview, paid: false } : null} onDismiss={() => setPreview(null)} />
      <PayDuesSheet
        visible={paying}
        dues={dues}
        owed={owed}
        onDismiss={() => {
          setPaying(false);
          onDismiss();
        }}
      />
    </>
  );
}

type PayChoice = 'full' | 'partial';

/** Digits and one decimal point, up to paise: what the amount field accepts as it's typed. */
const cleanAmount = (text: string) => {
  const [rupees, ...rest] = text.replace(/[^\d.]/g, '').split('.');
  return rest.length ? `${rupees}.${rest.join('').slice(0, 2)}` : rupees;
};

/**
 * Pay outstanding amount: choose Full payment (the whole balance, clearing every
 * unpaid invoice) or Partial payment (a specific amount now, the rest later),
 * then pay and see what's left.
 */
function PayDuesSheet({ visible, dues, owed, onDismiss }: { visible: boolean; dues: Due[]; owed: number; onDismiss: () => void }) {
  const [step, setStep] = useState<'choose' | 'paying' | 'paid'>('choose');
  const [choice, setChoice] = useState<PayChoice>('full');
  const [amountText, setAmountText] = useState('');
  // What was paid and what's left, held so the done state still shows them once the store updates.
  const [result, setResult] = useState({ amount: 0, left: 0, count: 0 });
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setStep('choose');
      setChoice('full');
      setAmountText('');
    }
  }

  const overdue = dues.filter((due) => daysLeft(due) < 0).length;
  const typed = Number(amountText);
  const amountError =
    choice !== 'partial' || !amountText
      ? undefined
      : !typed || typed <= 0
        ? 'Enter an amount above ₹0'
        : typed > owed
          ? `That's more than you owe. Enter up to ${formatInr(owed)}`
          : undefined;
  const amount = choice === 'full' ? owed : amountError || !amountText ? 0 : typed;
  const canPay = amount > 0 && step === 'choose';

  const pay = () => {
    setStep('paying');
    setTimeout(() => {
      setResult({ amount, left: Math.max(0, Math.round((owed - amount) * 100) / 100), count: dues.length });
      payDues(amount);
      setStep('paid');
    }, 900);
  };

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Pay outstanding amount"
      fit
      footer={
        step === 'paid' ? (
          <SheetButton label="Done" onPress={onDismiss} />
        ) : (
          <SheetButton
            label={step === 'paying' ? 'Processing payment…' : amount > 0 ? `Pay ${formatInr(amount)}` : 'Pay'}
            disabled={!canPay}
            onPress={pay}
          />
        )
      }>
      {step === 'paid' ? (
        result.left > 0 ? (
          <SheetSuccess
            title="Payment received"
            body={`${formatInr(result.amount)} is paid towards your pending amount. ${formatInr(result.left)} is still pending, and your invoices stay unpaid until it's cleared.`}
          />
        ) : (
          <SheetSuccess
            title="Payment received"
            body={`${formatInr(result.amount)} for ${result.count} ${result.count === 1 ? 'invoice' : 'invoices'} is paid. The receipts are on their way to your email.`}
          />
        )
      ) : (
        <>
          <PaymentSummary icon="receipt" amount={owed} meta={[`${dues.length} ${dues.length === 1 ? 'invoice' : 'invoices'}`, ...(overdue ? [`${overdue} overdue`] : [])]} />
          <SheetBlock last gap={12}>
            <SheetHeading>How much do you want to pay?</SheetHeading>
            <OptionCard
              title="Full payment"
              description={`${formatInr(owed)} · clears every unpaid invoice`}
              selected={choice === 'full'}
              onPress={() => setChoice('full')}
            />
            <OptionCard title="Partial payment" description="Pay part of it now and the rest later" selected={choice === 'partial'} onPress={() => setChoice('partial')} />
            {choice === 'partial' ? (
              <SheetField
                label="Amount to pay"
                value={amountText}
                onChangeText={(text) => setAmountText(cleanAmount(text))}
                placeholder="0.00"
                prefix="₹"
                keyboardType="number-pad"
                error={amountError}
                hint={`Up to ${formatInr(owed)}. Your invoices stay unpaid until the full balance is cleared.`}
              />
            ) : null}
          </SheetBlock>
        </>
      )}
    </PanelSheet>
  );
}

/**
 * An invoice's preview, as a page of the PDF: Pine Labs and the invoice's
 * number and dates, who it's billed to, the charge, IGST and the total. Download
 * invoice sits in the footer.
 */
function InvoicePreviewSheet({ entry, onDismiss }: { entry: InvoiceEntry | null; onDismiss: () => void }) {
  const theme = useTheme();
  const toast = useToast();
  // Hold the last invoice so the sheet keeps its content while it slides away.
  const [shown, setShown] = useState<InvoiceEntry | null>(entry);
  if (entry && entry !== shown) setShown(entry);
  const due = shown?.due;
  const muted = { color: theme.colors.onSurfaceVariant };
  const strong = { color: theme.colors.onSurface };
  const lines = due ? invoiceLines(due) : null;
  const status = shown ? invoiceStatus(shown) : 'Unpaid';
  return (
    <PanelSheet
      visible={entry !== null}
      onDismiss={onDismiss}
      title={due ? `Invoice ${due.invoiceNumber}` : 'Invoice'}
      fit
      footer={
        due ? (
          <SheetButton
            label="Download invoice"
            icon="download-simple"
            onPress={() => toast(`Invoice ${due.invoiceNumber} downloaded${due.hasAnnexure ? ' with its annexure' : ''}`)}
          />
        ) : undefined
      }>
      {due && lines ? (
        <SheetBlock last>
          <View
            accessible
            accessibilityLabel={`Invoice ${due.invoiceNumber} preview, ${formatInr(lines.total)}, ${status}`}
            style={[styles.paper, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
            <View style={styles.paperHeader}>
              <View style={styles.flex}>
                <Text style={[styles.paperBrand, strong]}>{INVOICE_SELLER.name}</Text>
                <Text style={[styles.small, muted]}>{INVOICE_SELLER.address}</Text>
                <Text style={[styles.small, muted]}>GSTIN {INVOICE_SELLER.gstin}</Text>
              </View>
              <Text style={[styles.label, muted]}>TAX INVOICE</Text>
            </View>

            <View style={[styles.paperSection, styles.ruleAbove, { borderColor: theme.colors.background }]}>
              <SheetRow label="Invoice no." value={due.invoiceNumber} />
              <SheetRow label="Issued on" value={due.invoiceUpdated} />
              <SheetRow label="Due on" value={due.dueDate} />
              <SheetRow
                label="Status"
                value={<DotStatusBadge label={status} tone={status === 'Paid' ? 'success' : status === 'Overdue' ? 'danger' : 'warning'} />}
              />
            </View>

            <View style={[styles.paperSection, styles.ruleAbove, { borderColor: theme.colors.background }]}>
              <Text style={[styles.label, muted]}>BILLED TO</Text>
              <Text style={[styles.medium, strong]}>{BUSINESS_DETAILS.legalName}</Text>
              <Text style={[styles.small, muted]}>{BUSINESS_DETAILS.address}</Text>
              <Text style={[styles.small, muted]}>GSTIN {BUSINESS_DETAILS.gstin}</Text>
            </View>

            <View style={[styles.paperSection, styles.ruleAbove, { borderColor: theme.colors.background }]}>
              {lines.items.map((item) => (
                <SheetRow key={item.label} label={item.label} value={formatInr(item.amount)} />
              ))}
              <SheetRow label="IGST 18%" value={formatInr(lines.gst)} />
              <SheetRow label="Total" strong value={<Text style={[styles.total, strong]}>{formatInr(lines.total)}</Text>} />
            </View>
            {due.hasAnnexure ? <Text style={[styles.small, muted]}>The line-item annexure downloads with it.</Text> : null}
          </View>
        </SheetBlock>
      ) : null}
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { marginHorizontal: -PAGE_PADDING, marginTop: -PAGE_PADDING },
  stack: { gap: 8 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  // Figma 7804:118703: 16dp in, the 20dp icon 8dp from the label.
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
  ruleBelow: { borderBottomWidth: 1 },
  ruleAbove: { borderTopWidth: 1 },
  amountBlock: { gap: 4, padding: 16 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  medium: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  link: { textDecorationLine: 'underline' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 12 },
  // Figma 7804:118713: 32dp, 16dp sides, 8dp corners.
  smallButton: { borderRadius: Shape.small },
  smallButtonContent: { height: 32, paddingHorizontal: 4 },
  smallButtonLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, marginVertical: 0 },
  cardTitle: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20, padding: 12 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  // The invoice preview: a bordered page inside the sheet (boxes nested in a sheet keep their border).
  paper: { borderWidth: 1, borderRadius: Shape.small, padding: 16, gap: 16 },
  paperHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  paperBrand: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  paperSection: { gap: 8, paddingTop: 16 },
  total: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24, fontVariant: ['tabular-nums', 'stylistic-one'] },
});
