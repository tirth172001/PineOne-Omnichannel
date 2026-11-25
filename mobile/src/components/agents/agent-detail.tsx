import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LocalSvg } from 'react-native-svg/css';

import { AppIcon, type IconName } from '@/components/icons';
import { FooterButton } from '@/components/profile/profile-ui';
import { DetailScreen } from '@/components/shared/detail-screen';
import { PAGE_PADDING } from '@/components/tab-screen';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { type AgentStepIcon, type ConnectorLogo, type MarketplaceAgent, MY_AGENTS } from '@/data/agents';
import { useToast } from '@/hooks/use-toast';

import { CreditCostLine, RunAgentSheet } from './agent-credits';
import { type FigureTone, ToneIcon, agentStyles } from './agent-parts';
import { HalftoneBackdrop, HeroShade } from './agent-visuals';
import { AgentHeroTags } from './agents-view';

/** The web's step icons (Reicon), as the app's Phosphor ones. */
const STEP_ICONS: Record<AgentStepIcon, IconName> = {
  'search-status': 'magnifying-glass',
  'folder-open': 'folder-open',
  'document-text': 'file-text',
  'user-tick': 'user-check',
  link: 'link-simple',
  'message-search': 'chat-text',
  'magic-star': 'sparkle',
  'trend-up': 'trend-up',
  'chart-success': 'chart-line-up',
  'calendar-tick': 'calendar-check',
  'send-square': 'paper-plane-right',
};

const CONNECTOR_LOGOS: Record<ConnectorLogo, number> = {
  'pine-labs': require('../../../assets/images/agents/pine-labs-icon-white.svg'),
  'zoho-books': require('../../../assets/images/agents/zoho-books.svg'),
  dhl: require('../../../assets/images/agents/dhl.svg'),
  intercom: require('../../../assets/images/agents/intercom.svg'),
  'google-ads': require('../../../assets/images/agents/google-ads.svg'),
  google: require('../../../assets/images/agents/google.svg'),
  whatsapp: require('../../../assets/images/agents/whatsapp-circle.svg'),
};

/**
 * The footer's two actions, by kind of agent (web: AgentActions on the
 * phone's bottom bar, primary first). The flows they open live on the web
 * for now, so here they say so.
 */
function agentActions(agent: MarketplaceAgent) {
  const installed = MY_AGENTS.some((entry) => entry.id === agent.id);
  if (agent.id === 'chargeback') return installed ? ['Open agent', 'Manage agent'] : ['Set up agent'];
  if (agent.kind === 'app') return ['Start setup', 'View campaigns'];
  if (agent.kind === 'chat') return ['Open agent'];
  return ['Configure task', 'View scheduled tasks'];
}

