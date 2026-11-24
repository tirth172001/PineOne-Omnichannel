import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import {
  OverviewAccordion,
  OverviewCard,
  OverviewCardDivider,
  OverviewCardFooter,
  OverviewCardHeader,
  OVERVIEW_CARD_PADDING,
} from '@/components/overview/overview-card';
import { ActionBanner } from '@/components/shared/action-banner';
import { DetailScreen } from '@/components/shared/detail-screen';
import { OutlineTag } from '@/components/shared/status';
import { VideoThumbnail } from '@/components/support/video-thumbnail';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import { CURRENT_USER } from '@/data/businesses';
import { formatInr } from '@/data/common';
import { PRIME, PRODUCTS, REWARD_PER_REFERRAL } from '@/data/profile';
import { useBusiness } from '@/hooks/use-business';
import { useToast } from '@/hooks/use-toast';

import { type PrimeHeroVariant, PrimeHero } from './prime-hero';
import { profileStyles } from './profile-ui';

const rupees = (amount: number) => formatInr(amount).split('.')[0];
/** Benefits shown before View all. */
const PREVIEW = 3;

/**
 * Prime membership (profile → Rewards), after the user's contest-page
 * reference, in the app's own blocks: the hero (the 3D gold crown on the lime
 * glow, PRIME MEMBER tape across the corners, the old app's "You are a PRIME
 * member", then the total saved in a white card — the reference's prize
 * pool); then Overview-style cards for the membership, the explainer video,
 * the benefits ranked by savings with gold / silver / bronze medals, the
 * referral banner, how it works, the terms, Prime prices on devices and the
 * FAQs. Figures past the tier are placeholders (see PRIME in data/profile).
 */
