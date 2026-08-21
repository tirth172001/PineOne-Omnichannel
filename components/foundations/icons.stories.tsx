import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

import * as PhosphorIcons from "@phosphor-icons/react"
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  ArrowUpRightIcon,
  ArrowsDownUpIcon,
  ArrowsLeftRightIcon,
  ArrowsOutCardinalIcon,
  ArrowsOutIcon,
  BankIcon,
  BellIcon,
  BellRingingIcon,
  BracketsCurlyIcon,
  BuildingsIcon,
  CalculatorIcon,
  CalendarDotsIcon,
  CalendarIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  ChartBarIcon,
  ChatIcon,
  ChatTextIcon,
  CheckCircleIcon,
  CheckIcon,
  ChecksIcon,
  CircleDashedIcon,
  CircleIcon,
  ClockIcon,
  ColumnsIcon,
  CopyIcon,
  CreditCardIcon,
  CurrencyInrIcon,
  CursorIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  DevicesIcon,
  DotsSixVerticalIcon,
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  DownloadIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  FastForwardIcon,
  FileArrowUpIcon,
  FileTextIcon,
  FunnelIcon,
  GavelIcon,
  GearIcon,
  GlobeIcon,
  GridFourIcon,
  HandCoinsIcon,
  HandshakeIcon,
  HardDrivesIcon,
  HeadphonesIcon,
  HourglassIcon,
  HouseIcon,
  InfoIcon,
  KeyIcon,
  LifebuoyIcon,
  LightbulbIcon,
  LightningIcon,
  LinkIcon,
  ListIcon,
  LockKeyIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MegaphoneIcon,
  MicrosoftExcelLogoIcon,
  MinusIcon,
  MoneyIcon,
  MonitorIcon,
  MoonIcon,
  PackageIcon,
  PaletteIcon,
  PaperPlaneRightIcon,
  PathIcon,
  PauseCircleIcon,
  PauseIcon,
  PencilLineIcon,
  PencilSimpleIcon,
  PercentIcon,
  PhoneIcon,
  PlayCircleIcon,
  PlugIcon,
  PlusIcon,
  PushPinIcon,
  PushPinSlashIcon,
  QrCodeIcon,
  QuestionIcon,
  RadioIcon,
  ReceiptIcon,
  RecordIcon,
  RepeatIcon,
  RobotIcon,
  ShieldCheckIcon,
  ShieldIcon,
  ShieldSlashIcon,
  ShieldWarningIcon,
  SidebarIcon,
  SignOutIcon,
  SlidersHorizontalIcon,
  SlidersIcon,
  SparkleIcon,
  SpinnerIcon,
  SquaresFourIcon,
  StorefrontIcon,
  SunIcon,
  TrashIcon,
  TrendDownIcon,
  TrendUpIcon,
  TruckIcon,
  UploadIcon,
  UserCircleIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
  WalletIcon,
  WarningCircleIcon,
  WarningIcon,
  WaveformIcon,
  WebhooksLogoIcon,
  WifiHighIcon,
  WifiSlashIcon,
  WrenchIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react"

import { IconGrid } from "./foundation-primitives"

// The full Phosphor set, derived from the package's own exports rather than
// hand-listed — stays accurate as @phosphor-icons/react is upgraded. Every
// icon is exported twice (bare name + `Icon`-suffixed alias); filtering to
// the suffixed form gives one entry per icon and matches this repo's own
// import convention.
function AllIconsBrowser() {
  const [query, setQuery] = React.useState("")

  const allIcons = React.useMemo(() => {
    return Object.entries(PhosphorIcons)
      .filter((entry): entry is [string, PhosphorIcons.Icon] => {
        const [name, value] = entry
        // Icon components are React.forwardRef(...) objects, not plain
        // functions — check for a truthy value, not `typeof === "function"`.
        return name.endsWith("Icon") && value != null && typeof value === "object"
      })
      .map(([name, icon]) => ({ name: name.replace(/Icon$/, ""), icon }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allIcons
    return allIcons.filter((item) => item.name.toLowerCase().includes(q))
  }, [allIcons, query])

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`Search ${allIcons.length} icons…`}
        className="mb-2 w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} of {allIcons.length} icons — import the <code>Icon</code>-suffixed name from{" "}
        <code>@phosphor-icons/react</code> (e.g. <code>{filtered[0]?.name ?? "Acorn"}Icon</code>).
      </p>
      <IconGrid icons={filtered} />
    </div>
  )
}

