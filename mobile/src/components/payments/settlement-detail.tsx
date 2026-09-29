import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Divider, FAB, IconButton, Text, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { DimmedDecimalAmount } from '@/components/shared/amount';
import { BankLogo } from '@/components/shared/bank-logo';
import { CopyableValue } from '@/components/shared/copyable-value';
import { DetailRow, SECTION_CARD_INNER_RADIUS, SectionCard } from '@/components/shared/detail-rows';
import { HelpCard } from '@/components/shared/help-card';
import { CollapsingDetailScreen, DETAIL_FOOTER_BUTTON_RADIUS, type StatusGradientTone } from '@/components/shared/detail-screen';
import { DayGroupedList, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { LIST_ROW_INNER_RADIUS } from '@/components/shared/listing';
import { DotStatusBadge } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { type SettlementRow, type SettlementStatus, settlementDetailRows } from '@/data/settlements';
import { useToast } from '@/hooks/use-toast';

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
 * lazily loaded 10 at a time, grouped by day, same rows as Payments) and Help.
 */
export function SettlementDetail({ settlement }: { settlement: SettlementRow }) {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  // Lazy loading (user decision): 10 rows at first, 10 more each time the list's end scrolls into view.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
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
  // Newest first so each day forms one group.
  const shown = sortNewestFirst(filtered, (row) => displayTimestamp(row.paymentDate, row.paymentTime)).slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const last4 = settlement.accountLabel.slice(-4);

  // Floating search: appears (fade + rise) while the transactions section is on screen, or while a search is open.
  const toast = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cardsTop, setCardsTop] = useState(0);
  const [section, setSection] = useState({ top: 0, height: 0 });
  const [overSection, setOverSection] = useState(false);
  const [searchAnim] = useState(() => new Animated.Value(0));
  const searchShown = overSection || searchOpen;
  useEffect(() => {
    Animated.timing(searchAnim, { toValue: searchShown ? 1 : 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [searchShown, searchAnim]);
  const handleScroll = (offsetY: number, viewportHeight: number) => {
    const top = cardsTop + section.top;
    const bottom = top + section.height;
    // Search shows once the section fills a good part of the screen, until it has mostly scrolled past.
    const next = section.height > 0 && offsetY + viewportHeight > top + 200 && offsetY < bottom - 160;
    if (next !== overSection) setOverSection(next);
    // Near the end of the loaded rows: fetch the next 10 (a short delay stands in for the network).
    if (hasMore && !loadingMore && section.height > 0 && offsetY + viewportHeight > bottom - 120) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((count) => count + PAGE_SIZE);
        setLoadingMore(false);
      }, 500);
    }
  };
  const updateSearch = (value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

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
      fallbackHref="/settlements"
      gradient={gradientFor(settlement.status)}
      hero={hero}
      compactTitle={rupees(settlement.netAmount)}
      compactSubtitle={`${settlement.bankName} Bank •••• ${last4}`}
      onScroll={handleScroll}
      floating={
        <Animated.View
          pointerEvents={searchShown ? 'box-none' : 'none'}
          style={[styles.floatingSearch, { opacity: searchAnim, transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
          {searchOpen ? (
            <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.flex}>
                <SearchField
                  value={search}
                  onChangeText={updateSearch}
                  placeholder="Search by Trxn ID"
                  radius={SEARCH_INNER_RADIUS}
                  autoFocus
                />
              </View>
              <IconButton
                icon="x"
                size={18}
                onPress={() => {
                  setSearchOpen(false);
                  updateSearch('');
                }}
                accessibilityLabel="Close search"
                style={styles.searchClose}
              />
            </View>
          ) : (
            <FAB
              icon="magnifying-glass"
              size="small"
              onPress={() => setSearchOpen(true)}
              accessibilityLabel="Search transactions"
              style={styles.fab}
            />
          )}
        </Animated.View>
      }
      footer={
        <Button mode="contained" icon="download-simple" onPress={() => toast('Downloading settlement report...')} style={styles.footerButton}>
          Download
        </Button>
      }>
      {/* One card per segment, evenly spaced (same layout as Transaction details). */}
      <View style={styles.cards} onLayout={(event) => setCardsTop(event.nativeEvent.layout.y)}>
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

        <View onLayout={(event) => setSection({ top: event.nativeEvent.layout.y, height: event.nativeEvent.layout.height })}>
        <SectionCard title={`${settlement.transactionCount} Transactions included`} icon="arrows-left-right">
          {/* Same rows as Payments → Transactions, grouped by day; no inner box — the section card frames them. */}
          <View style={styles.bleed}>
            <DayGroupedList
              flat
              groups={groupByDay(shown, (row) => row.paymentDate)}
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
          {hasMore ? (
            <View style={styles.loadMore}>
              {loadingMore ? <ActivityIndicator size={18} /> : null}
              <Text variant="bodySmall" style={muted}>
                {loadingMore ? 'Loading more transactions…' : `Showing ${shown.length} of ${filtered.length} · scroll for more`}
              </Text>
            </View>
          ) : filtered.length > 0 ? (
            <Text variant="bodySmall" style={[styles.endOfList, muted]}>
              All {filtered.length} transactions shown
            </Text>
          ) : null}
        </SectionCard>
        </View>

        <HelpCard subject="settlement" carded />
      </View>
    </CollapsingDetailScreen>
  );
}

const PAGE_SIZE = 10;
const SEARCH_PADDING = 8;
const SEARCH_INNER_RADIUS = concentric(Shape.max, SEARCH_PADDING);

const styles = StyleSheet.create({
  hero: { gap: 10, alignItems: 'center', paddingBottom: 8 },
  meta: { fontFamily: Fonts.regular, lineHeight: 22, textAlign: 'center' },
  cards: { gap: 12 },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  viewAll: { alignSelf: 'center', borderRadius: SECTION_CARD_INNER_RADIUS },
  trailingIcon: { flexDirection: 'row-reverse' },
  loadMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 4 },
  endOfList: { textAlign: 'center', paddingTop: 4 },
  // Rows span the card edge to edge, flush under the header divider (cancels the card body's padding).
  bleed: { marginHorizontal: -16, marginTop: -16 },
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
  flex: { flex: 1 },
  floatingSearch: { alignItems: 'flex-end' },
  // Floating containers: capped at the 12dp maximum (Paper's FAB is 16).
  fab: { borderRadius: Shape.max },
  searchBar: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: SEARCH_PADDING,
    borderRadius: Shape.max,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  searchClose: { margin: 0, borderRadius: SEARCH_INNER_RADIUS },
});
