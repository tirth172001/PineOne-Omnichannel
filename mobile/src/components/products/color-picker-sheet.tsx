import { useState } from 'react';
import { type GestureResponderEvent, type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useSvgId } from '@/components/shared/hatch';
import { FormField, FormTextInput } from '@/components/shared/form-fields';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { DEFAULT_CHECKOUT_COLOR, hexToHsv, type Hsv, hsvToHex } from '@/data/checkout';

const HUE_STOPS = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'];
const THUMB = 14;
const HUE_BAR = 12;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Tracks a drag across a box and reports the touch position as 0–1 fractions. */
function useDragArea(onMove: (x: number, y: number) => void) {
  const [size, setSize] = useState({ width: 1, height: 1 });
  const handle = (event: GestureResponderEvent) =>
    onMove(clamp(event.nativeEvent.locationX / size.width), clamp(event.nativeEvent.locationY / size.height));
  return {
    size,
    handlers: {
      onLayout: (event: LayoutChangeEvent) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }),
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      // Keep the drag when the finger strays; don't let the sheet's scroll steal it.
      onResponderTerminationRequest: () => false,
      onResponderGrant: handle,
      onResponderMove: handle,
    },
  };
}

/**
 * Colour picker (web: ColorPickerPopover): a saturation/brightness square and
 * a hue bar you drag across, the hex value, and Done. The web's popover opens
 * as a bottom sheet on a phone.
 */
export function ColorPickerSheet({
  visible,
  onDismiss,
  value,
  onChange,
  title,
}: {
  visible: boolean;
  onDismiss: () => void;
  value: string | null;
  onChange: (hex: string) => void;
  title: string;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value ?? DEFAULT_CHECKOUT_COLOR));
  const [hex, setHex] = useState(value ?? DEFAULT_CHECKOUT_COLOR);
  // Re-seed from the current colour each time the sheet opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      const base = value ?? DEFAULT_CHECKOUT_COLOR;
      setHex(base);
      setHsv(hexToHsv(base));
    }
  }
  const apply = (next: Hsv) => {
    setHsv(next);
    setHex(hsvToHex(next.h, next.s, next.v));
  };

  const square = useDragArea((x, y) => apply({ ...hsv, s: x, v: 1 - y }));
  const hue = useDragArea((x) => apply({ ...hsv, h: Math.min(359.9, x * 360) }));
  const whiteId = useSvgId('sv-white');
  const blackId = useSvgId('sv-black');
  const hueId = useSvgId('hue');
  const pureHue = hsvToHex(hsv.h, 1, 1);

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      height={560}
      footer={
        <Button
          mode="contained"
          onPress={() => {
            onChange(hex);
            onDismiss();
          }}
          style={styles.button}>
          Done
        </Button>
      }>
      <PanelSection last>
        <View {...square.handlers} accessibilityLabel="Saturation and brightness" style={[styles.square, { backgroundColor: pureHue }]}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
            <Defs>
              <LinearGradient id={whiteId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#ffffff" stopOpacity={1} />
                <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id={blackId} x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0" stopColor="#000000" stopOpacity={1} />
                <Stop offset="1" stopColor="#000000" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#${whiteId})`} />
            <Rect width="100%" height="100%" fill={`url(#${blackId})`} />
          </Svg>
          <View
            pointerEvents="none"
            style={[styles.thumb, { left: hsv.s * square.size.width - THUMB / 2, top: (1 - hsv.v) * square.size.height - THUMB / 2 }]}
          />
        </View>
        <View {...hue.handlers} accessibilityLabel="Hue" style={styles.hue}>
          <Svg style={styles.hueBar} width="100%" height={HUE_BAR} pointerEvents="none">
            <Defs>
              <LinearGradient id={hueId} x1="0" y1="0" x2="1" y2="0">
                {HUE_STOPS.map((color, index) => (
                  <Stop key={index} offset={index / (HUE_STOPS.length - 1)} stopColor={color} />
                ))}
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" rx={6} fill={`url(#${hueId})`} />
          </Svg>
          <View pointerEvents="none" style={[styles.hueThumb, { left: (hsv.h / 360) * hue.size.width - 8 }]} />
        </View>
        <FormField label="Hex">
          <FormTextInput
            value={hex}
            onChangeText={(raw) => {
              setHex(raw);
              if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) setHsv(hexToHsv(raw));
            }}
            accessibilityLabel="Hex colour"
          />
        </FormField>
      </PanelSection>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: PANEL_INNER_RADIUS },
  square: { height: 176, borderRadius: PANEL_INNER_RADIUS, overflow: 'hidden' },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, borderWidth: 2, borderColor: '#ffffff' },
  // A taller touch target around the 12dp bar.
  hue: { height: 32, justifyContent: 'center' },
  hueBar: { position: 'absolute', left: 0, right: 0, top: (32 - HUE_BAR) / 2 },
  hueThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
});
