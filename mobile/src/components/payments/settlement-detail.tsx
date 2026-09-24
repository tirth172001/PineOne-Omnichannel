import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { DimmedDecimalAmount } from '@/components/shared/amount';
import { BankLogo } from '@/components/shared/bank-logo';
import { OutlinedActionButton } from '@/components/shared/controls';
import { CopyableValue } from '@/components/shared/copyable-value';
import { DetailRow, SECTION_CARD_INNER_RADIUS, SectionCard } from '@/components/shared/detail-rows';
import { HelpCard } from '@/components/shared/help-card';
import { CollapsingDetailScreen, type StatusGradientTone } from '@/components/shared/detail-screen';
import { DayGroupedList, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { LIST_ROW_INNER_RADIUS } from '@/components/shared/listing';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { DotStatusBadge } from '@/components/shared/status';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { type SettlementRow, type SettlementStatus, settlementDetailRows } from '@/data/settlements';

import { PaymentRow } from './payment-row';
import { rupees, settlementStatusTone } from './settlements-view';


function gradientFor(status: SettlementStatus): StatusGradientTone {
  if (status === 'Settled') return 'success';
  if (status === 'Failed') return 'failed';
  if (status === 'Processing' || status === 'Initiated') return 'processing';
  return 'neutral';
}

/**
 * Settlement batch detail (web: V3SettlementsContent detail mode), laid out
 * like Transaction details: a collapsing header over a centred hero (bank,
 * net amount, status, settled / initiated, UTR), then cards — Amount
 * breakdown (View all adds GST), the transactions included (searchable,
 * paginated, grouped by day, same rows as Payments) and Help.
 */
export function SettlementDetail({ settlement }: { settlement: SettlementRow }) {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const muted = { color: theme.colors.onSurfaceVariant };

  const deductions = [
    { label: 'Refunds', value: settlement.refundAmount },
    { label: 'Chargeback', value: settlement.chargebackAmount },
    { label: 'Loan recovery', value: settlement.recoveryAmount },
    { label: 'MSF / MDR', value: settlement.mdrAmount },
    { label: 'MCF', value: settlement.platformFees },
    ...(showAll ? [{ label: 'GST', value: settlement.gstAmount }] : []),
  ];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return settlementDetailRows;
    return settlementDetailRows.filter((row) =>
      `${row.id} ${row.merchantOrderId} ${row.arn} ${row.rrn} ${row.storeName} ${row.storeAddress} ${row.tid} ${row.paymentMethodLabel} ${row.paymentMethodSubLabel}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  // Newest first so each day forms one group.
  const paged = sortNewestFirst(filtered, (row) => displayTimestamp(row.paymentDate, row.paymentTime)).slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const last4 = settlement.accountLabel.slice(-4);

  // Centred summary; it collapses into the header (settled amount + bank) on scroll.
  const hero = (
    <View style={styles.hero}>
      <BankLogo bank={settlement.bankName} size={48} />
      <DimmedDecimalAmount value={rupees(settlement.netAmount)} size="hero" />
      {/* Wrapped so the badge (which aligns itself to the start) centres in the hero. */}
      <View>
        <DotStatusBadge label={settlement.status} tone={settlementStatusTone(settlement.status)} radius={Shape.max} />
      </View>
      <Text variant="bodyMedium" style={[styles.meta, muted]}>
        Settled to: {settlement.bankName} bank, {settlement.accountLabel} on {settlement.settlementDatePrimary}, {settlement.settlementDateSecondary}
        {'\n'}
        Initiated on: {settlement.initiationDatePrimary}, {settlement.initiationDateSecondary}
      </Text>
      <View>
        <CopyableValue variant="pill" value={settlement.utr} label={`UTR: ${settlement.utr}`} />
      </View>
    </View>
  );

  return (
    <CollapsingDetailScreen
      fallbackHref="/payments?tab=settlements"
      gradient={gradientFor(settlement.status)}
      hero={hero}
      compactTitle={rupees(settlement.netAmount)}
      compactSubtitle={`${settlement.bankName} Bank •••• ${last4}`}>
      {/* One card per segment, evenly spaced (same layout as Transaction details). */}
      <View style={styles.cards}>
        <SectionCard title="Amount breakdown" icon="wallet">
          <DetailRow label="Gross amount">
            <Text variant="bodyMedium" style={styles.medium}>
              {rupees(settlement.grossAmount)}
            </Text>
          </DetailRow>
          {deductions.map((item) => (
            <DetailRow key={item.label} label={item.label}>
              <Text variant="bodyMedium" style={[styles.medium, { color: theme.colors.error }]}>
                - {rupees(item.value)}
              </Text>
            </DetailRow>
          ))}
          <Button
            mode="text"
            compact
            icon={showAll ? 'caret-up' : 'caret-down'}
            onPress={() => setShowAll((current) => !current)}
            contentStyle={styles.trailingIcon}
            style={styles.viewAll}>
            {showAll ? 'View less' : 'View all'}
          </Button>
          <Divider />
          <DetailRow label="Net settled amount">
            <Text variant="bodyMedium" style={styles.semiBold}>
              {rupees(settlement.netAmount)}
            </Text>
          </DetailRow>
        </SectionCard>

        <SectionCard title={`${settlement.transactionCount} Transactions included`} icon="arrows-left-right">
          <SearchField
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by Trxn ID"
            radius={SECTION_CARD_INNER_RADIUS}
          />
          <View style={styles.row}>
            <OutlinedActionButton label="Download" icon="download-simple" radius={SECTION_CARD_INNER_RADIUS} />
          </View>
          {/* Same rows as Payments → Transactions, grouped by day; no inner box — the section card frames them. */}
          <View style={styles.bleed}>
            <DayGroupedList
              flat
              groups={groupByDay(paged, (row) => row.paymentDate)}
              empty="No transactions match your search."
              renderRow={(row) => (
                <PaymentRow
                  amount={rupees(row.transactionAmount)}
                  paymentMode={row.paymentMethod}
                  paymentLabel={row.paymentMethodLabel}
                  status={<DotStatusBadge label={row.payoutStatus} tone={settlementStatusTone(row.payoutStatus)} radius={LIST_ROW_INNER_RADIUS} />}
                  onPress={() => router.push(`/payments/transactions/${row.id}`)}
                  accessibilityLabel={`${rupees(row.transactionAmount)}, ${row.paymentMethodLabel}, ${row.payoutStatus}`}
                />
              )}
            />
          </View>
          <PaginationBar
            page={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalRows={filtered.length}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(1);
            }}
          />
        </SectionCard>

        <HelpCard subject="settlement" carded />
      </View>
    </CollapsingDetailScreen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 10, alignItems: 'center', paddingBottom: 8 },
  meta: { fontFamily: Fonts.regular, lineHeight: 22, textAlign: 'center' },
  cards: { gap: 12 },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  viewAll: { alignSelf: 'center', borderRadius: SECTION_CARD_INNER_RADIUS },
  trailingIcon: { flexDirection: 'row-reverse' },
  row: { flexDirection: 'row', gap: 8 },
  // Rows span the card edge to edge (cancels the card body's 16dp padding).
  bleed: { marginHorizontal: -16 },
});
