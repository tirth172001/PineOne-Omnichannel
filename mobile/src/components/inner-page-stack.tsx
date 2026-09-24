import Stack from 'expo-router/js-stack';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * A tab's stack (Payments, Settlements, More): its root screen with inner
 * pages pushed on top. Inner pages slide in from the right when opened and
 * back out to the right on Back (user decision), with the tab page — header
 * and navigation bar included — easing left underneath, on every platform.
 * The JS stack is used because the native stack doesn't animate on web.
 * Screens draw their own chrome, so the stack's header is off; inner pages
 * keep clear of the home indicator here, as they have no navigation bar.
 */
export function InnerPageStack() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        cardStyle: { backgroundColor: theme.colors.background, paddingBottom: route.name === 'index' ? 0 : insets.bottom },
      })}
    />
  );
}
