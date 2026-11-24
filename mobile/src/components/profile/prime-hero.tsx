import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useSvgId } from '@/components/shared/hatch';
import { LimeGlow } from '@/components/shared/lime-glow';
import { PAGE_PADDING } from '@/components/tab-screen';
import { useAppColors } from '@/constants/app-colors';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import { formatInr } from '@/data/common';

const CROWN = require('../../../assets/images/prime/crown.png');
const GOLD = '#e2ad3c';
const GOLD_DEEP = '#b9862a';
const CROWN_W = 140;
const CROWN_H = 111;

export type PrimeHeroVariant = 'a' | 'b' | 'c' | 'd' | 'e';
export const PRIME_HERO_VARIANTS: PrimeHeroVariant[] = ['a', 'b', 'c', 'd', 'e'];

type HeroProps = { tier: string; saved: number; period: string };

/**
 * Prime's hero. Every take keeps the user's brief: "You are a PRIME member"
 * at the top centre; a front-view crown, not too big; under it one block of
 * the amount (always the biggest thing), what it is and the dates, with a
 * fade behind the text rather than a box; Inter only; ideas from the contest
 * reference, not a copy. What changes is what ties them together
 * (/prime?hero=a…e):
 * A — lime wash: Support's lime glow under the bar, a gold glow pooling
 *     under the crown into the text.
 * B — spotlight: a soft gold beam from above onto the crown, its pool of
 *     light on the floor behind the amount.
 * C — ribbon: the crown sits on a gold ribbon carrying the dates; the
 *     amount below.
 * D — warm fade: a warm gold fade down from the bar; the card below rises
 *     into it, so hero and page join.
 * E — tapes and haze: the reference's two tapes in a V behind the crown; a
 *     haze of the page colour behind the text lets them pass under it.
 */
export function PrimeHero({ variant, ...props }: HeroProps & { variant: PrimeHeroVariant }) {
  if (variant === 'b') return <Spotlight {...props} />;
  if (variant === 'c') return <Ribbon {...props} />;
  if (variant === 'd') return <WarmFade {...props} />;
  if (variant === 'e') return <TapesAndHaze {...props} />;
  return <LimeWash {...props} />;
}

/** A: Support's lime wash; a gold glow pools under the crown and behind the amount. */
function LimeWash({ tier, saved, period }: HeroProps) {
  return (
    <View style={styles.bleed}>
      <LimeGlow style={styles.wash} />
      <Title tier={tier} />
      <Crown />
      <View style={styles.block}>
        <Pool color={GOLD} opacity={0.28} />
        <Figures saved={saved} period={period} />
      </View>
    </View>
  );
}

/** B: a gold beam from above onto the crown; its light pools on the floor behind the figures. */
function Spotlight({ tier, saved, period }: HeroProps) {
  const { width } = useWindowDimensions();
  const beam = useSvgId('beam');
  const beamH = 230;
  return (
    <View style={styles.bleed}>
      <Svg pointerEvents="none" width={width} height={beamH} style={styles.abs}>
        <Defs>
          <LinearGradient id={beam} x1={0} y1={0} x2={0} y2={beamH} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={GOLD} stopOpacity={0.42} />
            <Stop offset="1" stopColor={GOLD} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={`M${width / 2 - 34} 0 L${width / 2 + 34} 0 L${width / 2 + 150} ${beamH} L${width / 2 - 150} ${beamH} Z`} fill={`url(#${beam})`} />
      </Svg>
      <Title tier={tier} />
      <Crown />
      <View style={styles.block}>
        <Pool color={GOLD} opacity={0.36} flat />
        <Figures saved={saved} period={period} />
      </View>
    </View>
  );
}

/** C: the crown sits on a gold ribbon that carries the dates; the amount below, on a soft glow. */
function Ribbon({ tier, saved, period }: HeroProps) {
  return (
    <View style={styles.bleed}>
      <LimeGlow style={styles.wash} />
      <Title tier={tier} />
      <Crown />
      <RibbonBanner label={period.toUpperCase()} />
      <View style={[styles.block, styles.afterRibbon]}>
        <Pool color={GOLD} opacity={0.22} />
        <Figures saved={saved} />
      </View>
    </View>
  );
}

