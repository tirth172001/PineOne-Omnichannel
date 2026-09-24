import type { Icon } from 'phosphor-react-native';
import type { ComponentProps } from 'react';
import type { PaperProvider } from 'react-native-paper';
// Per-icon deep imports keep the bundle to the icons registered here, not all ~1,500.
import { ArrowCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowCounterClockwise';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { ArrowsClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsClockwise';
import { MonitorIcon } from 'phosphor-react-native/src/icons/Monitor';
import { GraduationCapIcon } from 'phosphor-react-native/src/icons/GraduationCap';
import { PlayCircleIcon } from 'phosphor-react-native/src/icons/PlayCircle';
import { BatteryFullIcon } from 'phosphor-react-native/src/icons/BatteryFull';
import { WifiHighIcon } from 'phosphor-react-native/src/icons/WifiHigh';
import { ThumbsUpIcon } from 'phosphor-react-native/src/icons/ThumbsUp';
import { ThumbsDownIcon } from 'phosphor-react-native/src/icons/ThumbsDown';
import { UploadSimpleIcon } from 'phosphor-react-native/src/icons/UploadSimple';
import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { ArrowUpIcon } from 'phosphor-react-native/src/icons/ArrowUp';
import { ArrowUpRightIcon } from 'phosphor-react-native/src/icons/ArrowUpRight';
import { BankIcon } from 'phosphor-react-native/src/icons/Bank';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BriefcaseIcon } from 'phosphor-react-native/src/icons/Briefcase';
import { BuildingsIcon } from 'phosphor-react-native/src/icons/Buildings';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CalendarDotsIcon } from 'phosphor-react-native/src/icons/CalendarDots';
import { CaretDoubleLeftIcon } from 'phosphor-react-native/src/icons/CaretDoubleLeft';
import { CaretDoubleRightIcon } from 'phosphor-react-native/src/icons/CaretDoubleRight';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { CaretUpIcon } from 'phosphor-react-native/src/icons/CaretUp';
import { CashRegisterIcon } from 'phosphor-react-native/src/icons/CashRegister';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { ChatCenteredTextIcon } from 'phosphor-react-native/src/icons/ChatCenteredText';
import { ChatCircleIcon } from 'phosphor-react-native/src/icons/ChatCircle';
import { ChatTextIcon } from 'phosphor-react-native/src/icons/ChatText';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { ClockCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ClockCounterClockwise';
import { CopyIcon } from 'phosphor-react-native/src/icons/Copy';
import { CreditCardIcon } from 'phosphor-react-native/src/icons/CreditCard';
import { DotsThreeCircleIcon } from 'phosphor-react-native/src/icons/DotsThreeCircle';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { DownloadSimpleIcon } from 'phosphor-react-native/src/icons/DownloadSimple';
import { EnvelopeSimpleIcon } from 'phosphor-react-native/src/icons/EnvelopeSimple';
import { FileIcon } from 'phosphor-react-native/src/icons/File';
import { FilePdfIcon } from 'phosphor-react-native/src/icons/FilePdf';
import { FileTextIcon } from 'phosphor-react-native/src/icons/FileText';
import { FileXlsIcon } from 'phosphor-react-native/src/icons/FileXls';
import { FunnelSimpleIcon } from 'phosphor-react-native/src/icons/FunnelSimple';
import { GearIcon } from 'phosphor-react-native/src/icons/Gear';
import { GlobeIcon } from 'phosphor-react-native/src/icons/Globe';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { KeyboardIcon } from 'phosphor-react-native/src/icons/Keyboard';
import { LinkSimpleIcon } from 'phosphor-react-native/src/icons/LinkSimple';
import { ListIcon } from 'phosphor-react-native/src/icons/List';
import { ListBulletsIcon } from 'phosphor-react-native/src/icons/ListBullets';
import { LockSimpleIcon } from 'phosphor-react-native/src/icons/LockSimple';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { MoneyIcon } from 'phosphor-react-native/src/icons/Money';
import { MoneyWavyIcon } from 'phosphor-react-native/src/icons/MoneyWavy';
import { PaperPlaneRightIcon } from 'phosphor-react-native/src/icons/PaperPlaneRight';
import { PencilSimpleIcon } from 'phosphor-react-native/src/icons/PencilSimple';
import { PlayIcon } from 'phosphor-react-native/src/icons/Play';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { PrinterIcon } from 'phosphor-react-native/src/icons/Printer';
import { QrCodeIcon } from 'phosphor-react-native/src/icons/QrCode';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import { ReceiptIcon } from 'phosphor-react-native/src/icons/Receipt';
import { RecordIcon } from 'phosphor-react-native/src/icons/Record';
import { RowsIcon } from 'phosphor-react-native/src/icons/Rows';
import { ShareNetworkIcon } from 'phosphor-react-native/src/icons/ShareNetwork';
import { ShieldCheckIcon } from 'phosphor-react-native/src/icons/ShieldCheck';
import { ShoppingCartIcon } from 'phosphor-react-native/src/icons/ShoppingCart';
import { SidebarSimpleIcon } from 'phosphor-react-native/src/icons/SidebarSimple';
import { SignOutIcon } from 'phosphor-react-native/src/icons/SignOut';
import { SortAscendingIcon } from 'phosphor-react-native/src/icons/SortAscending';
import { SquaresFourIcon } from 'phosphor-react-native/src/icons/SquaresFour';
import { StorefrontIcon } from 'phosphor-react-native/src/icons/Storefront';
import { TrashIcon } from 'phosphor-react-native/src/icons/Trash';
import { TrendDownIcon } from 'phosphor-react-native/src/icons/TrendDown';
import { TrendUpIcon } from 'phosphor-react-native/src/icons/TrendUp';
import { UserCircleIcon } from 'phosphor-react-native/src/icons/UserCircle';
import { UsersIcon } from 'phosphor-react-native/src/icons/Users';
import { WalletIcon } from 'phosphor-react-native/src/icons/Wallet';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';
import { WhatsappLogoIcon } from 'phosphor-react-native/src/icons/WhatsappLogo';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { ChartPieIcon } from 'phosphor-react-native/src/icons/ChartPie';
import { WarningIcon } from 'phosphor-react-native/src/icons/Warning';
import { DevicesIcon } from 'phosphor-react-native/src/icons/Devices';
import { ArrowUUpLeftIcon } from 'phosphor-react-native/src/icons/ArrowUUpLeft';
import { GavelIcon } from 'phosphor-react-native/src/icons/Gavel';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { DeviceMobileIcon } from 'phosphor-react-native/src/icons/DeviceMobile';
import { DesktopIcon } from 'phosphor-react-native/src/icons/Desktop';
import { SlidersIcon } from 'phosphor-react-native/src/icons/Sliders';
import { ArrowsCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsCounterClockwise';
import { ArrowDownIcon } from 'phosphor-react-native/src/icons/ArrowDown';
import { SpinnerIcon } from 'phosphor-react-native/src/icons/Spinner';
import { ChecksIcon } from 'phosphor-react-native/src/icons/Checks';
import { LightningIcon } from 'phosphor-react-native/src/icons/Lightning';
import { FastForwardIcon } from 'phosphor-react-native/src/icons/FastForward';
import { HourglassIcon } from 'phosphor-react-native/src/icons/Hourglass';
import { HeadphonesIcon } from 'phosphor-react-native/src/icons/Headphones';
import { CircleDashedIcon } from 'phosphor-react-native/src/icons/CircleDashed';
import { CircleIcon } from 'phosphor-react-native/src/icons/Circle';
import { SlidersHorizontalIcon } from 'phosphor-react-native/src/icons/SlidersHorizontal';
import { ArrowClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowClockwise';
import { GridFourIcon } from 'phosphor-react-native/src/icons/GridFour';
import { MinusIcon } from 'phosphor-react-native/src/icons/Minus';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { XCircleIcon } from 'phosphor-react-native/src/icons/XCircle';

/**
 * Every Phosphor icon the app can render, keyed by its Phosphor name
 * (phosphoricons.com). Add an entry here before using a new icon.
 */
const ICONS = {
  'arrows-left-right': ArrowsLeftRightIcon,
  'upload-simple': UploadSimpleIcon,
  'monitor': MonitorIcon,
  'graduation-cap': GraduationCapIcon,
  'play-circle': PlayCircleIcon,
  'battery-full': BatteryFullIcon,
  'wifi-high': WifiHighIcon,
  'thumbs-up': ThumbsUpIcon,
  'thumbs-down': ThumbsDownIcon,
  'arrow-counter-clockwise': ArrowCounterClockwiseIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-up-right': ArrowUpRightIcon,
  'arrows-clockwise': ArrowsClockwiseIcon,
  bank: BankIcon,
  bell: BellIcon,
  briefcase: BriefcaseIcon,
  buildings: BuildingsIcon,
  'calendar-blank': CalendarBlankIcon,
  'calendar-dots': CalendarDotsIcon,
  'caret-double-left': CaretDoubleLeftIcon,
  'caret-double-right': CaretDoubleRightIcon,
  'caret-down': CaretDownIcon,
  'caret-left': CaretLeftIcon,
  'caret-right': CaretRightIcon,
  'caret-up': CaretUpIcon,
  'cash-register': CashRegisterIcon,
  'chart-bar': ChartBarIcon,
  'chat-centered-text': ChatCenteredTextIcon,
  'chat-circle': ChatCircleIcon,
  'chat-text': ChatTextIcon,
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  clock: ClockIcon,
  'clock-counter-clockwise': ClockCounterClockwiseIcon,
  copy: CopyIcon,
  'credit-card': CreditCardIcon,
  'dots-three-circle': DotsThreeCircleIcon,
  'dots-three-vertical': DotsThreeVerticalIcon,
  'download-simple': DownloadSimpleIcon,
  'envelope-simple': EnvelopeSimpleIcon,
  file: FileIcon,
  'file-pdf': FilePdfIcon,
  'file-text': FileTextIcon,
  'file-xls': FileXlsIcon,
  'funnel-simple': FunnelSimpleIcon,
  gear: GearIcon,
  globe: GlobeIcon,
  house: HouseIcon,
  info: InfoIcon,
  keyboard: KeyboardIcon,
  'link-simple': LinkSimpleIcon,
  list: ListIcon,
  'list-bullets': ListBulletsIcon,
  'lock-simple': LockSimpleIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  money: MoneyIcon,
  'money-wavy': MoneyWavyIcon,
  'paper-plane-right': PaperPlaneRightIcon,
  'pencil-simple': PencilSimpleIcon,
  play: PlayIcon,
  plus: PlusIcon,
  printer: PrinterIcon,
  'qr-code': QrCodeIcon,
  question: QuestionIcon,
  receipt: ReceiptIcon,
  record: RecordIcon,
  rows: RowsIcon,
  'share-network': ShareNetworkIcon,
  'shield-check': ShieldCheckIcon,
  'shopping-cart': ShoppingCartIcon,
  'sidebar-simple': SidebarSimpleIcon,
  'sign-out': SignOutIcon,
  'sort-ascending': SortAscendingIcon,
  'squares-four': SquaresFourIcon,
  storefront: StorefrontIcon,
  trash: TrashIcon,
  'trend-down': TrendDownIcon,
  'trend-up': TrendUpIcon,
  'user-circle': UserCircleIcon,
  users: UsersIcon,
  wallet: WalletIcon,
  'warning-circle': WarningCircleIcon,
  'whatsapp-logo': WhatsappLogoIcon,
  x: XIcon,
  'x-circle': XCircleIcon,
  funnel: FunnelIcon,
  'chart-pie': ChartPieIcon,
  warning: WarningIcon,
  devices: DevicesIcon,
  'arrow-u-up-left': ArrowUUpLeftIcon,
  gavel: GavelIcon,
  'calendar-check': CalendarCheckIcon,
  'device-mobile': DeviceMobileIcon,
  desktop: DesktopIcon,
  sliders: SlidersIcon,
  'arrows-counter-clockwise': ArrowsCounterClockwiseIcon,
  'arrow-down': ArrowDownIcon,
  spinner: SpinnerIcon,
  checks: ChecksIcon,
  lightning: LightningIcon,
  'fast-forward': FastForwardIcon,
  hourglass: HourglassIcon,
  headphones: HeadphonesIcon,
  'circle-dashed': CircleDashedIcon,
  circle: CircleIcon,
  'sliders-horizontal': SlidersHorizontalIcon,
  'arrow-clockwise': ArrowClockwiseIcon,
  'grid-four': GridFourIcon,
  minus: MinusIcon,
} satisfies Record<string, Icon>;

export type BaseIconName = keyof typeof ICONS;
/** A Phosphor name, optionally with `-fill` for the filled weight (used for active/selected state). */
export type IconName = BaseIconName | `${BaseIconName}-fill`;

export const ICON_NAMES = Object.keys(ICONS) as BaseIconName[];

// Material Design Icons names that react-native-paper and react-native-paper-dates
// pass internally (dropdown carets, pagination, picker mode toggles…), mapped to
// the Phosphor equivalent so library chrome matches the rest of the app too.
const LIBRARY_ALIASES: Partial<Record<string, BaseIconName>> = {
  'arrow-left': 'arrow-left',
  'arrow-up': 'arrow-up',
  calendar: 'calendar-blank',
  'calendar-blank': 'calendar-blank',
  check: 'check',
  'chevron-down': 'caret-down',
  'chevron-left': 'caret-left',
  'chevron-right': 'caret-right',
  'chevron-up': 'caret-up',
  'clock-outline': 'clock',
  close: 'x',
  'dots-vertical': 'dots-three-vertical',
  keyboard: 'keyboard',
  'keyboard-outline': 'keyboard',
  magnify: 'magnifying-glass',
  'menu-down': 'caret-down',
  'page-first': 'caret-double-left',
  'page-last': 'caret-double-right',
  'pencil-outline': 'pencil-simple',
};

const warned = new Set<string>();

function resolve(name: string): { icon: Icon; filled: boolean } {
  const filled = name.endsWith('-fill');
  const base = filled ? name.slice(0, -'-fill'.length) : name;
  const alias: BaseIconName | undefined = LIBRARY_ALIASES[base];
  const icon = (ICONS as Record<string, Icon | undefined>)[base] ?? (alias ? ICONS[alias] : undefined);
  if (icon) return { icon, filled };
  if (__DEV__ && !warned.has(name)) {
    warned.add(name);
    console.warn(`[icons] "${name}" isn't registered in src/components/icons.tsx — rendering a placeholder.`);
  }
  return { icon: QuestionIcon, filled: false };
}

type AppIconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

/** Renders a Phosphor icon by name, for places that don't go through a Paper `icon` prop. */
export function AppIcon({ name, size = 24, color }: AppIconProps) {
  const { icon: PhosphorIcon, filled } = resolve(name);
  return <PhosphorIcon size={size} color={color} weight={filled ? 'fill' : 'regular'} />;
}

/**
 * Pass to <PaperProvider settings={paperIconSettings}> so every Paper `icon`
 * string (Button, IconButton, List.Icon, BottomNavigation, Chip…) renders
 * through Phosphor instead of Material Design Icons.
 */
export const paperIconSettings: NonNullable<ComponentProps<typeof PaperProvider>['settings']> = {
  icon: ({ name, color, size, direction, testID }) => {
    const { icon: PhosphorIcon, filled } = resolve(name);
    return (
      <PhosphorIcon
        size={size}
        color={color}
        weight={filled ? 'fill' : 'regular'}
        mirrored={direction === 'rtl'}
        testID={testID}
      />
    );
  },
};
