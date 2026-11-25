import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { AppIcon } from '@/components/icons';
import { PanelSheet, SHEET_BUTTON, SheetRow, SheetSection } from '@/components/shared/panel-sheet';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import type { MarketplaceAgent } from '@/data/agents';
import { AGENT_CREDIT_COST, creditCostLabel, formatCredits, spendCredits, useWallet } from '@/data/wallet';
import { useToast } from '@/hooks/use-toast';

import { agentStyles } from './agent-parts';
import { AgentThumbnail } from './agent-visuals';

/** One line above an agent's actions: what a run costs, and what's in the wallet (opens it). */
export function CreditCostLine({ agent }: { agent: MarketplaceAgent }) {
  const theme = useTheme();
  const { balance } = useWallet();
  return (
    <Pressable onPress={() => router.push('/agents/wallet')} accessibilityRole="button" accessibilityLabel={`Uses ${creditCostLabel(agent.id)}. ${formatCredits(balance)} credits left. Open wallet`} style={styles.line}>
      <AppIcon name="coins-fill" size={16} color={theme.colors.primary} />
      <Text style={[agentStyles.small, agentStyles.numbers, styles.lineText, { color: theme.colors.onSurfaceVariant }]}>
        Uses <Text style={{ fontFamily: Fonts.medium, color: theme.colors.onSurface }}>{creditCostLabel(agent.id)}</Text> · {formatCredits(balance)} left
      </Text>
      <AppIcon name="caret-right" size={14} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}

/**
 * Before an agent runs: what it will do, what it costs and what will be
 * left, then Start (spending the credits) — or Add credits when the balance
 * is short.
 */
export function RunAgentSheet({ agent, action, visible, onDismiss }: { agent: MarketplaceAgent; action: string; visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const toast = useToast();
  const { balance } = useWallet();
  const cost = AGENT_CREDIT_COST[agent.id].credits;
  const short = balance < cost;
  const start = () => {
    if (spendCredits(agent.id, agent.name, action, cost)) {
      toast(`${agent.name} started · ${cost} credits used`);
      onDismiss();
    }
  };
  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title={action}
      fit
      footer={
        short ? (
          <Button
            mode="contained"
            icon="plus"
            {...SHEET_BUTTON}
            onPress={() => {
              onDismiss();
              router.push('/agents/wallet');
            }}>
            Add credits
          </Button>
        ) : (
          <Button mode="contained" icon="coins" {...SHEET_BUTTON} onPress={start}>
            {`Start · ${cost} credits`}
          </Button>
        )
      }>
      <View style={styles.body}>
        <View style={styles.agent}>
          <AgentThumbnail agentId={agent.id} size={48} radius={concentric(Shape.max, 4)} glyphSize={22} />
          <View style={styles.flex}>
            <Text style={[agentStyles.title, { color: theme.colors.onSurface }]}>{agent.name}</Text>
            <Text numberOfLines={2} style={[agentStyles.body, { color: theme.colors.onSurfaceVariant }]}>
              {agent.cardDescription}
            </Text>
          </View>
        </View>
        <SheetSection label="Credits">
          <SheetRow first title="This run uses" trailing={<CostValue value={creditCostLabel(agent.id)} />} />
          <SheetRow title="Your balance" trailing={<CostValue value={`${formatCredits(balance)} credits`} />} />
          <SheetRow title="Left after" trailing={<CostValue value={short ? 'Not enough credits' : `${formatCredits(balance - cost)} credits`} strong tone={short ? 'danger' : undefined} />} />
        </SheetSection>
      </View>
    </PanelSheet>
  );
}

function CostValue({ value, strong = false, tone }: { value: string; strong?: boolean; tone?: 'danger' }) {
  const theme = useTheme();
  return <Text style={[strong ? agentStyles.medium : agentStyles.body, agentStyles.numbers, styles.value, { color: tone === 'danger' ? theme.colors.error : theme.colors.onSurface }]}>{value}</Text>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, paddingBottom: 8 },
  lineText: { flex: 1 },
  body: { padding: 16, gap: 16 },
  agent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  value: { paddingRight: 12 },
});

