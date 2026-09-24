import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Fonts } from '@/constants/theme';
import { getTimeOfDayGreeting } from '@/data/overview';

/**
 * Top of the Overview (web: the greeting row in home-content.tsx): "Good
 * morning, <name>". The role badge sits with the name in the header on
 * mobile, and the web's store note and channel filter live in the header
 * switcher (global switching only).
 */
export function OverviewGreeting({ userName }: { userName: string }) {
  return (
    <View style={styles.titleRow}>
      <Text style={styles.greeting} accessibilityRole="header">
        {getTimeOfDayGreeting()}, {userName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 4 },
  // Web: text-2xl font-semibold leading-[1.3].
  greeting: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 31 },
});
