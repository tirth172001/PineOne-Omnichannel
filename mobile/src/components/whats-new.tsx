import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { LocalSvg } from 'react-native-svg/css';

import { AgentsCarousel, GuideCarousel } from '@/components/feature-visuals/carousel';
import { PANEL_INNER_RADIUS, PANEL_PADDING, PanelSheet, SHEET_BUTTON } from '@/components/shared/panel-sheet';
import { useAppColors } from '@/constants/app-colors';
import { Fonts } from '@/constants/theme';

/**
 * Introducing the AI features people may not know about, Agents and Guide,
 * as a "What's new" announcement rather than an app tour: once per install,
 * Overview opens a sheet with a page per feature — a carousel of what it
 * does, its mark above its name, one line — and a button to try it. Agents and Guide also carry a small dot in the bar
 * (and in More's grid) until each has been opened once.
 *
 * Both are saved on the device. To see them again, open the app at
 * `/?whatsnew=<any new value>`, e.g. `npm run whats-new` on the iOS simulator.
 */

export type AiFeature = 'agents' | 'guide';
const FEATURES: AiFeature[] = ['agents', 'guide'];

const ANNOUNCED_KEY = 'pineone.whats-new.ai.v1';
const SEEN_KEY = 'pineone.ai-seen.v1';

/** `run` counts replays, so a replayed announcement opens on its first page. */
type State = {
  loaded: boolean;
  announced: boolean;
  seen: AiFeature[];
  run: number;
};
let state: State = {
  loaded: false,
  announced: true,
  seen: [...FEATURES],
  run: 0,
};
const listeners = new Set<() => void>();
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

let loading = false;
/** The last `?whatsnew=` value acted on: each new value replays the announcement once (later visits to Overview with the same one don't). */
let replayedFor: string | undefined;
function load() {
  if (loading) return;
  loading = true;
  Promise.all([AsyncStorage.getItem(ANNOUNCED_KEY), AsyncStorage.getItem(SEEN_KEY)])
    .then(([announced, seen]) => {
      const parsed = seen ? (JSON.parse(seen) as AiFeature[]) : [];
      set({
        loaded: true,
        announced: announced === 'done',
        seen: parsed.filter((key) => FEATURES.includes(key)),
      });
    })
    .catch(() => set({ loaded: true }));
}

function markSeen(feature: AiFeature) {
  if (state.seen.includes(feature)) return;
  const seen = [...state.seen, feature];
  set({ seen });
  AsyncStorage.setItem(SEEN_KEY, JSON.stringify(seen)).catch(() => {});
}

function markAnnounced() {
  set({ announced: true });
  AsyncStorage.setItem(ANNOUNCED_KEY, 'done').catch(() => {});
}

function replay() {
  set({ loaded: true, announced: false, seen: [], run: state.run + 1 });
  AsyncStorage.multiRemove([ANNOUNCED_KEY, SEEN_KEY]).catch(() => {});
}

/** Which of Agents and Guide still get their dot, and a way to clear it once the page is opened. */
export function useAiNudges() {
  const current = useSyncExternalStore(subscribe, () => state);
  useEffect(load, []);
  return {
    isNew: (key: string) => current.loaded && (FEATURES as string[]).includes(key) && !current.seen.includes(key as AiFeature),
    markSeen,
  };
}

/** The features' marks: Agents' (as in the bar) and Guide's logo. */
const AGENTS_MARK = require('../../assets/images/nav/agents-filled.svg');
const GUIDE_MARK = require('../../assets/images/guide/guide-logo.svg');
const MARK_SIZE = 32;

/** Lets the scope intro (~2s from launch) play before the sheet comes up. */
const START_DELAY_MS = 2400;

