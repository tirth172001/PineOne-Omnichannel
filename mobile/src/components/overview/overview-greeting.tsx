import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Fonts } from '@/constants/theme';
import { CHANNEL_OPTIONS, type ChannelFilter, getTimeOfDayGreeting } from '@/data/overview';

import { FilterMenuButton } from '@/components/shared/controls';
import { OutlineTag } from '@/components/shared/status';
import { StoreScopeNote } from './store-scope';

type OverviewGreetingProps = {
  userName: string;
  roleLabel: string;
  channel: ChannelFilter;
  onChannelChange: (channel: ChannelFilter) => void;
};

/**
 * Top of the Overview (web: the greeting row in home-content.tsx): "Good
 * morning, <name>" with the role badge, which stores the data covers (with
 * "Change store"), and the channel filter. The web puts the filter at the end
 * of the same row; on a phone it drops onto its own line.
 */
export function OverviewGreeting({ userName, roleLabel, channel, onChannelChange }: OverviewGreetingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.greeting} accessibilityRole="header">
          {getTimeOfDayGreeting()}, {userName}
        </Text>
        <OutlineTag label={roleLabel} />
      </View>
      <StoreScopeNote />
      <View style={styles.filters}>
        <FilterMenuButton
          value={channel}
          onValueChange={onChannelChange}
          options={CHANNEL_OPTIONS}
          accessibilityLabel="Channel"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 4 },
  // Web: text-2xl font-semibold leading-[1.3].
  greeting: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 31 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
});
