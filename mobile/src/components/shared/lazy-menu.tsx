import { type ComponentProps, useState } from 'react';
import { Menu } from 'react-native-paper';

type MenuProps = ComponentProps<typeof Menu>;

/**
 * Paper's Menu, mounted only once it's first opened. On web, Paper runs its
 * hide step when a Menu mounts closed, which focuses the anchor button — and
 * the browser scrolls that button into view, so a list of row menus jumped
 * the page to its last row on load. Until then the anchor renders on its own.
 */
export function LazyMenu(props: MenuProps) {
  const [opened, setOpened] = useState(props.visible);
  if (props.visible && !opened) setOpened(true);
  if (!opened && !('x' in (props.anchor as object))) return <>{props.anchor}</>;
  return <Menu {...props} />;
}
