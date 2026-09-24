import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TabChrome, useTabNavBar } from '@/components/app-tabs';
import { ExploreProducts } from '@/components/overview/explore-products';
import { OverviewGreeting } from '@/components/overview/overview-greeting';
import { QuickActions } from '@/components/overview/quick-actions';
import { TodayPaymentsCard } from '@/components/overview/today-payments-card';
import { TodaySettlementCard } from '@/components/overview/today-settlement-card';
import { CURRENT_USER } from '@/data/businesses';
import { CardCarousel } from '@/components/shared/card-carousel';
import { TODAY_PAYMENTS } from '@/data/overview';
import { useBusiness } from '@/hooks/use-business';

/**
 * Overview: the web Overview page (components/home/home-content.tsx) in mobile
 * form — greeting, today's payments and settlement (a swipeable row), Quick
 * actions (replacing the web's Analytics, user decision), and Explore
 * products. Every number follows the stores and channel chosen in the header
 * switcher; the page has no scope filters of its own.
 */
export default function OverviewScreen() {
  return (
    <TabChrome tab="index">
      <OverviewContent />
    </TabChrome>
  );
}

/** Inside TabChrome, so scrolling down can slide the navigation bar away. */
function OverviewContent() {
  const { storeScale, channelScale } = useBusiness();
  const scale = storeScale * channelScale;
  const navBar = useTabNavBar();

  return (
    <ScrollView
      onScroll={(event) => navBar.onScroll(event.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
      contentContainerStyle={[styles.content, { paddingBottom: 32 + navBar.height }]}>
      <OverviewGreeting userName={CURRENT_USER.name} />

      <View style={styles.cards}>
        <CardCarousel>
          <TodayPaymentsCard
            style={styles.fill}
            totalAmount={Math.round(TODAY_PAYMENTS.totalAmount * scale)}
            count={Math.max(0, Math.round(TODAY_PAYMENTS.count * scale))}
            failedCount={Math.max(0, Math.round(TODAY_PAYMENTS.failedCount * scale))}
            recent={TODAY_PAYMENTS.recent}
            onPressPayment={() => router.navigate('/payments')}
            onPressHistory={() => router.navigate('/payments')}
          />
          <TodaySettlementCard style={styles.fill} scale={scale} onPressHistory={() => router.navigate('/settlements')} />
        </CardCarousel>
      </View>

      <QuickActions />

      {/* Products live under More on mobile (the web links to /products). */}
      <ExploreProducts onPressViewAll={() => router.navigate('/more')} onPressBanner={() => router.navigate('/more')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Web spacing: 24px from the greeting to the cards, 64px between sections; halved-ish for a phone.
  content: { gap: 40, paddingHorizontal: 16, paddingTop: 20 },
  cards: { marginTop: -16 },
  fill: { flex: 1 },
});
