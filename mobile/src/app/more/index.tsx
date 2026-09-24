import { ScrollView, StyleSheet } from 'react-native';

import { MoreMenu } from '@/components/more/more-menu';

export default function MoreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <MoreMenu />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
});
