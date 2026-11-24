import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { useTabLayout, useTabNavBar } from '@/components/app-tabs';
import { GLOW_HEIGHT, LimeGlow } from '@/components/shared/lime-glow';
import { SupportChatComposer } from '@/components/support/support-chat-composer';
import { PAGE_GAP, PAGE_PADDING } from '@/components/tab-screen';
import { Fonts } from '@/constants/theme';
import { STARTER_POOL, SUPPORT_OPENER } from '@/data/guide';

import { ExtraChips, FollowUpChip, GuideMark } from './guide-cards';
import { firstName, startersAt } from './guide-chat';

const openChat = (prompt?: string) => router.push(prompt ? { pathname: '/guide/chat', params: { prompt } } : '/guide/chat');

/**
 * The Guide tab: one section, centred on the screen under Support's lime glow
 * — the Guide mark and "Hi <name>", the composer, the suggested questions in
 * one scrolling row, then Shuffle and Need support. Asking anything opens the
 * chat (guide-chat.tsx).
 */
export function GuideLanding() {
  const theme = useTheme();
  const { headerHeight } = useTabLayout();
  const navBar = useTabNavBar();
  const { height } = useWindowDimensions();
  const [prompt, setPrompt] = useState('');
  const [offset, setOffset] = useState(0);
  // Fill the space between the header and the bar, so the section sits in its middle.
  const minHeight = height - headerHeight - navBar.height - PAGE_GAP - 32;

  return (
    <View style={[styles.page, { minHeight }]}>
      {/* The lime wash runs to the screen's edges and up under the header, as on Support. */}
      <LimeGlow style={[styles.glow, { top: -(headerHeight + PAGE_GAP) }]} />
      <View style={styles.section}>
        <View style={styles.greeting}>
          <GuideMark size={40} />
          <Text style={[styles.hello, { color: theme.colors.onSurface }]} accessibilityRole="header">
            Hi {firstName()} 👋
          </Text>
          <Text style={[styles.helloSub, { color: theme.colors.onSurfaceVariant }]}>How can I help with your business today?</Text>
        </View>
        <SupportChatComposer
          value={prompt}
          onChange={setPrompt}
          placeholder="Ask Guide anything"
          onSubmit={() => {
            const text = prompt.trim();
            setPrompt('');
            openChat(text || undefined);
          }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowScroller} contentContainerStyle={styles.row}>
          {startersAt(offset).map((starter) => (
            <FollowUpChip key={starter} label={starter} onPress={() => openChat(starter)} />
          ))}
        </ScrollView>
        <ExtraChips onShuffle={() => setOffset((current) => (current + 3) % STARTER_POOL.length)} onSupport={() => openChat(SUPPORT_OPENER)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { justifyContent: 'center' },
  glow: { position: 'absolute', left: -PAGE_PADDING, right: -PAGE_PADDING, height: GLOW_HEIGHT },
  section: { gap: 16, paddingVertical: 24 },
  greeting: { alignItems: 'center', gap: 6, paddingBottom: 8 },
  hello: { fontFamily: Fonts.semiBold, fontSize: 28, lineHeight: 36, marginTop: 4 },
  helloSub: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  rowScroller: { marginHorizontal: -PAGE_PADDING },
  row: { gap: 8, paddingHorizontal: PAGE_PADDING },
});
