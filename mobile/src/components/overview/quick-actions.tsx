import { type Href, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { OutlinedActionButton } from '@/components/shared/controls';
import { Fonts } from '@/constants/theme';

type QuickAction = { key: string; label: string; icon: string; href: () => Href };

/**
 * Overview's quick actions (docs/design/mobile-home-hierarchy-audit.md §7,
 * option D, user decision): the everyday jobs as labelled chips — a verb and
 * its object, so none needs guessing — the same chips the listing pages use
 * for their actions, wrapping so all three are always in view. Light on
 * purpose: they sit below the hero and the latest payments. No "More": the
 * nav bar already has it.
 */
export function QuickActions() {
  const actions: QuickAction[] = [
    // Timestamps make each tap a new request, so the flow opens even if the screen is already mounted.
    { key: 'link', label: 'Create payment link', icon: 'link-simple', href: () => ({ pathname: '/payment-links', params: { create: '1' } }) },
    // Refunds start from a payment: opens Payments on successful payments with a "pick the payment to refund" hint.
    { key: 'refund', label: 'Refund a payment', icon: 'arrow-u-up-left', href: () => ({ pathname: '/payments', params: { intent: 'refund', search: String(Date.now()) } }) },
    { key: 'report', label: 'Download a report', icon: 'download-simple', href: () => ({ pathname: '/reports', params: { generate: String(Date.now()) } }) },
  ];

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.title} accessibilityRole="header">
        Quick actions
      </Text>
      <View style={styles.row}>
        {actions.map((action) => (
          <OutlinedActionButton key={action.key} label={action.label} icon={action.icon} onPress={() => router.push(action.href())} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  title: { fontFamily: Fonts.semiBold },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
