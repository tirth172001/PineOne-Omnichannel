import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, StyleSheet, View } from 'react-native';

import { AgentCaseScene } from './agents-scene';
import { GuideQAScene } from './guide-scene';
import { AGENT_USE_CASES, GUIDE_USE_CASES } from './use-cases';

type SlideRender = (props: { width: number; playing: boolean; onEnd: () => void }) => ReactNode;

/**
 * A carousel of scenes inside one visual: the current scene plays once, then
 * the next slides in (and round again); swiping moves between them, and
 * restarts the one landed on. Slides out of view rest on their poster frame.
 * Page dots sit over the bottom of the visual.
 */
export function SceneCarousel({
  slides,
  height,
  radius,
  dotColor,
  label,
  playing = true,
}: {
  slides: SlideRender[];
  /** Hold every slide on its poster frame until the visual is on screen (e.g. a sheet still opening). */
  playing?: boolean;
  height: number;
  radius: number;
  /** Dots on the visual's own background: white over a wash, dark over a light glow. */
  dotColor: string;
  /** What the carousel shows, for screen readers. */
  label: string;
}) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  // Bumped to restart the current slide (after a swipe lands on it again).
  const [run, setRun] = useState(0);
  const [scroller, setScroller] = useState<ScrollView | null>(null);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const goTo = (next: number) => {
    setIndex(next);
    setRun((current) => current + 1);
    scroller?.scrollTo({ x: next * width, animated: true });
  };
  const onSwiped = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const landed = Math.round(event.nativeEvent.contentOffset.x / Math.max(width, 1));
    if (landed !== index) {
      setIndex(landed);
      setRun((current) => current + 1);
    }
  };

  return (
    <View onLayout={onLayout} style={[styles.frame, { height, borderRadius: radius }]} accessibilityLabel={`${label}, ${index + 1} of ${slides.length}`}>
      {width > 0 ? (
        <ScrollView
          ref={setScroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onSwiped}
          scrollEventThrottle={16}>
          {slides.map((render, slide) => (
            // Keyed by run while it plays, so landing on it again starts it over.
            <View key={slide === index ? `${slide}-${run}` : slide} style={{ width, height }}>
              {render({ width, playing: playing && slide === index, onEnd: () => goTo((index + 1) % slides.length) })}
            </View>
          ))}
        </ScrollView>
      ) : null}
      <View pointerEvents="none" style={styles.dots}>
        {slides.map((_, slide) => (
          <View key={slide} style={[styles.dot, { backgroundColor: dotColor, opacity: slide === index ? 1 : 0.35 }, slide === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

/** Agents at work: one slide per agent use case (chargeback, snapshot, spike, ads). */
export function AgentsCarousel({ height, radius, playing = true }: { height: number; radius: number; playing?: boolean }) {
  return (
    <SceneCarousel
      playing={playing}
      height={height}
      radius={radius}
      dotColor="#ffffff"
      label="What agents do"
      slides={AGENT_USE_CASES.map(
        (useCase) =>
          function AgentSlide({ playing, onEnd }) {
            return <AgentCaseScene useCase={useCase} height={height} radius={0} playing={playing} onEnd={onEnd} />;
          },
      )}
    />
  );
}

/** Guide answering: one slide per question (settlement, sales, failures, Hinglish). */
export function GuideCarousel({ height, radius, dotColor, playing = true }: { height: number; radius: number; dotColor: string; playing?: boolean }) {
  return (
    <SceneCarousel
      playing={playing}
      height={height}
      radius={radius}
      dotColor={dotColor}
      label="What you can ask Guide"
      slides={GUIDE_USE_CASES.map(
        (useCase) =>
          function GuideSlide({ playing, onEnd }) {
            return <GuideQAScene useCase={useCase} height={height} radius={0} playing={playing} onEnd={onEnd} />;
          },
      )}
    />
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
  dots: { position: 'absolute', left: 0, right: 0, bottom: 10, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 16 },
});