/** An agent's page (web: AgentDetailPage, phone layout): hero, figures, then what it is, does, how, FAQs, reviews and connectors. */
export function AgentDetail({ agent }: { agent: MarketplaceAgent }) {
  const theme = useTheme();
  const toast = useToast();
  const { detail } = agent;
  const [primary, secondary] = agentActions(agent);
  const notYet = (label: string) => toast(`${label} isn’t available in the app yet`);
  // Starting the agent shows what it costs in credits first (see agent-credits.tsx).
  const [runOpen, setRunOpen] = useState(false);

  return (
    <DetailScreen
      title={agent.name}
      fallbackHref="/agents"
      footer={
        <View style={styles.footerStack}>
          <CreditCostLine agent={agent} />
          <View style={styles.footer}>
            {secondary ? <FooterButton label={secondary} mode="outlined" onPress={() => notYet(secondary)} /> : null}
            <FooterButton label={primary} onPress={() => setRunOpen(true)} />
          </View>
        </View>
      }>
      <RunAgentSheet agent={agent} action={primary} visible={runOpen} onDismiss={() => setRunOpen(false)} />
      <View style={styles.stack}>
        <View style={styles.hero}>
          <HalftoneBackdrop agentId={agent.id} />
          <HeroShade />
          <View style={styles.heroBody}>
            <AgentHeroTags agent={agent} />
            <Text style={styles.heroTitle}>{agent.name}</Text>
            <Text style={[agentStyles.body, styles.heroTagline]}>{detail.tagline}</Text>
          </View>
        </View>

        <Figures agent={agent} />

        <Section title="What is this agent?">
          <Text style={[agentStyles.bodyLong, { color: theme.colors.onSurfaceVariant }]}>{detail.about}</Text>
        </Section>

        <Section title="What this agent does">
          <View style={styles.list}>
            {detail.capabilities.map((capability) => (
              <ListItem key={capability.title} icon="check" size={32} title={capability.title} description={capability.description} />
            ))}
          </View>
        </Section>

        <Section title="How it works">
          <View style={styles.steps}>
            {detail.steps.map((step) => (
              <ListItem key={step.title} icon={step.icon ? STEP_ICONS[step.icon] : 'chat-circle'} size={36} title={step.title} description={step.description} />
            ))}
          </View>
        </Section>

        <Section title="Frequently asked questions">
          <Faqs faqs={detail.faqs} />
        </Section>

        <Section
          title="Reviews"
          trailing={
            <Pressable
              onPress={() => toast('All reviews aren’t available in this prototype yet')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.smallButton, { borderColor: theme.colors.outlineVariant }, pressed && { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[agentStyles.medium, { color: theme.colors.onSurface }]}>View all reviews</Text>
            </Pressable>
          }>
          <View style={styles.reviews}>
            <View style={styles.ratingRow}>
              <View style={styles.ratingLeft}>
                <Text style={[agentStyles.title, agentStyles.numbers, { color: theme.colors.onSurface }]}>{agent.rating}</Text>
                <Stars rating={agent.rating} />
              </View>
              <Text style={[agentStyles.body, agentStyles.numbers, { color: theme.colors.onSurfaceVariant }]}>{agent.reviewCount} reviews</Text>
            </View>
            {detail.reviews.map((review) => (
              <View key={review.author} style={styles.review}>
                <View style={styles.reviewer}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[agentStyles.medium, { color: theme.colors.onSurface }]}>
                      {review.author
                        .split(/\s+/)
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.reviewerText}>
                    <Text style={[agentStyles.medium, { color: theme.colors.onSurface }]}>{review.author}</Text>
                    <Text style={[agentStyles.body, agentStyles.numbers, { color: theme.colors.onSurfaceVariant }]}>{review.date}</Text>
                  </View>
                </View>
                <Text style={[agentStyles.bodyLong, { color: theme.colors.onSurfaceVariant }]}>{review.body}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Connectors used">
          <View>
            {detail.connectors.map((connector, index) => (
              <View
                key={connector.name}
                style={[styles.connector, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.outlineVariant }]}>
                {connector.logo ? (
                  <View style={styles.logo}>
                    <LocalSvg asset={CONNECTOR_LOGOS[connector.logo]} width={20} height={20} />
                  </View>
                ) : (
                  <View style={[styles.logo, styles.logoLetter, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.letter, { color: theme.colors.onSurface }]}>{connector.name.slice(0, 1)}</Text>
                  </View>
                )}
                <Text numberOfLines={1} style={[agentStyles.medium, styles.flex, { color: theme.colors.onSurface }]}>
                  {connector.name}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      </View>
    </DetailScreen>
  );
}

/** Rating, users and success rate in three columns (web: AgentMobileStats). */
function Figures({ agent }: { agent: MarketplaceAgent }) {
  const theme = useTheme();
  const figures: { value: string; label: string; icon: IconName; tone: FigureTone }[] = [
    { value: `${agent.rating}/5`, label: `${agent.reviewCount} reviews`, icon: 'star-fill', tone: 'amber' },
    { value: agent.users, label: 'users', icon: 'users-fill', tone: 'pink' },
    { value: agent.successRate, label: 'success rate', icon: 'chart-line-up-fill', tone: 'rose' },
  ];
  return (
    <View style={[styles.figures, { backgroundColor: theme.colors.surface }]}>
      {figures.map((figure, index) => (
        <View key={figure.label} style={[styles.figure, index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: theme.colors.outlineVariant }]}>
          <View style={styles.figureValue}>
            <ToneIcon icon={figure.icon} tone={figure.tone} />
            <Text style={[agentStyles.title, agentStyles.numbers, { color: theme.colors.onSurface }]}>{figure.value}</Text>
          </View>
          <Text numberOfLines={1} style={[agentStyles.small, agentStyles.numbers, { color: theme.colors.onSurfaceVariant }]}>
            {figure.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Section({ title, trailing, children }: { title: string; trailing?: React.ReactNode; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[agentStyles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

/** A capability or step: its icon in a grey circle, a medium title and a muted line (web). */
function ListItem({ icon, size, title, description }: { icon: IconName; size: number; title: string; description: string }) {
  const theme = useTheme();
  return (
    <View style={styles.item}>
      <View style={[styles.itemIcon, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.surfaceVariant }]}>
        <AppIcon name={icon} size={size === 32 ? 16 : 18} color={theme.colors.onSurface} />
      </View>
      <View style={styles.itemText}>
        <Text style={[agentStyles.medium, { color: theme.colors.onSurface }]}>{title}</Text>
        <Text style={[agentStyles.bodyLong, { color: theme.colors.onSurfaceVariant }]}>{description}</Text>
      </View>
    </View>
  );
}

/** The web's accordion: the first answer open, one rule between questions. */
function Faqs({ faqs }: { faqs: MarketplaceAgent['detail']['faqs'] }) {
  const theme = useTheme();
  const [open, setOpen] = useState<string[]>(faqs[0] ? [faqs[0].question] : []);
  const toggle = (question: string) => setOpen((current) => (current.includes(question) ? current.filter((entry) => entry !== question) : [...current, question]));
  return (
    <View style={styles.faqs}>
      {faqs.map((faq, index) => {
        const expanded = open.includes(faq.question);
        return (
          <Fragment key={faq.question}>
            {index > 0 ? <View style={[styles.rule, { backgroundColor: theme.colors.outlineVariant }]} /> : null}
            <Pressable
              onPress={() => toggle(faq.question)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              style={styles.question}>
              <Text style={[agentStyles.medium, styles.flex, { color: theme.colors.onSurface }]}>{faq.question}</Text>
              <AppIcon name={expanded ? 'caret-up' : 'caret-down'} size={16} color={theme.colors.onSurfaceVariant} />
            </Pressable>
            {expanded ? <Text style={[agentStyles.bodyLong, styles.answer, { color: theme.colors.onSurfaceVariant }]}>{faq.answer}</Text> : null}
          </Fragment>
        );
      })}
    </View>
  );
}

function Stars({ rating }: { rating: number }) {
  const theme = useTheme();
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <AppIcon key={star} name="star-fill" size={16} color={star <= rating ? (theme.dark ? '#fcd34d' : '#f59e0b') : theme.colors.outlineVariant} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 8, marginTop: PAGE_PADDING },
  footer: { flexDirection: 'row', gap: 8 },
  footerStack: { flex: 1, width: '100%' },
  hero: { borderRadius: Shape.max, overflow: 'hidden' },
  heroBody: { position: 'relative', padding: 20, gap: 12 },
  heroTitle: { fontFamily: Fonts.semiBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: '#ffffff' },
  heroTagline: { color: 'rgba(255, 255, 255, 0.75)' },
  figures: { flexDirection: 'row', paddingVertical: 12, borderRadius: Shape.max },
  figure: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  figureValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { flex: 1, fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  list: { gap: 24 },
  steps: { gap: 20 },
  item: { flexDirection: 'row', gap: 14 },
  itemIcon: { alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, minWidth: 0, gap: 4 },
  faqs: { marginTop: -8 },
  rule: { height: StyleSheet.hairlineWidth },
  question: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  answer: { paddingBottom: 16 },
  smallButton: { height: 32, justifyContent: 'center', paddingHorizontal: 12, borderRadius: concentric(Shape.max, 12), borderWidth: 1 },
  reviews: { gap: 24 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  ratingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { flexDirection: 'row', gap: 2 },
  review: { gap: 12 },
  reviewer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reviewerText: { gap: 4 },
  connector: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  logo: { width: 20, height: 20, borderRadius: Shape.extraSmall, overflow: 'hidden' },
  logoLetter: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: Fonts.semiBold, fontSize: 10, lineHeight: 12 },
});

