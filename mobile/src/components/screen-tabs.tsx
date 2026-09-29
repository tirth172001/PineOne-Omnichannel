import { useTheme } from 'react-native-paper';

import { Tabs, type TabItem } from '@/components/material3/tabs';
import { concentric, Shape } from '@/constants/shape';

type ScreenTabsProps = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
};

// Inset inside the shell's top bar: same 12dp side margin as the header row,
// plus 4dp at the bottom so the underline clears the bar's rounded corners.
const INSET_X = 12;
const INSET_BOTTOM = 4;
const TRIGGER_HEIGHT = 40;

/**
 * The app shell's sub-tab row (Figma node 47:2371), rendered inside the
 * shell's rounded top bar under the header. Screens don't render this directly;
 * they call useShellTabs(). M3 secondary tabs with the Figma black underline.
 */
export function ScreenTabs({ tabs, activeKey, onChange }: ScreenTabsProps) {
  const theme = useTheme();

  return (
    <Tabs
      variant="secondary"
      tabs={tabs}
      activeKey={activeKey}
      onChange={onChange}
      indicatorColor={theme.colors.onSurface}
      tabRadius={concentric(Shape.max, INSET_BOTTOM, TRIGGER_HEIGHT)}
      // Transparent: the shell paints the surface behind them (faded in once they dock under the header).
      style={{ paddingTop: 12, paddingHorizontal: INSET_X, paddingBottom: INSET_BOTTOM, borderBottomWidth: 0, backgroundColor: 'transparent' }}
    />
  );
}
