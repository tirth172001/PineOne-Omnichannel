import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, View } from 'react-native';

import { TabChrome, useTabHeroCollapse, useTabNavBar, useTabScroll } from '@/components/app-tabs';
import { AttentionStrip } from '@/components/overview/attention-strip';
import { ExploreProducts } from '@/components/overview/explore-products';
import { LatestPayments } from '@/components/overview/latest-payments';
import { QuickActions } from '@/components/overview/quick-actions';
import { SalesHero } from '@/components/overview/sales-hero';
import { SETTLEMENT_TODAY, TODAY_PAYMENTS } from '@/data/overview';
import { useBusiness } from '@/hooks/use-business';

/**
 * Overview, sales first (docs/design/mobile-home-reference-analysis.md,
 * variant A, user decisions). One place for the eye to go, in order:
 * 1. What's blocking money, as a compact sideways row at the top — only when
 *    something is (the happy view has none; preview it with ?view=happy).
 * 2. The hero, centred with the most room on the page: collected today, and
 *    when it reaches the bank.
 * 3. Latest payments, right under it: what today's collections are made of.
 * 4. Quick actions, then Explore products, set well apart.
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
  const { storeScale, channelScale, channel, scopeText } = useBusiness();
  const scale = storeScale * channelScale;
  const navBar = useTabNavBar();
  const tabScroll = useTabScroll();
  const heroCollapse = useTabHeroCollapse();
  const settlement = SETTLEMENT_TODAY.pinelabs;
  // Prototype review: the mock data always has something blocked, so ?view=happy shows the all-clear page.
  const { view } = useLocalSearchParams<{ view?: string }>();

  return (
    <Animated.ScrollView
      {...tabScroll.scrollProps}
      contentContainerStyle={[styles.content, { paddingTop: tabScroll.contentTop + 8, paddingBottom: 32 + navBar.height }]}>
      {view === 'happy' ? null : <AttentionStrip channel={channel} />}

      <SalesHero
        collected={Math.round(TODAY_PAYMENTS.totalAmount * scale)}
        count={Math.max(0, Math.round(TODAY_PAYMENTS.count * scale))}
        failedCount={Math.max(0, Math.round(TODAY_PAYMENTS.failedCount * scale))}
        settling={settlement.pendingAmount * scale}
        nextSettlement={settlement.nextSettlement}
        scope={scopeText(true)}
        onPressSettlement={() => router.navigate('/settlements')}
        style={heroCollapse.style}
        onLayout={heroCollapse.onLayout}
      />

      <LatestPayments
        payments={TODAY_PAYMENTS.recent}
        onPressPayment={(payment) => router.push(`/payments/transactions/${payment.transactionId}`)}
        onPressAll={() => router.navigate('/payments')}
      />

      <View style={styles.sectionBreak} />

      <QuickActions />

      {/* The promotion is set furthest apart: equal gaps would say it matters as much as the sections above. */}
      <View style={styles.promotionBreak} />

      <ExploreProducts onPressViewAll={navBar.openModules} onPressBanner={navBar.openModules} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  // Spacing sets the hierarchy: 8dp under the alerts, the hero's own 40dp above and below, 48dp between the lower sections, 72dp before the promotion.
  content: { paddingHorizontal: 16 },
  sectionBreak: { height: 48 },
  promotionBreak: { height: 72 },
});
