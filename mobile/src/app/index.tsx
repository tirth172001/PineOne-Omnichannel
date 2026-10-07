import { router } from 'expo-router';
import { Animated, StyleSheet } from 'react-native';

import { TabChrome, useTabNavBar, useTabScroll } from '@/components/app-tabs';
import { ExploreProducts } from '@/components/overview/explore-products';
import { OnDemandBanner } from '@/components/overview/on-demand-banner';
import { QuickActions } from '@/components/overview/quick-actions';
import { TodayPaymentsCard } from '@/components/overview/today-payments-card';
import { TodaySettlementCard } from '@/components/overview/today-settlement-card';
import { CardCarousel } from '@/components/shared/card-carousel';
import { CHANNEL_MULTIPLIER, TODAY_PAYMENTS } from '@/data/overview';
import { useBusiness } from '@/hooks/use-business';

/**
 * Overview (Figma 6470:676, "PineOne - Omni-channel"), top to bottom:
 * 1. Today's payments and today's settlement, as two cards side by side that
 *    swipe (the carousel).
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
  const count = Math.max(0, Math.round(TODAY_PAYMENTS.count * scale));
  // On all channels, the in-store share leads the latest payments (the design's first row).
  const inStore = channel === 'all' ? CHANNEL_MULTIPLIER['in-store'] : 0;

  return (
    <Animated.ScrollView
      {...tabScroll.scrollProps}
      contentContainerStyle={[styles.content, { paddingTop: tabScroll.contentTop + 24, paddingBottom: 32 + navBar.height }]}>
      {/* The two cards are the same height, the settlement card's amount section growing to fill it. */}
      <CardCarousel>
        <TodayPaymentsCard
          style={styles.fill}
          totalAmount={Math.round(TODAY_PAYMENTS.totalAmount * scale)}
          count={count}
          channel={
            inStore
              ? { label: 'In-store payments', count: Math.round(count * inStore), amount: Math.round(TODAY_PAYMENTS.totalAmount * scale * inStore) }
              : undefined
          }
          recent={inStore ? TODAY_PAYMENTS.recent.slice(0, 2) : TODAY_PAYMENTS.recent}
          onPressChannel={() => router.navigate('/payments')}
          onPressPayment={(transactionId) => router.push(`/payments/transactions/${transactionId}`)}
          onPressHistory={() => router.navigate('/payments')}
        />
        <TodaySettlementCard style={styles.fill} scale={scale} onPressHistory={() => router.navigate('/settlements')} />
      </CardCarousel>

      <OnDemandBanner onPress={() => router.navigate('/settlements')} />

      <QuickActions />

      <ExploreProducts onPressViewAll={navBar.openModules} onPressBanner={navBar.openModules} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 32 },
  fill: { flex: 1 },
});
