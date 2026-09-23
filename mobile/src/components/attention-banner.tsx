import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner, Text } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

type AttentionBannerProps = {
  title: string;
  description: string;
  ctaLabel: string;
  onPressCta?: () => void;
};

/**
 * Dismissible attention banner — Paper's Banner (Material 3), a mobile port of
 * components/home/attention-strip.tsx, reusing its real copy. Material 3's Banner
 * spec uses text actions (Dismiss + the CTA) rather than a corner close icon.
 */
export function AttentionBanner({ title, description, ctaLabel, onPressCta }: AttentionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <Banner
      visible={!dismissed}
      icon="credit-card"
      style={styles.banner}
      actions={[
        { label: 'Dismiss', onPress: () => setDismissed(true), style: styles.action },
        { label: ctaLabel, onPress: onPressCta, style: styles.action },
      ]}>
      <View>
        <Text variant="titleSmall">{title}</Text>
        <Text variant="bodySmall">{description}</Text>
      </View>
    </Banner>
  );
}

// Paper's Banner insets its action buttons 8dp (4dp row margin + 4dp button margin).
const ACTION_GAP = 8;

const styles = StyleSheet.create({
  banner: { borderRadius: Shape.max },
  action: { margin: 4, borderRadius: concentric(Shape.max, ACTION_GAP, 40) },
});
