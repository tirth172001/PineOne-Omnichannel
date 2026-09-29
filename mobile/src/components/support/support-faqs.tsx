import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Tabs } from '@/components/material3/tabs';
import { SearchField } from '@/components/search-field';
import { DetailScreen } from '@/components/shared/detail-screen';
import { ListCard, LIST_ROW_PADDING, LIST_ROW_RADIUS } from '@/components/shared/listing';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { SUPPORT_TOPICS, type SupportTopicSlug, TOPIC_FAQS } from '@/data/support';

const TOPIC_TABS = SUPPORT_TOPICS.map((topic) => ({ key: topic.slug, label: topic.label }));

/**
 * All FAQs (web: SupportFaqsContent): search, one tab per support topic, and
 * the topic's questions as a single-open accordion. `?topic=` picks the tab.
 */
export function SupportFaqs({ initialTopic }: { initialTopic?: string }) {
  const theme = useTheme();
  const [topic, setTopic] = useState<SupportTopicSlug>(
    SUPPORT_TOPICS.find((item) => item.slug === initialTopic)?.slug ?? SUPPORT_TOPICS[0].slug
  );
  const [search, setSearch] = useState('');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const query = search.trim().toLowerCase();
  const faqs = (TOPIC_FAQS[topic] ?? []).filter((faq) => !query || faq.question.toLowerCase().includes(query));

  return (
    <DetailScreen title="All FAQs" fallbackHref="/support">
      <SearchField value={search} onChangeText={setSearch} placeholder="Search FAQs" radius={Shape.small} />
      <View style={styles.tabs}>
        <Tabs
          tabs={TOPIC_TABS}
          activeKey={topic}
          onChange={(key) => {
            setTopic(key as SupportTopicSlug);
            setOpenQuestion(null);
          }}
          variant="secondary"
          scrollable
        />
      </View>
      {faqs.length === 0 ? (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          No FAQs match your search.
        </Text>
      ) : (
        <ListCard>
          {faqs.map((faq) => {
            const open = openQuestion === faq.question;
            return (
              <View key={faq.question}>
                <TouchableRipple
                  onPress={() => setOpenQuestion(open ? null : faq.question)}
                  borderless
                  accessibilityRole="button"
                  aria-expanded={open}
                  accessibilityState={{ expanded: open }}
                  style={styles.trigger}>
                  <View style={styles.triggerContent}>
                    <Text variant="bodyMedium" style={[styles.flex, styles.medium]}>
                      {faq.question}
                    </Text>
                    <Icon source={open ? 'caret-up' : 'caret-down'} size={16} color={theme.colors.onSurfaceVariant} />
                  </View>
                </TouchableRipple>
                {open ? (
                  <Text variant="bodyMedium" style={[styles.answer, { color: theme.colors.onSurfaceVariant }]}>
                    {faq.answer}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ListCard>
      )}
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  medium: { fontFamily: Fonts.medium },
  tabs: { marginHorizontal: -16, marginVertical: -8 },
  trigger: { borderRadius: LIST_ROW_RADIUS },
  triggerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: LIST_ROW_PADDING },
  answer: { fontFamily: Fonts.regular, lineHeight: 22, paddingHorizontal: LIST_ROW_PADDING, paddingBottom: LIST_ROW_PADDING, marginTop: -4 },
});
