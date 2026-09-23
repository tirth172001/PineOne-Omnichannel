import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

/** SVG ids can't contain the colons React's useId() produces. */
export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/**
 * The diagonal-stripe texture every web Overview chart lays over its flat
 * color (web: BAR_HATCH_BACKGROUND_IMAGE, a 45° white stripe every 10px).
 * Place inside an SVG's <Defs> and fill or stroke with `url(#id)`.
 */
export function HatchPattern({ id, color }: { id: string; color: string }) {
  return (
    <Pattern id={id} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
      <Rect width="10" height="10" fill={color} />
      <Line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
    </Pattern>
  );
}

/** Fills its (positioned) parent with the hatched color, e.g. a bar or a progress fill. */
export function HatchedFill({ color }: { color: string }) {
  const id = useSvgId('hatch');
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <HatchPattern id={id} color={color} />
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
