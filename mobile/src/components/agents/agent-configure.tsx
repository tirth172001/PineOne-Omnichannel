import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { FooterButton } from '@/components/profile/profile-ui';
import { DetailScreen } from '@/components/shared/detail-screen';
import { PanelSheet, SheetRow, SheetSection } from '@/components/shared/panel-sheet';
import { PAGE_PADDING } from '@/components/tab-screen';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import { DELIVERY, PAYMENT_METHODS, scheduleTask, TASK_CONFIG, useScheduledTasks } from '@/data/agent-tasks';
import type { MarketplaceAgent } from '@/data/agents';
import { creditCostLabel, formatCredits, useWallet } from '@/data/wallet';
import { useBusiness } from '@/hooks/use-business';
import { useToast } from '@/hooks/use-toast';

import { AgentThumbnail } from './agent-visuals';

const todayLabel = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Configure task (web: Pine AI's task builder): what the agent watches and
 * when, in the app's preference cards — stores, the agent's own choice
 * (send time, sensitivity or active hours), payment methods where it reads
 * them, and where results go — then what a run costs. Schedule task saves it
 * to Scheduled tasks; credits are used as it runs.
 */
export function AgentConfigure({ agent }: { agent: MarketplaceAgent }) {
  const theme = useTheme();
  const toast = useToast();
  const { organisation } = useBusiness();
  const { balance } = useWallet();
  const config = TASK_CONFIG[agent.id];
  const [stores, setStores] = useState<string[]>(organisation.shops.map((shop) => shop.id));
  const [choices, setChoices] = useState<Record<string, string>>(() => Object.fromEntries((config?.choices ?? []).map((choice) => [choice.key, choice.initial])));
  const [methods, setMethods] = useState<string[]>(PAYMENT_METHODS);
  const [whatsApp, setWhatsApp] = useState(false);
  if (!config) return null;

  const allStores = stores.length === organisation.shops.length;
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const ready = stores.length > 0 && (!config.methods || methods.length > 0);
  const summary = [
    allStores ? 'All stores' : stores.length === 1 ? organisation.shops.find((shop) => shop.id === stores[0])?.name : `${stores.length} stores`,
    ...Object.values(choices),
    whatsApp ? 'Guide and WhatsApp' : 'Guide',
  ].join(' · ');
  const schedule = () => {
    scheduleTask({ agentId: agent.id, title: config.noun, summary, created: todayLabel() });
    toast(`${config.noun} scheduled · ${creditCostLabel(agent.id)}`);
    router.back();
  };

  return (
    <DetailScreen title="Configure task" fallbackHref={`/agents/${agent.id}`} footer={<FooterButton label="Schedule task" onPress={schedule} disabled={!ready} />}>
      <View style={styles.stack}>
        <View style={[styles.agent, { backgroundColor: theme.colors.surface }]}>
          <AgentThumbnail agentId={agent.id} size={40} radius={8} glyphSize={18} />
          <View style={styles.flex}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{agent.name}</Text>
            <Text style={[styles.small, { color: theme.colors.onSurfaceVariant }]}>{config.trigger ?? config.noun}</Text>
          </View>
        </View>

        <SheetSection label="Stores" trailing={allStores ? 'All' : `${stores.length} of ${organisation.shops.length}`}>
          {organisation.shops.map((shop, index) => (
            <SheetRow key={shop.id} first={index === 0} title={shop.name} role="checkbox" selected={stores.includes(shop.id)} onPress={() => setStores((current) => toggle(current, shop.id))} />
          ))}
        </SheetSection>

        {config.choices.map((choice) => (
          <SheetSection key={choice.key} label={choice.label}>
            {choice.options.map((option, index) => (
              <SheetRow
                key={option}
                first={index === 0}
                title={option}
                role="radio"
                selected={choices[choice.key] === option}
                onPress={() => setChoices((current) => ({ ...current, [choice.key]: option }))}
              />
            ))}
          </SheetSection>
        ))}

        {config.methods ? (
          <SheetSection label="Payment methods">
            {PAYMENT_METHODS.map((method, index) => (
              <SheetRow key={method} first={index === 0} title={method} role="checkbox" selected={methods.includes(method)} onPress={() => setMethods((current) => toggle(current, method))} />
            ))}
          </SheetSection>
        ) : null}

        <SheetSection label="Send results to">
          <SheetRow first title={DELIVERY[0]} description="Always, in your Guide chat" trailing={<Switch value disabled />} />
          <SheetRow title={DELIVERY[1]} description="To you and your store managers" trailing={<Switch value={whatsApp} onValueChange={setWhatsApp} />} />
        </SheetSection>

        <SheetSection label="Credits">
          <SheetRow first title="Each run uses" trailing={<Text style={[styles.value, { color: theme.colors.onSurface }]}>{creditCostLabel(agent.id)}</Text>} />
          <SheetRow title="Your balance" trailing={<Text style={[styles.value, { color: theme.colors.onSurface }]}>{formatCredits(balance)} credits</Text>} />
        </SheetSection>
      </View>
    </DetailScreen>
  );
}

/** Scheduled tasks for an agent (its secondary action), newest first. */
export function ScheduledTasksSheet({ agent, visible, onDismiss }: { agent: MarketplaceAgent; visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const tasks = useScheduledTasks(agent.id);
  return (
    <PanelSheet visible={visible} onDismiss={onDismiss} title="Scheduled tasks" fit>
      <View style={styles.sheetBody}>
        {tasks.length ? (
          <SheetSection label={agent.name}>
            {tasks.map((task, index) => (
              <SheetRow key={task.id} first={index === 0} icon="calendar-check" title={task.title} description={`${task.summary} · since ${task.created}`} />
            ))}
          </SheetSection>
        ) : (
          <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>Nothing scheduled yet. Configure a task to set one up.</Text>
        )}
      </View>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16, marginTop: PAGE_PADDING },
  agent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12 },
  title: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  value: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, fontVariant: OPEN_DIGITS, paddingRight: 12 },
  sheetBody: { padding: 16, gap: 12 },
  empty: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, textAlign: 'center', paddingVertical: 24 },
});
