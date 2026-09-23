import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Icon, Text, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { DimmedDecimalAmount } from '@/components/shared/amount';
import { BankLogo } from '@/components/shared/bank-logo';
import { OutlinedActionButton } from '@/components/shared/controls';
import { CopyableValue } from '@/components/shared/copyable-value';
import { DetailRow } from '@/components/shared/detail-rows';
import { DetailScreen, type StatusGradientTone } from '@/components/shared/detail-screen';
import { ListCard, ListRow, ListRowLine } from '@/components/shared/listing';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { DotStatusBadge } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { type SettlementRow, type SettlementStatus, settlementDetailRows } from '@/data/settlements';

import { rupees, settlementStatusTone } from './settlements-view';

const METHOD_ICON = { upi: 'qr-code', card: 'credit-card', netbanking: 'device-mobile' } as const;
const CARD_PADDING = 16;

function gradientFor(status: SettlementStatus): StatusGradientTone {
  if (status === 'Settled') return 'success';
  if (status === 'Failed') return 'failed';
  if (status === 'Processing' || status === 'Initiated') return 'processing';
  return 'neutral';
}

/**
 * Settlement batch detail (web: V3SettlementsContent detail mode): bank, net
 * amount and status, when it was settled and initiated, UTR, the deductions
 * breakdown (View all adds GST), the transactions included (searchable,
 * paginated), and the support prompt. The web's side-by-side header and
 * breakdown stack on a phone, and the included-transactions table becomes
 * stacked records.
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
  const paged = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <DetailScreen title="Settlement details" fallbackHref="/payments?tab=settlements" gradient={gradientFor(settlement.status)}>
      <View style={styles.hero}>
        <BankLogo bank={settlement.bankName} size={48} />
        <View style={styles.amountRow}>
          <DimmedDecimalAmount value={rupees(settlement.netAmount)} size="hero" />
          <DotStatusBadge label={settlement.status} tone={settlementStatusTone(settlement.status)} radius={Shape.max} />
        </View>
        <Text variant="bodyMedium" style={[styles.regular, muted]}>
          Settled to: {settlement.bankName} bank, {settlement.accountLabel} on {settlement.settlementDatePrimary}, {settlement.settlementDateSecondary}
        </Text>
        <Text variant="bodyMedium" style={[styles.regular, muted]}>
          Initiated on: {settlement.initiationDatePrimary}, {settlement.initiationDateSecondary}
        </Text>
        <CopyableValue variant="pill" value={settlement.utr} label={`UTR: ${settlement.utr}`} />
      </View>

      <Card mode="outlined" style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <View style={styles.cardBody}>
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
        </View>
        <Divider />
        <View style={styles.cardBody}>
          <DetailRow label="Net settled amount">
            <Text variant="bodyMedium" style={styles.semiBold}>
              {rupees(settlement.netAmount)}
            </Text>
          </DetailRow>
        </View>
      </Card>

      <Divider />

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{settlement.transactionCount} Transactions included</Text>
        <SearchField
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by Trxn ID"
          radius={Shape.small}
        />
        <View style={styles.row}>
          <OutlinedActionButton label="Download" icon="download-simple" />
        </View>
        <ListCard empty="No transactions match your search.">
          {paged.map((row, index) => (
            <ListRow
              key={`${row.id}-${index}`}
              onPress={() => router.push(`/payments/transactions/${row.id}`)}
              accessibilityLabel={`Transaction ${row.id}, payout ${rupees(row.payoutAmount)}`}>
              <ListRowLine
                left={<Text variant="bodyMedium" style={styles.medium}>{row.id}</Text>}
                right={<Text variant="bodyMedium" style={styles.medium}>{rupees(row.payoutAmount)}</Text>}
              />
              <ListRowLine
                left={
                  <View style={styles.inline}>
                    <Icon source={METHOD_ICON[row.paymentMethod]} size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall">
                      {row.paymentMethodLabel} <Text style={muted}>· {row.paymentMethodSubLabel}</Text>
                    </Text>
                  </View>
                }
                right={
                  <Text variant="bodySmall" style={muted}>
                    {rupees(row.transactionAmount)} − {rupees(row.totalDeduction)}
                  </Text>
                }
              />
              <ListRowLine
                left={
                  <Text variant="bodySmall" style={muted} numberOfLines={1}>
                    {row.storeName} · {row.storeAddress}
                  </Text>
                }
                right={
                  <Text variant="bodySmall" style={muted}>
                    {row.paymentDate}, {row.paymentTime}
                  </Text>
                }
              />
            </ListRow>
          ))}
        </ListCard>
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
      </View>

      <Divider />

      <View style={styles.help}>
        <View style={[styles.helpIcon, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surfaceVariant }]}>
          <Icon source="headphones" size={16} color={theme.colors.onSurface} />
        </View>
        <View style={styles.flex}>
          <Text variant="bodyMedium" style={styles.medium}>
            Need help with this settlement?
          </Text>
          <Text variant="bodyMedium" style={[styles.regular, muted]}>
            Our support team is available 24x7 to assist you with any questions
          </Text>
        </View>
      </View>
      <OutlinedActionButton label="Contact us" onPress={() => router.navigate('/support')} />
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 10 },
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 },
  regular: { fontFamily: Fonts.regular },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  cardBody: { padding: CARD_PADDING, gap: 12 },
  viewAll: { alignSelf: 'center', borderRadius: concentric(Shape.max, CARD_PADDING) },
  trailingIcon: { flexDirection: 'row-reverse' },
  block: { gap: 12 },
  // Web: text-xl font-semibold.
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 28 },
  row: { flexDirection: 'row', gap: 8 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  help: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpIcon: { width: 32, height: 32, borderRadius: Shape.small, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
