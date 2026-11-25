import { Animated, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LocalSvg } from 'react-native-svg/css';

import { LimeGlow } from '@/components/shared/lime-glow';
import { concentric, Shape } from '@/constants/shape';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';

import { Bubble, Stage, TypingDots } from './parts';
import { pop, useStoryboard } from './storyboard';
import type { GuideUseCase } from './use-cases';

/** One loop of the scene, and the frame shown with Reduce Motion (question and answer). */
export const GUIDE_SCENE = { length: 6000, poster: 4200 };

const FADE_OUT = 5300;
const GUIDE_MARK = require('../../../assets/images/guide/guide-logo.svg');

/**
 * What Guide does, shown not told: one of its suggested questions, a moment
 * of thinking, and the answer its script gives (see use-cases.ts).
 */
export function GuideQAScene({
  useCase,
  height,
  radius,
  playing = true,
  onEnd,
}: {
  useCase: GuideUseCase;
  height: number;
  radius: number;
  playing?: boolean;
  /** Play once and report the end (in a carousel); loops without it. */
  onEnd?: () => void;
}) {
  const theme = useTheme();
  const { t } = useStoryboard({ ...GUIDE_SCENE, playing, onEnd });
  const { question, answer } = useCase;
  return (
    <Stage height={height} radius={radius} background={<LimeGlow />} style={{ backgroundColor: theme.colors.surface }}>
      <View style={styles.content}>
        <Animated.View style={pop(t, 200, FADE_OUT)}>
          <Bubble from="user" style={styles.shadow}>
            {question}
          </Bubble>
        </Animated.View>

        <View style={styles.reply}>
          {/* Thinking… */}
          <Animated.View style={[styles.replyLayer, pop(t, 800, 1800, { ease: 200 })]}>
            <Bubble from="agent">
              <TypingDots t={t} start={800} end={2000} color={theme.colors.onSurfaceVariant} />
            </Bubble>
          </Animated.View>
          {/* …and the answer. */}
          <Animated.View style={pop(t, 2000, FADE_OUT)}>
            <View style={[styles.answer, styles.shadow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <View style={styles.answerHead}>
                <LocalSvg asset={GUIDE_MARK} width={16} height={16} />
                <Text style={[styles.answerLabel, { color: theme.colors.onSurfaceVariant }]}>Guide</Text>
              </View>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{answer.value}</Text>
              <View style={styles.answerLine}>
                <Icon source={answer.icon} size={14} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.answerText, { color: theme.colors.onSurfaceVariant }]}>{answer.line}</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 16, gap: 10, justifyContent: 'center' },
  reply: { minHeight: 104, justifyContent: 'flex-start' },
  replyLayer: { position: 'absolute', top: 0, left: 0 },
  answer: { alignSelf: 'flex-start', minWidth: '72%', padding: 12, gap: 4, borderWidth: 1, borderRadius: Shape.max, borderTopLeftRadius: Shape.extraSmall },
  answerHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  answerLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  value: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 30, fontVariant: OPEN_DIGITS },
  answerLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  answerText: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderRadius: concentric(Shape.max, 0),
  },
});
