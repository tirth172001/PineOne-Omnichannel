import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { OutlineTag } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import { getTimeOfDayGreeting } from '@/data/overview';

/**
 * Top of the Overview (web: the greeting row in home-content.tsx): "Good
 * morning, <name>" with the role badge. The web's store note and channel
 * filter live in the header switcher on mobile (global switching only).
 */
export function OverviewGreeting({ userName, roleLabel }: { userName: string; roleLabel: string }) {
  return (
    <View style={styles.titleRow}>
      <Text style={styles.greeting} accessibilityRole="header">
        {getTimeOfDayGreeting()}, {userName}
      </Text>
      <OutlineTag label={roleLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 4 },
  // Web: text-2xl font-semibold leading-[1.3].
  greeting: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 31 },
});
