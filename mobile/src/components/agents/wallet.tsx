import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppIcon } from '@/components/icons';
import { FooterButton } from '@/components/profile/profile-ui';
import { CompactSegmentedButtons } from '@/components/shared/controls';
import { DetailScreen } from '@/components/shared/detail-screen';
import { useSvgId } from '@/components/shared/hatch';
import { PAGE_PADDING } from '@/components/tab-screen';
import { useAppColors } from '@/constants/app-colors';
import { concentric, Shape } from '@/constants/shape';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import { addCredits, CREDIT_PACKS, formatCredits, type LedgerEntry, RUPEES_PER_CREDIT, useWallet } from '@/data/wallet';
import { useToast } from '@/hooks/use-toast';

import { agentStyles } from './agent-parts';
import { AgentThumbnail } from './agent-visuals';

const COINS = require('../../../assets/images/overview/today-settlement.png');

type HistoryFilter = 'all' | 'used' | 'added';
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'used', label: 'Used' },
  { value: 'added', label: 'Added' },
] as const;

/**
 * The agent credits wallet (/agents/wallet): the balance as a wallet card,
 * Add credits (packs), then History, a ledger of what each agent used and
 * the credits added, by day.
 */
export function AgentWallet() {
  const theme = useTheme();
  const toast = useToast();
  const { balance, ledger, usedToday } = useWallet();
  const [pack, setPack] = useState<number>(CREDIT_PACKS[1]);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const rows = ledger.filter((entry) => filter === 'all' || (filter === 'used' ? entry.credits < 0 : entry.credits > 0));
  const days = [...new Set(rows.map((entry) => entry.day))];
  const add = () => {
    addCredits(pack);
    toast(`${formatCredits(pack)} credits added`);
  };

  return (
    <DetailScreen
      title="Wallet"
      fallbackHref="/agents"
      footer={<FooterButton label={`Add ${formatCredits(pack)} credits · ₹${(pack * RUPEES_PER_CREDIT).toLocaleString('en-IN')}`} icon="plus" onPress={add} />}>
      <View style={styles.stack}>
        <WalletCard balance={balance} usedToday={usedToday} />

        <View style={[agentStyles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.heading}>
            <Text style={[agentStyles.title, { color: theme.colors.onSurface }]}>Add credits</Text>
            <Text style={[agentStyles.small, { color: theme.colors.onSurfaceVariant }]}>1 credit = ₹{RUPEES_PER_CREDIT}</Text>
          </View>
          <View style={styles.packs}>
            {CREDIT_PACKS.map((credits) => (
              <PackOption key={credits} credits={credits} selected={credits === pack} onPress={() => setPack(credits)} />
            ))}
          </View>
          <Text style={[agentStyles.small, { color: theme.colors.onSurfaceVariant }]}>Agents use credits each time they run. Credits don’t expire.</Text>
        </View>

        <View style={[agentStyles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.heading}>
            <Text style={[agentStyles.title, { color: theme.colors.onSurface }]}>History</Text>
            <CompactSegmentedButtons value={filter} onValueChange={setFilter} options={FILTERS} radius={concentric(Shape.max, 12)} />
          </View>
          {days.map((day) => (
            <View key={day} style={styles.day}>
              <Text style={[styles.dayLabel, { color: theme.colors.onSurfaceVariant }]}>{day.toUpperCase()}</Text>
              {rows
                .filter((entry) => entry.day === day)
                .map((entry) => (
                  <LedgerRow key={entry.id} entry={entry} />
                ))}
            </View>
          ))}
        </View>
      </View>
    </DetailScreen>
  );
}

/** The balance as a wallet: a deep green card with the coins, credits large, their rupee value and today's use. */
function WalletCard({ balance, usedToday }: { balance: number; usedToday: number }) {
  const id = useSvgId('wallet-card');
  return (
    <View style={styles.wallet} accessible accessibilityLabel={`${formatCredits(balance)} agent credits. ${usedToday} used today.`}>
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset={0} stopColor="#365314" />
              <Stop offset={0.6} stopColor="#1a2e05" />
              <Stop offset={1} stopColor="#0f1a03" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </View>
      <Image source={COINS} style={styles.coins} contentFit="contain" />
      <View style={styles.walletBody}>
        <View style={styles.walletLabel}>
          <AppIcon name="coins-fill" size={16} color="#d9f99d" />
          <Text style={styles.walletLabelText}>Agent credits</Text>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balance}>{formatCredits(balance)}</Text>
          <Text style={styles.balanceUnit}>credits</Text>
        </View>
        <Text style={styles.walletLine}>≈ ₹{(balance * RUPEES_PER_CREDIT).toLocaleString('en-IN')}</Text>
      </View>
      <View style={styles.walletFoot}>
        <Text style={styles.walletLine}>Used today</Text>
        <Text style={[styles.walletLine, styles.walletStrong]}>{usedToday} credits</Text>
      </View>
    </View>
  );
}

function PackOption({ credits, selected, onPress }: { credits: number; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  const colors = useAppColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${formatCredits(credits)} credits for ₹${credits * RUPEES_PER_CREDIT}`}
      style={[
        styles.pack,
        { borderColor: selected ? colors.highlightBorder : theme.colors.outlineVariant, backgroundColor: selected ? colors.highlight : theme.colors.surface },
      ]}>
      <View style={styles.packTop}>
        <AppIcon name="coins-fill" size={14} color={theme.colors.primary} />
        <Text style={[styles.packCredits, { color: theme.colors.onSurface }]}>{formatCredits(credits)}</Text>
      </View>
      <Text style={[agentStyles.small, agentStyles.numbers, { color: theme.colors.onSurfaceVariant }]}>₹{(credits * RUPEES_PER_CREDIT).toLocaleString('en-IN')}</Text>
    </Pressable>
  );
}

/** A ledger line: the agent (or a top-up), what it did, when, and the credits. */
function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const theme = useTheme();
  const colors = useAppColors();
  const added = entry.credits > 0;
  return (
    <View style={styles.row} accessible accessibilityLabel={`${entry.title}, ${entry.detail}, ${entry.time}, ${added ? 'added' : 'used'} ${formatCredits(entry.credits)} credits`}>
      {entry.agentId ? (
        <AgentThumbnail agentId={entry.agentId} size={40} radius={concentric(Shape.max, 4)} glyphSize={18} />
      ) : (
        <View style={[styles.topUp, { backgroundColor: colors.highlight }]}>
          <AppIcon name="arrow-down-left" size={18} color={theme.colors.primary} />
        </View>
      )}
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={[agentStyles.medium, { color: theme.colors.onSurface }]}>
          {entry.title}
        </Text>
        <Text numberOfLines={1} style={[agentStyles.small, agentStyles.numbers, { color: theme.colors.onSurfaceVariant }]}>
          {entry.detail} · {entry.time}
        </Text>
      </View>
      <Text style={[styles.amount, { color: added ? (theme.dark ? '#4ade80' : '#16a34a') : theme.colors.onSurface }]}>
        {added ? '+' : '−'}
        {formatCredits(entry.credits)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 8, marginTop: PAGE_PADDING },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  wallet: { borderRadius: Shape.max, overflow: 'hidden', minHeight: 184, padding: 20, justifyContent: 'space-between' },
  coins: { position: 'absolute', right: -6, top: 14, width: 132, height: 132 },
  walletBody: { position: 'relative', gap: 4 },
  walletLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletLabelText: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18, color: '#d9f99d' },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  balance: { fontFamily: Fonts.semiBold, fontSize: 40, lineHeight: 46, color: '#ffffff', fontVariant: OPEN_DIGITS },
  balanceUnit: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22, color: 'rgba(255, 255, 255, 0.75)' },
  walletLine: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: 'rgba(255, 255, 255, 0.75)', fontVariant: OPEN_DIGITS },
  walletStrong: { fontFamily: Fonts.medium, color: '#ffffff' },
  walletFoot: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  packs: { flexDirection: 'row', gap: 8 },
  pack: { flex: 1, gap: 2, padding: 12, borderRadius: concentric(Shape.max, 12, 64), borderWidth: 1 },
  packTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  packCredits: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22, fontVariant: OPEN_DIGITS },
  day: { gap: 12 },
  dayLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  topUp: { width: 40, height: 40, borderRadius: concentric(Shape.max, 4), alignItems: 'center', justifyContent: 'center' },
  amount: { fontFamily: Fonts.semiBold, fontSize: 15, lineHeight: 20, fontVariant: OPEN_DIGITS },
});
