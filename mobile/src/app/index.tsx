import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, View } from 'react-native';

import { TabChrome, useTabHeroCollapse, useTabNavBar, useTabScroll } from '@/components/app-tabs';
import { AttentionStrip } from '@/components/overview/attention-strip';
import { ExploreProducts } from '@/components/overview/explore-products';
import { QuickActions } from '@/components/overview/quick-actions';
import { TodayPaymentsCard } from '@/components/overview/today-payments-card';
import { TodaySettlementCard } from '@/components/overview/today-settlement-card';
import { CardCarousel } from '@/components/shared/card-carousel';
import { TODAY_PAYMENTS } from '@/data/overview';
import { useBusiness } from '@/hooks/use-business';

/**
 * Overview, sales first (docs/design/mobile-home-reference-analysis.md,
 * variant A, user decisions). One place for the eye to go, in order:
 * 1. What's blocking money, as a compact sideways row at the top — only when
 *    something is (the happy view has none; preview it with ?view=happy).
 * 2. Today's payments and today's settlement, as two cards side by side that
 *    swipe (the carousel).
 * 3. Quick actions, then Explore products, set well apart.
 * Every number follows the stores and channel chosen in the header switcher;
 * the page has no scope filters of its own.
 */
export default function OverviewScreen() {
  return (
    <TabChrome tab="index">
      <OverviewContent />
    </TabChrome>
  );
}

/** Inside TabChrome, so scrolling can collapse the hero into the header and slide the navigation bar away. */
function OverviewContent() {
  const { storeScale, channelScale, channel } = useBusiness();
  const scale = storeScale * channelScale;
  const navBar = useTabNavBar();
  const tabScroll = useTabScroll();
  const heroCollapse = useTabHeroCollapse();
  // Prototype review: the mock data always has something blocked, so ?view=happy shows the all-clear page.
  const { view } = useLocalSearchParams<{ view?: string }>();

  return (
    <Animated.ScrollView
      {...tabScroll.scrollProps}
      contentContainerStyle={[styles.content, { paddingTop: tabScroll.contentTop + 8, paddingBottom: 32 + navBar.height }]}>
      {view === 'happy' ? null : <AttentionStrip channel={channel} />}

      {/* Today's payments and settlement as a swipeable pair of cards (user decision: back from the single hero),
          the same height, with the settlement card's amount section growing to fill it. Measured as the page's "hero" so the header's small title comes in once
          they've scrolled away. */}
      <View onLayout={heroCollapse.onLayout} style={styles.cards}>
        <CardCarousel>
          <TodayPaymentsCard
            style={styles.fill}
            totalAmount={Math.round(TODAY_PAYMENTS.totalAmount * scale)}
            count={Math.max(0, Math.round(TODAY_PAYMENTS.count * scale))}
            failedCount={Math.max(0, Math.round(TODAY_PAYMENTS.failedCount * scale))}
            recent={TODAY_PAYMENTS.recent}
            onPressPayment={(transactionId) => router.push(`/payments/transactions/${transactionId}`)}
            onPressHistory={() => router.navigate('/payments')}
          />
          <TodaySettlementCard style={styles.fill} scale={scale} onPressHistory={() => router.navigate('/settlements')} />
        </CardCarousel>
      </View>

      <QuickActions />

      {/* The promotion is set furthest apart: equal gaps would say it matters as much as the sections above. */}
      <View style={styles.promotionBreak} />

      <ExploreProducts onPressViewAll={navBar.openModules} onPressBanner={navBar.openModules} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  // Spacing sets the hierarchy: 8dp under the alerts, 16dp above the cards and 40dp below, 48dp between the lower sections, 72dp before the promotion.
  content: { paddingHorizontal: 16 },
  // The alerts sit 8dp above; the cards get room of their own before the next section.
  cards: { marginTop: 16, marginBottom: 40 },
  fill: { flex: 1 },
  sectionBreak: { height: 48 },
  promotionBreak: { height: 72 },
});
