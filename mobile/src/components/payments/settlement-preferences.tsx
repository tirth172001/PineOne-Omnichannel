import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Icon, Switch, Text, useTheme } from 'react-native-paper';

import { Tabs } from '@/components/material3/tabs';
import { BankLogo } from '@/components/shared/bank-logo';
import { DetailScreen } from '@/components/shared/detail-screen';
import { OutlineTag } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { SETTLEMENT_ACCOUNTS } from '@/data/settlements';

type Marker = 'pending' | 'done' | 'skipped';
const MARKER: Record<Marker, { icon: string; color: string }> = {
  pending: { icon: 'circle', color: '#3b82f6' },
  done: { icon: 'check-circle-fill', color: '#10b981' },
  skipped: { icon: 'circle-dashed', color: '#737373' },
};

const EXAMPLES: { title: string; steps: { marker: Marker; title: string; subtitle: string }[] }[] = [
  {
    title: 'Settlement cycle example',
    steps: [
      { marker: 'pending', title: 'Transaction captured (T+0)', subtitle: 'Captured before 6:00 PM' },
      { marker: 'done', title: 'Settled on next working day (T+1)', subtitle: 'By 8:00 PM' },
    ],
  },
  {
    title: 'Bank holiday example',
    steps: [
      { marker: 'pending', title: 'Transaction captured (T+0)', subtitle: 'Captured before 6:00 PM' },
      { marker: 'skipped', title: 'Bank holiday on next day', subtitle: 'Day will be skipped' },
      { marker: 'done', title: 'Settled on next working day', subtitle: 'By 8:00 PM' },
    ],
  },
];

const CARD_PADDING = 16;
const INNER_RADIUS = concentric(Shape.max, CARD_PADDING);

/**
 * Settlement preferences (web: V3SettlementPreferencesContent): the scope
 * (stores · channel, switchable) under the title, Settlement cycle and Settlement account tabs, the
 * weekend-settlement switch and T+1 default cycle, the worked timeline
 * examples, and the settlement accounts. The web's horizontal example
 * timelines run vertically on a phone.
 */
export function SettlementPreferences() {
  const theme = useTheme();
  const [weekend, setWeekend] = useState(false);
  const [tab, setTab] = useState<'settlement-cycle' | 'settlement-account'>('settlement-cycle');
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <DetailScreen title="Settlement preferences" fallbackHref="/payments?tab=settlements" scoped>

      <Tabs
        variant="secondary"
        tabs={[
          { key: 'settlement-cycle', label: 'Settlement cycle' },
          { key: 'settlement-account', label: 'Settlement account' },
        ]}
        activeKey={tab}
        onChange={(key) => setTab(key as typeof tab)}
        indicatorColor={theme.colors.onSurface}
        style={styles.tabs}
      />

      {tab === 'settlement-cycle' ? (
        <View style={styles.block}>
          <Card mode="outlined" style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            {/* Web: bg-gradient-to-r from-teal-50. */}
            <View style={[styles.cardRow, styles.weekend]}>
              <Icon source="calendar-check-fill" size={24} color="#0d9488" />
              <View style={styles.flex}>
                <Text variant="titleMedium">Enable weekend settlement</Text>
                <Text variant="bodyMedium" style={[styles.regular, muted]}>
                  Amount will be settled over the weekends as well
                </Text>
              </View>
              <Switch value={weekend} onValueChange={setWeekend} />
            </View>
            <Divider />
            <View style={styles.cardRow}>
              <Icon source="arrows-counter-clockwise" size={24} color={theme.colors.onSurfaceVariant} />
              <View style={styles.flex}>
                <View style={styles.inline}>
                  <Text variant="titleMedium">T+1 settlement</Text>
                  <OutlineTag label="Default cycle" muted radius={INNER_RADIUS} />
                </View>
                <Text variant="bodyMedium" style={[styles.regular, muted]}>
                  Captured transaction are picked up for the settlement on the next working day
                </Text>
              </View>
            </View>
          </Card>

          <View style={[styles.examples, { backgroundColor: theme.colors.surfaceVariant }]}>
            {EXAMPLES.map((example, exampleIndex) => (
              <View key={example.title} style={styles.example}>
                <Text variant="titleMedium" style={styles.semiBold}>
                  {exampleIndex + 1}. {example.title}
                </Text>
                {example.steps.map((step, index) => (
                  <View key={step.title} style={styles.step}>
                    <View style={styles.stepRail}>
                      <Icon source={MARKER[step.marker].icon} size={16} color={MARKER[step.marker].color} />
                      {index < example.steps.length - 1 ? <View style={[styles.stepLine, { backgroundColor: theme.colors.outlineVariant }]} /> : null}
                    </View>
                    <View style={styles.stepText}>
                      <Text variant="bodyMedium" style={styles.medium}>
                        {step.title}
                      </Text>
                      <Text variant="bodyMedium" style={[styles.regular, muted]}>
                        {step.subtitle}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.accounts}>
          {SETTLEMENT_ACCOUNTS.map((account, index) => (
            <Card
              key={index}
              mode="outlined"
              style={[styles.card, styles.account, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <View style={styles.accountTop}>
                <BankLogo bank={account.bank} size={32} />
                <Button mode="text" compact icon="pencil-simple" style={styles.update} labelStyle={styles.updateLabel}>
                  Update details
                </Button>
              </View>
              <Text variant="bodyMedium" style={styles.medium}>
                {account.bankName}
              </Text>
              <Text variant="bodyMedium" style={[styles.regular, muted]}>
                {account.accountNumber}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { backgroundColor: 'transparent', marginHorizontal: -16 },
  block: { gap: 16 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: CARD_PADDING },
  weekend: { backgroundColor: '#f0fdfa' },
  flex: { flex: 1, gap: 4 },
  inline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  regular: { fontFamily: Fonts.regular },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  examples: { borderRadius: Shape.max, padding: 20, gap: 24 },
  example: { gap: 12 },
  step: { flexDirection: 'row', gap: 12 },
  stepRail: { alignItems: 'center', width: 24, paddingTop: 2 },
  stepLine: { width: 1, flex: 1, marginTop: 4, minHeight: 16 },
  stepText: { flex: 1, gap: 2, paddingBottom: 12 },
  accounts: { gap: 12 },
  account: { padding: CARD_PADDING, gap: 4 },
  accountTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  update: { margin: 0, borderRadius: INNER_RADIUS },
  updateLabel: { fontSize: 12, marginVertical: 2 },
});
