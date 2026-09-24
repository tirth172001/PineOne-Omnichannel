import { StyleSheet, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useSvgId } from '@/components/shared/hatch';
import { Shape } from '@/constants/shape';

/** 16:9 video placeholder with a play button (web: bg-gradient-to-br from-muted to-muted/60 + PlayCircle). */
export function VideoThumbnail({ radius = Shape.max }: { radius?: number }) {
  const theme = useTheme();
  const id = useSvgId('video-thumb');
  const color = theme.colors.surfaceVariant;
  return (
    <View style={[styles.thumb, { borderRadius: radius }]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={0.6} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      <Icon source="play-circle-fill" size={40} color={theme.colors.onSurface} />
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