export function PrimeMembership({ heroVariant = 'a' }: { heroVariant?: PrimeHeroVariant }) {
  const theme = useTheme();
  const appColors = useAppColors();
  const toast = useToast();
  const { organisation } = useBusiness();
  const [allBenefits, setAllBenefits] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const muted = { color: theme.colors.onSurfaceVariant };
  const tier = PRIME.tier;
  const saved = PRIME.benefits.reduce((sum, benefit) => sum + benefit.saved, 0);
  const benefits = allBenefits ? PRIME.benefits : PRIME.benefits.slice(0, PREVIEW);

  return (
    <DetailScreen title={tier === 'STAR' ? 'Star membership' : 'Prime membership'} fallbackHref="/">
      <PrimeHero variant={heroVariant} tier={tier} saved={saved} period={PRIME.period} />

      {/* Key facts (the reference's dates and genre), as the Overview card rows. */}
      <OverviewCard>
        <OverviewCardHeader title="Membership" />
        <Row label="Member" value={CURRENT_USER.name} />
        <OverviewCardDivider />
        <Row label="Business" value={organisation.name} />
        <OverviewCardDivider />
        <View style={styles.row}>
          <Text style={[profileStyles.body, muted]}>Role</Text>
          <OutlineTag label={CURRENT_USER.roleLabel} />
        </View>
        <OverviewCardDivider />
        <Row label="Renews on" value={PRIME.renewsOn} />
        <OverviewCardDivider />
        <Row label="Fee" value={`${rupees(PRIME.fee)} a year`} />
      </OverviewCard>

      <OverviewCard>
        <OverviewCardHeader title="Know all about Prime" />
        <TouchableRipple onPress={() => toast("The Prime video isn't in the prototype yet")} accessibilityRole="button" accessibilityLabel="Play the Prime video, 2 minutes 15 seconds" style={styles.videoWrap}>
          <View>
            <VideoThumbnail image={require('../../../assets/images/support/videos/video-1.jpg')} radius={Shape.small} scrim />
            <View style={styles.duration}>
              <Text style={styles.durationText}>02:15</Text>
            </View>
          </View>
        </TouchableRipple>
      </OverviewCard>

      {/* The reference's prize tiers: benefits ranked by what they saved, medals for the top three. */}
      <OverviewCard>
        <OverviewCardHeader title="Your benefits" />
        {benefits.map((benefit, index) => (
          <View key={benefit.title}>
            {index > 0 ? <OverviewCardDivider /> : null}
            <View style={styles.benefit}>
              <View style={[styles.benefitIcon, { backgroundColor: appColors.highlight }]}>
                <Icon source={benefit.icon} size={20} color={appColors.brand} />
              </View>
              <View style={profileStyles.flex}>
                <Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>{benefit.title}</Text>
                <Text style={[profileStyles.small, muted]}>{benefit.line}</Text>
              </View>
              <View style={styles.benefitEnd}>
                {benefit.saved ? <Text style={[styles.benefitAmount, { color: theme.colors.onSurface }]}>{rupees(benefit.saved)}</Text> : null}
                <View style={[styles.badge, { backgroundColor: appColors.highlight }]}>
                  <Text style={[styles.badgeText, { color: appColors.brand }]}>{benefit.badge}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        <OverviewCardFooter label={allBenefits ? 'Show fewer' : `View all ${PRIME.benefits.length} benefits`} onPress={() => setAllBenefits((value) => !value)} />
      </OverviewCard>

      <ActionBanner icon="gift" label={`Refer a business and earn ${rupees(REWARD_PER_REFERRAL)} when they go live`} actionLabel="Refer now" onPress={() => router.push('/referrals')} />

      <OverviewCard>
        <OverviewCardHeader title="How Prime works" />
        <View style={styles.steps}>
          {PRIME.steps.map((step, index) => (
            <Step key={step} marker={<Text style={[styles.stepNumber, { color: theme.colors.onSurface }]}>{index + 1}</Text>} text={step} />
          ))}
          <Step last highlight marker={<Icon source="crown-fill" size={14} color={appColors.brand} />} text={`Renews on ${PRIME.renewsOn}`} />
        </View>
      </OverviewCard>

      <OverviewCard>
        <OverviewCardHeader title="Membership terms" />
        <View style={styles.bullets}>
          {PRIME.terms.map((term) => (
            <View key={term} style={styles.bullet}>
              <View style={[styles.bulletDot, { backgroundColor: theme.colors.onSurfaceVariant }]} />
              <Text style={[profileStyles.body, profileStyles.flex, muted]}>{term}</Text>
            </View>
          ))}
        </View>
      </OverviewCard>

      {/* The reference's prize-winning series: Prime prices on devices. */}
      <OverviewCard>
        <OverviewCardHeader title="Prime prices on devices" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deals}>
          {PRIME.deals.map((deal) => {
            const product = PRODUCTS.find((item) => item.id === deal.productId);
            if (!product) return null;
            return (
              <TouchableRipple key={deal.productId} onPress={() => router.push('/marketplace')} borderless accessibilityRole="button" accessibilityLabel={`${product.name}, ${rupees(deal.price)} for Prime members`} style={[styles.deal, { borderColor: theme.colors.background }]}>
                <View style={styles.dealInner}>
                  <View style={[styles.dealImage, { backgroundColor: theme.colors.background }]}>
                    {product.image ? <Image source={product.image} contentFit="contain" style={styles.dealPhoto} /> : <Icon source={product.icon} size={40} color={theme.colors.primary} />}
                  </View>
                  <Text numberOfLines={1} style={[profileStyles.medium, { color: theme.colors.onSurface }]}>
                    {product.name}
                  </Text>
                  <View style={styles.dealPrice}>
                    <Text style={[styles.dealAmount, { color: theme.colors.onSurface }]}>{rupees(deal.price)}</Text>
                    <Text style={[profileStyles.small, styles.strike, muted]}>{rupees(product.mrp ?? product.price)}</Text>
                  </View>
                </View>
              </TouchableRipple>
            );
          })}
        </ScrollView>
        <OverviewCardFooter label="Go to Marketplace" onPress={() => router.push('/marketplace')} />
      </OverviewCard>

      <OverviewCard>
        <OverviewCardHeader title="FAQs" />
        {PRIME.faqs.map((faq, index) => (
          <View key={faq.q}>
            {index > 0 ? <OverviewCardDivider /> : null}
            <OverviewAccordion
              open={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              accessibilityLabel={faq.q}
              main={<Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>{faq.q}</Text>}>
              <Text style={[profileStyles.body, muted]}>{faq.a}</Text>
            </OverviewAccordion>
          </View>
        ))}
      </OverviewCard>
    </DetailScreen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[profileStyles.body, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      <Text numberOfLines={1} style={[profileStyles.medium, styles.value, { color: theme.colors.onSurface }]}>
        {value}
      </Text>
    </View>
  );
}

function Step({ marker, text, last = false, highlight = false }: { marker: ReactNode; text: string; last?: boolean; highlight?: boolean }) {
  const theme = useTheme();
  const appColors = useAppColors();
  return (
    <View style={styles.step}>
      <View style={styles.stepRail}>
        <View style={[styles.stepMarker, { backgroundColor: highlight ? appColors.highlight : theme.colors.background }]}>{marker}</View>
        {last ? null : <View style={[styles.stepLine, { backgroundColor: theme.colors.outlineVariant }]} />}
      </View>
      <Text style={[profileStyles.body, styles.stepText, { color: theme.colors.onSurface }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strike: { textDecorationLine: 'line-through' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: OVERVIEW_CARD_PADDING },
  value: { flexShrink: 1, textAlign: 'right' },
  videoWrap: { padding: OVERVIEW_CARD_PADDING },
  duration: { position: 'absolute', left: 8, bottom: 8, paddingHorizontal: 6, height: 20, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' },
  durationText: { fontFamily: Fonts.medium, fontSize: 11, lineHeight: 14, color: '#ffffff', fontVariant: OPEN_DIGITS },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: OVERVIEW_CARD_PADDING },
  benefitIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  benefitEnd: { alignItems: 'flex-end', gap: 4 },
  benefitAmount: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20, fontVariant: OPEN_DIGITS },
  badge: { paddingHorizontal: 6, height: 20, borderRadius: 4, justifyContent: 'center' },
  badgeText: { fontFamily: Fonts.medium, fontSize: 11, lineHeight: 14 },
  steps: { padding: OVERVIEW_CARD_PADDING, paddingBottom: 0 },
  step: { flexDirection: 'row', gap: 12 },
  stepRail: { alignItems: 'center', width: 28 },
  stepMarker: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { fontFamily: Fonts.semiBold, fontSize: 13, lineHeight: 16 },
  stepLine: { width: 1, flex: 1, minHeight: 12 },
  stepText: { flex: 1, paddingTop: 4, paddingBottom: 16 },
  bullets: { padding: OVERVIEW_CARD_PADDING, gap: 8 },
  bullet: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletDot: { width: 4, height: 4, borderRadius: 2, marginTop: 8 },
  deals: { gap: 8, padding: OVERVIEW_CARD_PADDING },
  deal: { width: 156, borderRadius: Shape.small, borderWidth: 1 },
  dealInner: { padding: 8, gap: 4 },
  dealImage: { height: 120, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 4 },
  dealPhoto: { width: '86%', height: '86%' },
  dealPrice: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  dealAmount: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22, fontVariant: OPEN_DIGITS },
});
