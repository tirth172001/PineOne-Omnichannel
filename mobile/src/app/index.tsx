import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AnalyticsSection } from '@/components/overview/analytics/analytics-section';
import { ExploreProducts } from '@/components/overview/explore-products';
import { OverviewGreeting } from '@/components/overview/overview-greeting';
import { TodayPaymentsCard } from '@/components/overview/today-payments-card';
import { TodaySettlementCard } from '@/components/overview/today-settlement-card';
import { CURRENT_USER } from '@/data/businesses';
import { CHANNEL_MULTIPLIER, type ChannelFilter, TODAY_PAYMENTS } from '@/data/overview';
import { useBusiness } from '@/hooks/use-business';

/**
 * Overview: the web Overview page (components/home/home-content.tsx) in mobile
 * form — greeting with store and channel scope, today's payments and
 * settlement, Analytics, and Explore products, in the web's order. Every
 * number follows the store selection (shared with the header switcher) and the
 * channel filter.
 */
export default function OverviewScreen() {
  const theme = useTheme();
  const { storeScale } = useBusiness();
  const [channel, setChannel] = useState<ChannelFilter>('all');
  const channelScale = CHANNEL_MULTIPLIER[channel];
  const scale = storeScale * channelScale;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <OverviewGreeting
          userName={CURRENT_USER.name}
          roleLabel={CURRENT_USER.roleLabel}
          channel={channel}
          onChannelChange={setChannel}
        />

        <View style={styles.cards}>
          <TodayPaymentsCard
            totalAmount={Math.round(TODAY_PAYMENTS.totalAmount * scale)}
            count={Math.max(0, Math.round(TODAY_PAYMENTS.count * scale))}
            failedCount={Math.max(0, Math.round(TODAY_PAYMENTS.failedCount * scale))}
            recent={TODAY_PAYMENTS.recent}
            onPressPayment={() => router.navigate('/payments?tab=transactions')}
            onPressHistory={() => router.navigate('/payments?tab=transactions')}
          />
          <TodaySettlementCard scale={scale} onPressHistory={() => router.navigate('/payments?tab=settlements')} />
        </View>

        <AnalyticsSection storeScale={storeScale} channelScale={channelScale} />

        {/* Products live under More on mobile (the web links to /products). */}
        <ExploreProducts onPressViewAll={() => router.navigate('/more')} onPressBanner={() => router.navigate('/more')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Web spacing: 24px from the greeting to the cards, 64px between sections; halved-ish for a phone.
  content: { gap: 40, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  cards: { gap: 16, marginTop: -16 },
});