const PAGES: Record<AiFeature, { title: string; line: string; cta: string; href: '/agents' | '/guide' }> = {
  agents: {
    title: 'Agents',
    line: 'They do the work. You approve.',
    cta: 'Explore agents',
    href: '/agents',
  },
  guide: {
    title: 'Guide',
    line: 'Ask about your business in plain words.',
    cta: 'Ask Guide',
    href: '/guide',
  },
};

/** The scene's height: most of the sheet, so the picture does the talking. */
const STAGE_HEIGHT = 248;

/** The "What's new" sheet on Overview. */
export function WhatsNew() {
  const theme = useTheme();
  const colors = useAppColors();
  const { whatsnew } = useLocalSearchParams<{ whatsnew?: string }>();
  const current = useSyncExternalStore(subscribe, () => state);
  const [progress, setProgress] = useState({ run: 0, page: 0 });
  const page = progress.run === current.run ? progress.page : 0;
  const setPage = (next: number) => setProgress({ run: current.run, page: next });
  const [ready, setReady] = useState(false);

  useEffect(load, []);
  useEffect(() => {
    if (whatsnew && whatsnew !== replayedFor) {
      replayedFor = whatsnew;
      replay();
    }
  }, [whatsnew]);
  const due = current.loaded && !current.announced;
  useEffect(() => {
    if (!due) return;
    const timer = setTimeout(() => setReady(true), START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [due]);

  const open = due && ready;
  const feature = FEATURES[page] ?? FEATURES[0];
  const content = PAGES[feature];
  const last = page === FEATURES.length - 1;
  const close = () => {
    markAnnounced();
    setPage(0);
  };
  const tryIt = () => {
    markAnnounced();
    setPage(0);
    router.navigate(content.href);
  };

  return (
    <PanelSheet
      visible={open}
      onDismiss={close}
      title="What’s new"
      fit
      footer={
        <View style={styles.footerRow}>
          <Button
            mode="outlined"
            onPress={tryIt}
            textColor={theme.colors.onSurface}
            {...SHEET_BUTTON}
            style={[SHEET_BUTTON.style, styles.flex, { borderColor: theme.colors.outlineVariant }]}>
            {content.cta}
          </Button>
          <Button mode="contained" onPress={last ? close : () => setPage(page + 1)} {...SHEET_BUTTON} style={[SHEET_BUTTON.style, styles.flex]}>
            {last ? 'Done' : 'Next'}
          </Button>
        </View>
      }>
      <View style={styles.body}>
        <View style={styles.copy}>
          {/* The feature's own mark, so its branding is what people remember. */}
          <View style={styles.mark}>
            {feature === 'agents' ? (
              <LocalSvg asset={AGENTS_MARK} width={MARK_SIZE} height={MARK_SIZE} color={theme.colors.onSurface} />
            ) : (
              <LocalSvg asset={GUIDE_MARK} width={MARK_SIZE} height={MARK_SIZE} />
            )}
          </View>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{content.title}</Text>
            <View style={[styles.newTag, { backgroundColor: colors.highlight }]}>
              <Text style={[styles.newText, { color: theme.colors.onSurface }]}>New</Text>
            </View>
          </View>
          <Text style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>{content.line}</Text>
        </View>
        {/* Keyed by page, so each feature's carousel starts at its first use case. */}
        {feature === 'agents' ? (
          <AgentsCarousel key={`agents-${current.run}`} height={STAGE_HEIGHT} radius={PANEL_INNER_RADIUS} playing={open} />
        ) : (
          <GuideCarousel key={`guide-${current.run}`} height={STAGE_HEIGHT} radius={PANEL_INNER_RADIUS} dotColor={theme.colors.onSurface} playing={open} />
        )}
      </View>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { gap: 16, padding: PANEL_PADDING },
  copy: { gap: 2, paddingHorizontal: 4 },
  mark: { marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: Fonts.semiBold, fontSize: 22, lineHeight: 30 },
  newTag: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    justifyContent: 'center',
  },
  newText: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  text: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  footerRow: { flexDirection: 'row', gap: 8 },
});
