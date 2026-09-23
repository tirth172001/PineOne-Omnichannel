import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CHART_ACCENT_COLOR, formatCount, type FunnelStage } from '@/data/overview';

import { HatchedFill } from '@/components/shared/hatch';

const BAR_HEIGHT = 16;

type CheckoutFunnelProps = {
  stages: FunnelStage[];
  overallConversion: number;
  base: number;
};

/**
 * Checkout funnel (web: CheckoutFunnelCard): six checkout steps with their
 * user counts and step-to-step conversion, the drop-off between steps, and the
 * overall conversion. The web lays the steps out as columns over a horizontal
 * funnel silhouette; on a phone they stack, and centred hatched bars sized to
 * each step's count draw the same funnel vertically.
 */
export function CheckoutFunnel({ stages, overallConversion, base }: CheckoutFunnelProps) {
  const theme = useTheme();
  const maxCount = Math.max(stages[0]?.count ?? 1, 1);
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <View style={styles.container}>
      {stages.map((stage) => (
        <Fragment key={stage.label}>
          <View style={styles.stage} accessible accessibilityLabel={`${stage.label}: ${formatCount(stage.count)} users`}>
            <View style={styles.stageHeader}>
              <Text variant="labelMedium" style={[styles.stageLabel, muted]}>
                {stage.label.toUpperCase()}
              </Text>
              {stage.conversionLabel ? (
                <Text variant="labelMedium" style={[styles.regular, muted]}>
                  {stage.conversionLabel}
                </Text>
              ) : null}
            </View>
            <View style={styles.countRow}>
              <Text style={styles.count}>{formatCount(stage.count)}</Text>
              <Text variant="bodyMedium" style={[styles.regular, muted]}>
                Users
              </Text>
            </View>
            <View style={styles.barRow}>
              <View style={[styles.bar, { width: `${Math.max(4, (stage.count / maxCount) * 100)}%` }]}>
                <HatchedFill color={CHART_ACCENT_COLOR} />
              </View>
            </View>
          </View>

          {stage.dropOff ? (
            <View style={styles.transition}>
              <Icon source="arrow-down" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelMedium" style={muted}>
                DROP OFF
              </Text>
              <Text variant="bodyMedium" style={styles.transitionValue}>
                {stage.dropOff.percent}%{' '}
                <Text style={[styles.regular, muted]}>of {formatCount(stage.dropOff.of)}</Text>
              </Text>
            </View>
          ) : null}
        </Fragment>
      ))}

      <View style={[styles.conversion, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text variant="labelMedium" style={muted}>
          CONVERSION
        </Text>
        <Text variant="bodyMedium" style={styles.transitionValue}>
          {overallConversion}% <Text style={[styles.regular, muted]}>of {formatCount(base)}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },
  stage: { gap: 6 },
  stageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  stageLabel: { letterSpacing: 0.6 },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  count: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 26, fontVariant: ['tabular-nums'] },
  regular: { fontFamily: Fonts.regular },
  barRow: { alignItems: 'center' },
  // Data mark, not a container: minimum radius.
  bar: { height: BAR_HEIGHT, borderRadius: Shape.extraSmall, overflow: 'hidden' },
  transition: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingLeft: 2 },
  transitionValue: { fontFamily: Fonts.semiBold },
  // Sits 16dp inside the card (padding): concentric with its 12dp corners → 4dp.
  conversion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 12,
    borderRadius: Shape.extraSmall,
  },
});
