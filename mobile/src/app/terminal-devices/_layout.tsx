import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * In-store devices is a stack: the listing at /terminal-devices, with the
 * audit log pushed on top, sliding in from the right (see InnerPageStack).
 */
export default function TerminalDevicesLayout() {
  return <InnerPageStack />;
}