/** D: a warm gold fade from the bar down; the page's first card rises into its foot, so the two join. */
function WarmFade({ tier, saved, period }: HeroProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const fade = useSvgId('warm');
  return (
    <View style={[styles.bleed, styles.joined]}>
      <Svg pointerEvents="none" width={width} height={420} style={styles.abs}>
        <Defs>
          <LinearGradient id={fade} x1={0} y1={0} x2={0} y2={420} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#f6dfa4" stopOpacity={1} />
            <Stop offset="0.65" stopColor={theme.colors.background} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={420} fill={`url(#${fade})`} />
      </Svg>
      <Title tier={tier} />
      <Crown />
      <View style={styles.block}>
        <Pool color="#ffffff" opacity={0.85} />
        <Figures saved={saved} period={period} />
      </View>
    </View>
  );
}

/** E: the reference's tapes in a V behind the crown; a haze of the page colour behind the figures lets them pass under. */
function TapesAndHaze({ tier, saved, period }: HeroProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  // The crown's base, from the hero's top: padding (24) + title (26) + gap (16) + crown.
  const base = 24 + 26 + 16 + CROWN_H;
  return (
    <View style={styles.bleed}>
      <Tape from={{ x: -24, y: base - 70 }} to={{ x: width * 0.44, y: base + 30 }} fill="#d6d6cf" text="#5f5f58" fade={theme.colors.background} />
      <Tape from={{ x: width + 30, y: 10 }} to={{ x: width * 0.6, y: base + 34 }} fill={GOLD} text="#3d2a00" fade={theme.colors.background} />
      <Title tier={tier} />
      <Crown />
      <View style={styles.block}>
        <Pool color={theme.colors.background} opacity={1} wide />
        <Figures saved={saved} period={period} />
      </View>
    </View>
  );
}

function Title({ tier }: { tier: string }) {
  const theme = useTheme();
  const appColors = useAppColors();
  return (
    <Text style={[styles.title, { color: theme.colors.onSurface }]}>
      You are a <Text style={[styles.tier, { color: appColors.brand }]}>{tier}</Text> member
    </Text>
  );
}

function Crown() {
  return <Image source={CROWN} contentFit="contain" style={styles.crown} accessibilityIgnoresInvertColors />;
}

/** The block under the crown: the amount (largest), what it is, and the dates when they aren't elsewhere. */
function Figures({ saved, period }: { saved: number; period?: string }) {
  const theme = useTheme();
  const appColors = useAppColors();
  const [rupees, paise] = formatInr(saved).split('.');
  return (
    <>
      <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
        {rupees}
        <Text style={[styles.paise, { color: theme.colors.onSurfaceVariant }]}>.{paise ?? '00'}</Text>
      </Text>
      <Text style={[styles.caption, { color: theme.colors.onSurfaceVariant }]}>saved with Prime this year</Text>
      {period ? <Text style={[styles.dates, { color: appColors.brand }]}>{period}</Text> : null}
    </>
  );
}

/** The fade behind the figures: a soft ellipse of light, no edges. `flat` makes it a floor; `wide` a haze across the page. */
function Pool({ color, opacity, flat = false, wide = false }: { color: string; opacity: number; flat?: boolean; wide?: boolean }) {
  const { width } = useWindowDimensions();
  const id = useSvgId('pool');
  const h = 150;
  const rx = wide ? width * 0.5 : flat ? width * 0.42 : width * 0.36;
  const ry = flat ? 40 : wide ? 70 : 64;
  const cy = flat ? 28 : 72;
  return (
    <Svg pointerEvents="none" width={width} height={h} style={[styles.abs, { top: -20 }]}>
      <Defs>
        <RadialGradient id={id} cx={width / 2} cy={cy} rx={rx} ry={ry} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset={wide ? '0.6' : '0.2'} stopColor={color} stopOpacity={wide ? opacity * 0.9 : opacity * 0.8} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />
    </Svg>
  );
}

