import { Animated, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { AgentThumbnail, HalftoneBackdrop, HeroShade } from '@/components/agents/agent-visuals';
import { concentric, Shape } from '@/constants/shape';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';

import { findApproval } from '@/data/agents';

import { FrostedChip, Stage, TapPulse, TypingDots } from './parts';
import { appear, at, pop, useStoryboard } from './storyboard';
import type { AgentUseCase } from './use-cases';

/** One loop of the scene, and the frame shown with Reduce Motion (the approved card). */
export const AGENTS_SCENE = { length: 6200, poster: 4300 };

const GREEN = '#16a34a';
const FADE_OUT = 5500;

/**
 * What an agent does, without words about it: it looks at what it needs (the
 * use case's signals, one by one), brings a case to you ready to approve,
 * and you approve it. The case is one of the agent's own pending approvals.
 */
export function AgentCaseScene({
  useCase,
  height,
  radius,
  playing = true,
  onEnd,
}: {
  useCase: AgentUseCase;
  height: number;
  radius: number;
  playing?: boolean;
  /** Play once and report the end (in a carousel); loops without it. */
  onEnd?: () => void;
}) {
  const theme = useTheme();
  const { t } = useStoryboard({ ...AGENTS_SCENE, playing, onEnd });
  const approval = findApproval(useCase.approvalId);
  const approveTap = 3500;
  return (
    <Stage
      height={height}
      radius={radius}
      background={
        <>
          <HalftoneBackdrop agentId={useCase.agentId} />
          <HeroShade />
        </>
      }>
      <View style={styles.content}>
        {/* The agent, at work until the case is ready. */}
        <Animated.View style={[styles.agent, appear(t, 0, FADE_OUT)]}>
          <AgentThumbnail agentId={useCase.agentId} size={32} radius={concentric(Shape.max, 4)} glyphSize={16} />
          <Text style={styles.agentName}>{useCase.agentName}</Text>
          <View style={styles.status}>
            <Animated.View style={[styles.statusLayer, { opacity: at(t, [0, 2300, 2500], [1, 1, 0]) }]}>
              <TypingDots t={t} start={200} end={2400} color="#ffffff" />
            </Animated.View>
            <Animated.View style={[styles.statusLayer, { opacity: at(t, [2300, 2500], [0, 1]) }]}>
              <Icon source="check-circle-fill" size={18} color="#ffffff" />
            </Animated.View>
          </View>
        </Animated.View>

        {/* What it looked at, one by one. */}
        <View style={styles.chips}>
          {useCase.signals.map((signal, index) => (
            <Animated.View key={signal.label} style={appear(t, 600 + index * 500, FADE_OUT)}>
              <FrostedChip icon={signal.icon} label={signal.label} />
            </Animated.View>
          ))}
        </View>

        {/* The case, ready for you, then approved. */}
        <Animated.View style={[styles.card, pop(t, 2400, FADE_OUT)]}>
          <View style={styles.cardTop}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {approval?.title}
            </Text>
            <Text numberOfLines={1} style={styles.cardLine}>
              {approval?.step}
            </Text>
          </View>
          <View style={styles.action}>
            <Animated.View style={[styles.button, { backgroundColor: theme.colors.primary, opacity: at(t, [3700, 3900], [1, 0]) }]}>
              <Text style={[styles.approveText, { color: theme.colors.onPrimary }]}>{approval?.actionLabel}</Text>
            </Animated.View>
            <Animated.View style={[styles.button, styles.done, { opacity: at(t, [3700, 3900], [0, 1]), transform: [{ scale: at(t, [3700, 3950, 4100], [0.9, 1.04, 1]) }] }]}>
              <Icon source="check-circle-fill" size={16} color={GREEN} />
              <Text numberOfLines={1} style={styles.doneText}>
                {useCase.done}
              </Text>
            </Animated.View>
            <TapPulse t={t} time={approveTap} color="#ffffff" size={56} />
          </View>
        </Animated.View>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  agent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  agentName: { flex: 1, fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, color: '#ffffff' },
  status: { width: 32, height: 20, alignItems: 'flex-end', justifyContent: 'center' },
  statusLayer: { position: 'absolute', right: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  card: { borderRadius: concentric(Shape.max, 4), padding: 12, gap: 12, backgroundColor: '#ffffff' },
  cardTop: { gap: 2 },
  cardTitle: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22, color: '#0c0c09', fontVariant: OPEN_DIGITS },
  cardLine: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: '#525252' },
  action: { height: 36 },
  button: { position: 'absolute', inset: 0, borderRadius: concentric(Shape.max, 12), alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  approveText: { fontFamily: Fonts.medium, fontSize: 14 },
  done: { backgroundColor: '#dcfce7', paddingHorizontal: 12 },
  doneText: { flexShrink: 1, fontFamily: Fonts.medium, fontSize: 14, color: GREEN },
});
