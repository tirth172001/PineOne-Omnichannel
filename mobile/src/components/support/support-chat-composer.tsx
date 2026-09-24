import { Image } from 'expo-image';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, IconButton, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { useToast } from '@/hooks/use-toast';

const PADDING = 12;
const INNER_RADIUS = concentric(Shape.max, PADDING);

/** The web's Figma-exported support mark, rasterised from its SVG (blur filters don't render in react-native-svg). */
export function SupportHeroIcon({ size }: { size: number }) {
  return (
    <Image
      source={require('@/assets/images/support/support-hero-icon.png')}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

/**
 * Support chat composer (web: SupportChatComposer), shared by the Support
 * landing and the chat screen: the input, an attach button, and Ask.
 */
export function SupportChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder = 'Describe your issue or ask anything...',
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  const theme = useTheme();
  const toast = useToast();
  return (
    <View style={[styles.composer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <TextInput
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        returnKeyType="send"
        accessibilityLabel={placeholder}
        style={[styles.input, { color: theme.colors.onSurface }]}
      />
      <View style={styles.actions}>
        <IconButton
          icon="plus"
          mode="outlined"
          size={16}
          onPress={() => toast("Attachments aren't available in this demo")}
          accessibilityLabel="Attach file"
          iconColor={theme.colors.onSurfaceVariant}
          style={[styles.attach, { borderColor: theme.colors.outlineVariant }]}
        />
        <Button
          mode="contained"
          icon="arrow-up"
          onPress={onSubmit}
          accessibilityLabel="Send message"
          contentStyle={styles.askContent}
          style={styles.ask}>
          Ask
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: { borderWidth: 1, borderRadius: Shape.max, padding: PADDING, gap: 12 },
  input: { fontFamily: Fonts.regular, fontSize: 16, minHeight: 24 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attach: { margin: 0, width: 36, height: 36, borderRadius: INNER_RADIUS },
  ask: { borderRadius: INNER_RADIUS },
  askContent: { flexDirection: 'row-reverse', height: 36 },
});