/** A gold ribbon with folded, notched tails, the dates on it; the crown stands on it. */
function RibbonBanner({ label }: { label: string }) {
  const w = 244;
  const h = 30;
  const tail = 26;
  const drop = 8;
  const total = w + tail * 2;
  return (
    <View style={styles.ribbon}>
      <Svg width={total} height={h + drop}>
        {/* Tails, behind and a shade darker, with a V notch at each end. */}
        <Path d={`M0 ${drop} L${tail + 8} ${drop} L${tail + 8} ${h + drop} L0 ${h + drop} L10 ${drop + h / 2} Z`} fill={GOLD_DEEP} />
        <Path d={`M${total} ${drop} L${total - tail - 8} ${drop} L${total - tail - 8} ${h + drop} L${total} ${h + drop} L${total - 10} ${drop + h / 2} Z`} fill={GOLD_DEEP} />
        {/* The folds where the tails tuck under. */}
        <Path d={`M${tail} ${h} L${tail + 8} ${h + drop} L${tail + 8} ${h} Z`} fill="#8a6418" />
        <Path d={`M${total - tail} ${h} L${total - tail - 8} ${h + drop} L${total - tail - 8} ${h} Z`} fill="#8a6418" />
        <Rect x={tail} y={0} width={w} height={h} fill={GOLD} />
      </Svg>
      <Text style={styles.ribbonText}>{label}</Text>
    </View>
  );
}

const TAPE_H = 18;

/** A tape from off the edge towards the crown, fading into the page as it nears it. */
function Tape({ from, to, fill, text, fade }: { from: { x: number; y: number }; to: { x: number; y: number }; fill: string; text: string; fade: string }) {
  const id = useSvgId('tape');
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const reversed = dx < 0;
  const centre = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  return (
    <View pointerEvents="none" style={[styles.tape, { width: length, left: centre.x - length / 2, top: centre.y - TAPE_H / 2, backgroundColor: fill, transform: [{ rotate: `${reversed ? angle + 180 : angle}deg` }] }]}>
      <Text numberOfLines={1} style={[styles.tapeText, { color: text }, reversed && styles.right]}>
        {Array.from({ length: 6 }, () => 'PRIME MEMBER').join('     ')}
      </Text>
      <Svg style={styles.abs} width={length} height={TAPE_H}>
        <Defs>
          <LinearGradient id={id} x1={reversed ? length : 0} y1={0} x2={reversed ? 0 : length} y2={0} gradientUnits="userSpaceOnUse">
            <Stop offset="0.4" stopColor={fade} stopOpacity={0} />
            <Stop offset="1" stopColor={fade} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={length} height={TAPE_H} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // Bleeds to the screen edges, flush under the bar.
  bleed: { marginHorizontal: -PAGE_PADDING, marginTop: -PAGE_PADDING, paddingTop: 24, paddingBottom: 20, alignItems: 'center', overflow: 'hidden' },
  // D: the next card rises 28dp into the hero's fade.
  joined: { paddingBottom: 48, marginBottom: -28 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0 },
  abs: { position: 'absolute', left: 0, top: 0 },
  right: { textAlign: 'right' },
  title: { fontFamily: Fonts.medium, fontSize: 18, lineHeight: 26 },
  tier: { fontFamily: Fonts.bold, letterSpacing: 0.5 },
  crown: { width: CROWN_W, height: CROWN_H, marginTop: 16 },
  block: { alignSelf: 'stretch', alignItems: 'center', marginTop: 14, gap: 2 },
  afterRibbon: { marginTop: 10 },
  amount: { fontFamily: Fonts.semiBold, fontSize: 40, lineHeight: 48, fontVariant: OPEN_DIGITS },
  paise: { fontSize: 20 },
  caption: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  dates: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18, marginTop: 6, fontVariant: OPEN_DIGITS },
  ribbon: { marginTop: -10, alignItems: 'center', justifyContent: 'flex-start' },
  ribbonText: { position: 'absolute', top: 7, fontFamily: Fonts.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, color: '#3d2a00', fontVariant: OPEN_DIGITS },
  tape: { position: 'absolute', height: TAPE_H, justifyContent: 'center', overflow: 'hidden' },
  tapeText: { fontFamily: Fonts.semiBold, fontSize: 10, lineHeight: 12, letterSpacing: 1.6, paddingHorizontal: 6 },
});
