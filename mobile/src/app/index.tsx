import { router } from 'expo-router';
import { Animated, StyleSheet, View } from 'react-native';

import { TabChrome, useTabNavBar, useTabScroll } from '@/components/app-tabs';
import { ExploreProducts } from '@/components/overview/explore-products';
import { OnDemandBanner } from '@/components/overview/on-demand-banner';
import { QuickActions } from '@/components/overview/quick-actions';
import { type ChannelSummary, TodayPaymentsCard } from '@/components/overview/today-payments-card';
import { TodaySettlementCard } from '@/components/overview/today-settlement-card';
import { usePullToRefresh } from '@/components/pull-to-refresh';
import { CHANNEL_MULTIPLIER, TODAY_PAYMENTS } from '@/data/overview';
import { useBusiness } from '@/hooks/use-business';

/**
 * Overview (Figma 6470:676, "PineOne - Omni-channel"), top to bottom:
 * 1. Today's payments, then today's settlement, stacked. On all channels the
 *    payments card splits today into In-store and Online; on one channel it
 *    lists that channel's latest three payments.
 * 2. A nudge towards On-Demand settlement.
 * 3. Quick actions, then Explore products.
 * Sections are 32dp apart. Every number follows the stores and channel chosen
 * in the header switcher; the page has no scope filters of its own.
 */
export default function OverviewScreen() {
  return (
    <TabChrome tab="index">
      <OverviewContent />
    </TabChrome>
  );
}

/** Inside TabChrome, so scrolling slides the navigation bar away. */
function OverviewContent() {
  const { storeScale, channelScale, channel } = useBusiness();
  const scale = storeScale * channelScale;
  const navBar = useTabNavBar();
  const tabScroll = useTabScroll();
  const { attach: attachPull, refreshControl, indicator: pullIndicator } = usePullToRefresh(tabScroll.contentTop);
  const count = Math.max(0, Math.round(TODAY_PAYMENTS.count * scale));
  const totalAmount = Math.round(TODAY_PAYMENTS.totalAmount * scale);
  // All channels: today split by channel. Online takes the remainder, so the two rows add up to the total.
  const inStoreCount = Math.round(count * CHANNEL_MULTIPLIER['in-store']);
  const inStoreAmount = Math.round(totalAmount * CHANNEL_MULTIPLIER['in-store']);
  const channels: ChannelSummary[] | undefined =
    channel === 'all'
      ? [
          { kind: 'in-store', label: 'In-store payments', count: inStoreCount, amount: inStoreAmount },
          { kind: 'online', label: 'Online payments', count: count - inStoreCount, amount: totalAmount - inStoreAmount },
        ]
      : undefined;

  return (
    <View style={styles.area}>
      <Animated.ScrollView
        ref={attachPull}
        refreshControl={refreshControl}
        {...tabScroll.scrollProps}
        contentContainerStyle={[styles.content, { paddingTop: tabScroll.contentTop + 24, paddingBottom: 32 + navBar.height }]}>
        {/* Today's two cards, one under the other. */}
        <View style={styles.cards}>
          <TodayPaymentsCard
            totalAmount={totalAmount}
            count={count}
            channels={channels}
            recent={TODAY_PAYMENTS.recent.slice(0, 3)}
            recentKind={channel === 'online' ? 'online' : 'in-store'}
            onPressChannel={() => router.navigate('/payments')}
            onPressPayment={(transactionId) => router.push(`/payments/transactions/${transactionId}`)}
            onPressHistory={() => router.navigate('/payments')}
          />
          <TodaySettlementCard scale={scale} onPressHistory={() => router.navigate('/settlements')} />
        </View>

        <OnDemandBanner onPress={() => router.navigate('/settlements')} />

        <QuickActions />

        <ExploreProducts onPressViewAll={navBar.openModules} onPressBanner={navBar.openModules} />
      </Animated.ScrollView>
      {pullIndicator}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 32 },
  area: { flex: 1 },
  cards: { gap: 16 },
});
