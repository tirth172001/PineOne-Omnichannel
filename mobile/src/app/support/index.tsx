import { ScrollView, StyleSheet } from 'react-native';

import { SupportLanding } from '@/components/support/support-landing';

export default function SupportScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SupportLanding />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
});