// Documentation-only: renders the actual Phosphor icon components imported
// across the app, not a component with props — no `component` to satisfy
// Meta's typing here.
const meta = {
  title: "Foundations/Icons",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "**@phosphor-icons/react** is the canonical icon library for this codebase. `lucide-react` and the unused `@hugeicons/react` / `@hugeicons/core-free-icons` packages have been removed.\n\n**Import convention:** always import the `Icon`-suffixed name (`CaretDownIcon`, not `CaretDown`) — Phosphor exports both a bare name and an `Icon`-suffixed alias per icon; standardizing on the suffixed form keeps every call site consistent and avoids collisions with unrelated identifiers (e.g. a `Search` handler function next to a `Search` icon).\n\n**Weight:** Phosphor icons accept a `weight` prop (`thin` / `light` / `regular` / `bold` / `fill` / `duotone`). Leave it unset — the default (`regular`) is the closest visual match to the stroke width this app was designed against. Only reach for another weight with a specific, deliberate reason (e.g. `fill` for a selected/active state).\n\nThe grid below is every icon actually imported somewhere in `components/` or `app/` today, grouped by rough purpose — not the full ~3,000-icon Phosphor set. Browse the full set at phosphoricons.com before reaching for a net-new icon."
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Navigation & layout
        </h3>
        <IconGrid
          icons={[
            { name: "ArrowLeft", icon: ArrowLeftIcon },
            { name: "ArrowRight", icon: ArrowRightIcon },
            { name: "ArrowSquareOut", icon: ArrowSquareOutIcon },
            { name: "ArrowUpRight", icon: ArrowUpRightIcon },
            { name: "ArrowsDownUp", icon: ArrowsDownUpIcon },
            { name: "ArrowsLeftRight", icon: ArrowsLeftRightIcon },
            { name: "ArrowsOutCardinal", icon: ArrowsOutCardinalIcon },
            { name: "ArrowsOut", icon: ArrowsOutIcon },
            { name: "CaretDoubleLeft", icon: CaretDoubleLeftIcon },
            { name: "CaretDoubleRight", icon: CaretDoubleRightIcon },
            { name: "CaretDown", icon: CaretDownIcon },
            { name: "CaretLeft", icon: CaretLeftIcon },
            { name: "CaretRight", icon: CaretRightIcon },
            { name: "CaretUp", icon: CaretUpIcon },
            { name: "CaretUpDown", icon: CaretUpDownIcon },
            { name: "Sidebar", icon: SidebarIcon },
            { name: "List", icon: ListIcon },
            { name: "GridFour", icon: GridFourIcon },
            { name: "SquaresFour", icon: SquaresFourIcon },
            { name: "Columns", icon: ColumnsIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Actions & editing
        </h3>
        <IconGrid
          icons={[
            { name: "Check", icon: CheckIcon },
            { name: "CheckCircle", icon: CheckCircleIcon },
            { name: "Checks", icon: ChecksIcon },
            { name: "X", icon: XIcon },
            { name: "XCircle", icon: XCircleIcon },
            { name: "Plus", icon: PlusIcon },
            { name: "Minus", icon: MinusIcon },
            { name: "Trash", icon: TrashIcon },
            { name: "Copy", icon: CopyIcon },
            { name: "PencilSimple", icon: PencilSimpleIcon },
            { name: "PencilLine", icon: PencilLineIcon },
            { name: "Download", icon: DownloadIcon },
            { name: "Upload", icon: UploadIcon },
            { name: "FileArrowUp", icon: FileArrowUpIcon },
            { name: "Funnel", icon: FunnelIcon },
            { name: "MagnifyingGlass", icon: MagnifyingGlassIcon },
            { name: "Sliders", icon: SlidersIcon },
            { name: "SlidersHorizontal", icon: SlidersHorizontalIcon },
            { name: "ArrowClockwise", icon: ArrowClockwiseIcon },
            { name: "ArrowCounterClockwise", icon: ArrowCounterClockwiseIcon },
            { name: "Repeat", icon: RepeatIcon },
            { name: "DotsThree", icon: DotsThreeIcon },
            { name: "DotsThreeVertical", icon: DotsThreeVerticalIcon },
            { name: "DotsSixVertical", icon: DotsSixVerticalIcon },
            { name: "Link", icon: LinkIcon },
            { name: "PushPin", icon: PushPinIcon },
            { name: "PushPinSlash", icon: PushPinSlashIcon },
            { name: "Cursor", icon: CursorIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Status & feedback
        </h3>
        <IconGrid
          icons={[
            { name: "Info", icon: InfoIcon },
            { name: "Warning", icon: WarningIcon },
            { name: "WarningCircle", icon: WarningCircleIcon },
            { name: "Shield", icon: ShieldIcon },
            { name: "ShieldCheck", icon: ShieldCheckIcon },
            { name: "ShieldSlash", icon: ShieldSlashIcon },
            { name: "ShieldWarning", icon: ShieldWarningIcon },
            { name: "Spinner", icon: SpinnerIcon },
            { name: "Hourglass", icon: HourglassIcon },
            { name: "Clock", icon: ClockIcon },
            { name: "Circle", icon: CircleIcon },
            { name: "CircleDashed", icon: CircleDashedIcon },
            { name: "Record", icon: RecordIcon },
            { name: "Bell", icon: BellIcon },
            { name: "BellRinging", icon: BellRingingIcon },
            { name: "Lightbulb", icon: LightbulbIcon },
            { name: "Sparkle", icon: SparkleIcon },
            { name: "Question", icon: QuestionIcon },
            { name: "Lightning", icon: LightningIcon },
            { name: "Sun", icon: SunIcon },
            { name: "Moon", icon: MoonIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Communication & support
        </h3>
        <IconGrid
          icons={[
            { name: "Chat", icon: ChatIcon },
            { name: "ChatText", icon: ChatTextIcon },
            { name: "EnvelopeSimple", icon: EnvelopeSimpleIcon },
            { name: "Phone", icon: PhoneIcon },
            { name: "Headphones", icon: HeadphonesIcon },
            { name: "Lifebuoy", icon: LifebuoyIcon },
            { name: "Megaphone", icon: MegaphoneIcon },
            { name: "PaperPlaneRight", icon: PaperPlaneRightIcon },
            { name: "Robot", icon: RobotIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Finance & commerce
        </h3>
        <IconGrid
          icons={[
            { name: "Bank", icon: BankIcon },
            { name: "Calculator", icon: CalculatorIcon },
            { name: "CreditCard", icon: CreditCardIcon },
            { name: "CurrencyInr", icon: CurrencyInrIcon },
            { name: "HandCoins", icon: HandCoinsIcon },
            { name: "Handshake", icon: HandshakeIcon },
            { name: "Money", icon: MoneyIcon },
            { name: "Percent", icon: PercentIcon },
            { name: "Receipt", icon: ReceiptIcon },
            { name: "Wallet", icon: WalletIcon },
            { name: "Storefront", icon: StorefrontIcon },
            { name: "Gavel", icon: GavelIcon },
            { name: "TrendUp", icon: TrendUpIcon },
            { name: "TrendDown", icon: TrendDownIcon },
            { name: "ChartBar", icon: ChartBarIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Devices & connectivity
        </h3>
        <IconGrid
          icons={[
            { name: "DeviceMobile", icon: DeviceMobileIcon },
            { name: "DeviceTablet", icon: DeviceTabletIcon },
            { name: "Devices", icon: DevicesIcon },
            { name: "Monitor", icon: MonitorIcon },
            { name: "HardDrives", icon: HardDrivesIcon },
            { name: "Plug", icon: PlugIcon },
            { name: "QrCode", icon: QrCodeIcon },
            { name: "Radio", icon: RadioIcon },
            { name: "WifiHigh", icon: WifiHighIcon },
            { name: "WifiSlash", icon: WifiSlashIcon },
            { name: "Waveform", icon: WaveformIcon },
            { name: "WebhooksLogo", icon: WebhooksLogoIcon },
            { name: "Key", icon: KeyIcon },
            { name: "LockKey", icon: LockKeyIcon },
            { name: "Gear", icon: GearIcon },
            { name: "Wrench", icon: WrenchIcon },
            { name: "BracketsCurly", icon: BracketsCurlyIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Files & documents
        </h3>
        <IconGrid
          icons={[
            { name: "FileText", icon: FileTextIcon },
            { name: "MicrosoftExcelLogo", icon: MicrosoftExcelLogoIcon },
            { name: "Path", icon: PathIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          People & account
        </h3>
        <IconGrid
          icons={[
            { name: "User", icon: UserIcon },
            { name: "UserCircle", icon: UserCircleIcon },
            { name: "UserMinus", icon: UserMinusIcon },
            { name: "UserPlus", icon: UserPlusIcon },
            { name: "Users", icon: UsersIcon },
            { name: "SignOut", icon: SignOutIcon },
            { name: "Palette", icon: PaletteIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Places & logistics
        </h3>
        <IconGrid
          icons={[
            { name: "House", icon: HouseIcon },
            { name: "MapPin", icon: MapPinIcon },
            { name: "Buildings", icon: BuildingsIcon },
            { name: "Globe", icon: GlobeIcon },
            { name: "Truck", icon: TruckIcon },
            { name: "Package", icon: PackageIcon },
          ]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Media & time
        </h3>
        <IconGrid
          icons={[
            { name: "PlayCircle", icon: PlayCircleIcon },
            { name: "Pause", icon: PauseIcon },
            { name: "PauseCircle", icon: PauseCircleIcon },
            { name: "FastForward", icon: FastForwardIcon },
            { name: "Eye", icon: EyeIcon },
            { name: "Calendar", icon: CalendarIcon },
            { name: "CalendarDots", icon: CalendarDotsIcon },
          ]}
        />
      </section>

    </div>
  ),
}

export const AllIcons: Story = {
  name: "Browse full set",
  parameters: {
    docs: {
      description: {
        story:
          "The complete Phosphor icon set (from [phosphoricons.com](https://phosphoricons.com)), pulled live from the installed `@phosphor-icons/react` package rather than hand-listed, so this stays accurate across upgrades. Use it to find a shape before adding a net-new icon to the app.",
      },
    },
  },
  render: () => <AllIconsBrowser />,
}
