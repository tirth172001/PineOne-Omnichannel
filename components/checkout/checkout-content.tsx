"use client"

import { useRef, useState, type ReactNode } from "react"
import {
  BankIcon,
  BatteryFullIcon,
  CalendarIcon,
  CaretDownIcon,
  CaretRightIcon,
  CellSignalFullIcon,
  CheckCircleIcon,
  CheckIcon,
  CreditCardIcon,
  DeviceMobileIcon,
  ImageSquareIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  MoneyIcon,
  MonitorIcon,
  MinusIcon,
  MoonIcon,
  PaletteIcon,
  PlusIcon,
  RadioButtonIcon,
  ShieldCheckIcon,
  ShieldIcon,
  TranslateIcon,
  WalletIcon,
  WifiHighIcon,
  XIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { ColorPickerPopover } from "@/components/checkout/checkout-color-picker"
import {
  LINE_TAB_TRIGGER_CLASSES,
  LINE_TABS_LIST_CLASSES,
  PAGE_HEADING_CLASSES,
} from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DEFAULT_CHECKOUT_COLOR = "#173814"
const DESKTOP_PREVIEW_WIDTH = 1280
const ZOOM_MIN = 25
const ZOOM_MAX = 100
const ZOOM_STEP = 10

function SettingsRow({
  icon,
  label,
  description,
  action,
}: {
  icon: ReactNode
  label: string
  description: string
  action: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-muted text-muted-foreground">
          {icon}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm leading-none font-semibold text-foreground">{label}</span>
          <span className="text-sm leading-none text-muted-foreground">{description}</span>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

function ColorSettingsRow({
  value,
  onChange,
  ariaLabel,
}: {
  value: string | null
  onChange: (hex: string) => void
  ariaLabel: string
}) {
  return (
    <SettingsRow
      icon={value ? <span className="h-full w-full" style={{ backgroundColor: value }} /> : <PaletteIcon className="h-4 w-4" />}
      label="Primary color"
      description="Add your brand primary colors"
      action={
        <ColorPickerPopover
          value={value}
          onChange={onChange}
          trigger={
            <button type="button" aria-label={ariaLabel} className="text-sm font-medium text-primary hover:underline">
              {value ? "Edit color" : "Select color"}
            </button>
          }
        />
      }
    />
  )
}

function LogoSettingsRow({
  value,
  onChange,
  ariaLabel,
}: {
  value: string | null
  onChange: (dataUrl: string) => void
  ariaLabel: string
}) {
  return (
    <SettingsRow
      icon={
        value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <ImageSquareIcon className="h-4 w-4" />
        )
      }
      label="Logo"
      description="Upload logo in PNG, SVG or JPEG format upto 1 MB size"
      action={
        <LogoUploadField onChange={onChange} ariaLabel={ariaLabel}>
          {(open) => (
            <button type="button" onClick={open} className="text-sm font-medium text-primary hover:underline">
              {value ? "Edit logo" : "Add logo"}
            </button>
          )}
        </LogoUploadField>
      }
    />
  )
}

function TogglePreferenceRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function LogoUploadField({
  onChange,
  ariaLabel,
  children,
}: {
  onChange: (dataUrl: string) => void
  ariaLabel: string
  children: (open: () => void) => ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      {children(() => inputRef.current?.click())}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg"
        aria-label={ariaLabel}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          onChange(URL.createObjectURL(file))
          event.target.value = ""
        }}
      />
    </>
  )
}

function SettingsSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card px-5">
      <h3 className="py-4 text-base font-semibold text-foreground">{title}</h3>
      <div className="divide-y divide-border/60 border-t border-border/60">{children}</div>
    </section>
  )
}

/* ------------------------------- Customisation -------------------------------- */

function CustomisationTab() {
  const [darkMode, setDarkMode] = useState(false)
  const [checkoutColor, setCheckoutColor] = useState<string | null>(null)
  const [checkoutLogo, setCheckoutLogo] = useState<string | null>(null)
  const [walletName, setWalletName] = useState("My wallet")
  const [walletColor, setWalletColor] = useState<string | null>(null)
  const [walletLogo, setWalletLogo] = useState<string | null>(null)
  const [showContactDelivery, setShowContactDelivery] = useState(true)
  const [showRecommendedPayment, setShowRecommendedPayment] = useState(true)
  const [allowEditContact, setAllowEditContact] = useState(true)
  const [allowEditAddress, setAllowEditAddress] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile")
  const [mobileZoom, setMobileZoom] = useState(100)
  const [desktopZoom, setDesktopZoom] = useState(40)
  const [dirty, setDirty] = useState(false)

  const zoom = previewDevice === "mobile" ? mobileZoom : desktopZoom
  const setZoom = previewDevice === "mobile" ? setMobileZoom : setDesktopZoom
  const headerBg = darkMode ? "#0b0f0c" : checkoutColor ?? DEFAULT_CHECKOUT_COLOR

  function handleSave() {
    toast.success("Checkout settings saved")
    setDirty(false)
  }

  function track<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setDirty(true)
    }
  }

  return (
    <div className="grid h-full min-h-0 gap-6 px-8 py-8 lg:grid-cols-2">
      <div className="relative flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 pb-4">
          <SettingsSection title="Checkout branding">
            <SettingsRow
              icon={<MoonIcon className="h-4 w-4" />}
              label="Dark mode"
              description="It converts the header in the dark mode versions"
              action={<Switch checked={darkMode} onCheckedChange={track(setDarkMode)} />}
            />
            <ColorSettingsRow value={checkoutColor} onChange={track(setCheckoutColor)} ariaLabel="Checkout primary color" />
            <LogoSettingsRow value={checkoutLogo} onChange={track(setCheckoutLogo)} ariaLabel="Upload checkout logo" />
          </SettingsSection>

          <SettingsSection title="Wallet branding">
            <div className="py-3.5">
              <Label htmlFor="wallet-name" className="text-sm leading-none font-semibold text-foreground">
                Wallet name
              </Label>
              <span className="mt-1 block text-sm leading-none text-muted-foreground">It will be used to represent the wallet as a payment method</span>
              <Input
                id="wallet-name"
                value={walletName}
                onChange={(event) => track(setWalletName)(event.target.value)}
                className="mt-3"
              />
            </div>
            <ColorSettingsRow value={walletColor} onChange={track(setWalletColor)} ariaLabel="Wallet primary color" />
            <LogoSettingsRow value={walletLogo} onChange={track(setWalletLogo)} ariaLabel="Upload wallet logo" />
          </SettingsSection>

          <SettingsSection title="Express checkout preferences">
            <TogglePreferenceRow
              label="Show contact and delivery details"
              checked={showContactDelivery}
              onCheckedChange={track(setShowContactDelivery)}
            />
            <TogglePreferenceRow
              label="Show recommended payment mode"
              checked={showRecommendedPayment}
              onCheckedChange={track(setShowRecommendedPayment)}
            />
            <TogglePreferenceRow
              label="Allow users to edit the contact"
              checked={allowEditContact}
              onCheckedChange={track(setAllowEditContact)}
            />
            <TogglePreferenceRow
              label="Allow users to edit the address"
              checked={allowEditAddress}
              onCheckedChange={track(setAllowEditAddress)}
            />
          </SettingsSection>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-12 h-10 bg-gradient-to-t from-background to-transparent" />

        <div className="shrink-0 bg-background pt-3">
          <Button onClick={handleSave} disabled={!dirty} className="h-9 px-4">
            Save details
          </Button>
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-col rounded-2xl bg-muted/40 p-6">
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-1 rounded-md border border-border/70 bg-muted p-1">
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`flex h-7 w-8 items-center justify-center rounded ${previewDevice === "mobile" ? "bg-background text-foreground" : "text-muted-foreground"}`}
            >
              <DeviceMobileIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`flex h-7 w-8 items-center justify-center rounded ${previewDevice === "desktop" ? "bg-background text-foreground" : "text-muted-foreground"}`}
            >
              <MonitorIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border/70 bg-muted p-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                disabled={zoom <= ZOOM_MIN}
                aria-label="Zoom out"
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <MinusIcon className="h-3 w-3" />
              </button>
              <span className="w-9 text-center text-xs font-medium text-foreground">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                disabled={zoom >= ZOOM_MAX}
                aria-label="Zoom in"
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <PlusIcon className="h-3 w-3" />
              </button>
            </div>
            <span className="inline-flex h-6 items-center rounded-full bg-emerald-600 px-2.5 text-xs font-medium text-white">Preview</span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto py-4">
          <div
            className={`shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-background ${previewDevice === "mobile" ? "w-full max-w-[320px]" : ""}`}
            style={{ width: previewDevice === "desktop" ? DESKTOP_PREVIEW_WIDTH : undefined, zoom: zoom / 100 }}
          >
            <div className="flex items-center justify-between px-4 pt-3 text-xs font-medium text-foreground">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <CellSignalFullIcon className="h-3.5 w-3.5" />
                <WifiHighIcon className="h-3.5 w-3.5" />
                <BatteryFullIcon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 px-4 pb-2 pt-1 text-[11px] text-muted-foreground">
              <LockSimpleIcon className="h-3 w-3" />
              gateway.plural.com
            </div>

            <div className="flex items-center justify-between px-4 pb-2">
              <p className="text-xs font-medium text-muted-foreground">
                Contact <span className="mx-1">»</span> Address <span className="mx-1">»</span>
                <span className="ml-1 rounded border border-border/70 px-1.5 py-0.5 text-foreground">Pay</span>
              </p>
              <button type="button" className="flex items-center gap-1 rounded-md border border-border/70 px-1.5 py-1 text-muted-foreground">
                <TranslateIcon className="h-3.5 w-3.5" />
                <CaretDownIcon className="h-3 w-3" />
              </button>
            </div>

            <div className="px-4 py-4 text-white" style={{ backgroundColor: headerBg }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {checkoutLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={checkoutLogo} alt="" className="h-6 w-auto object-contain" />
                  ) : (
                    <>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-emerald-800">C</span>
                      <span className="text-sm font-medium">Croma</span>
                    </>
                  )}
                </div>
                <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-3 text-2xl font-semibold">₹ 9,949.00</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-white/70">
                Order Summary <CaretDownIcon className="h-3 w-3" />
              </p>
            </div>

            <div className="space-y-3 px-4 py-4">
              {showContactDelivery ? (
                <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2.5 text-xs font-medium tracking-wide text-muted-foreground">
                  CONTACT AND DELIVERY DETAILS
                  <CaretDownIcon className="h-3.5 w-3.5" />
                </div>
              ) : null}

              <div>
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground">RECOMMENDED PAYMENT OPTIONS</p>
                <div className="mt-2 space-y-2">
                  <div className={`flex items-center justify-between rounded-md border px-3 py-2.5 ${showRecommendedPayment ? "border-emerald-600" : "border-border/70"}`}>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <WalletIcon className="h-3 w-3" />
                      </span>
                      Simpl
                    </div>
                    {showRecommendedPayment ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                        <CheckIcon className="h-3 w-3" weight="bold" />
                      </span>
                    ) : (
                      <RadioButtonIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-center rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: headerBg }}
                  >
                    Pay ₹ 9,949.00
                  </button>
                  <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2.5 text-sm text-foreground">
                    <span className="flex items-center gap-2">
                      <MoneyIcon className="h-4 w-4 text-muted-foreground" />
                      LazyPay
                    </span>
                    <RadioButtonIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2.5 text-sm text-foreground">
                    <div>
                      <span className="flex items-center gap-2">
                        <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                        HDFC Credit Card <span className="text-muted-foreground">•• 4560</span>
                      </span>
                      <span className="mt-1.5 inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">No CVV required</span>
                    </div>
                    <RadioButtonIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <button type="button" className="w-full text-center text-xs font-medium text-muted-foreground">
                VIEW MORE PAYMENT OPTIONS
              </button>

              <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldIcon className="h-4 w-4" />
                  <span className="text-left leading-tight">
                    Safe &amp; Secure
                    <br />
                    Payments
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span className="leading-tight">PCI DSS</span>
                </span>
                <span className="text-xs leading-tight font-semibold text-foreground">
                  pine labs
                  <br />
                  <span className="text-[9px] font-normal tracking-wide text-muted-foreground">ONLINE</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------- Paymodes ----------------------------------- */

type PaymodeListItem = { name: string; active: boolean }

type PaymodeCard = {
  icon: typeof CreditCardIcon | "upi"
  title: string
  subtitle: string
  active: boolean
  logos?: boolean
  pills?: string[]
  action: string
  footerNote?: { text: string; tone: "muted" | "error" }
  detail: PaymodeListItem[]
}

const BANK_ISSUERS: PaymodeListItem[] = [
  { name: "HDFC Bank", active: true },
  { name: "ICICI Bank", active: true },
  { name: "State Bank of India", active: true },
  { name: "Axis Bank", active: false },
  { name: "Kotak Mahindra Bank", active: false },
  { name: "Yes Bank", active: false },
  { name: "IDFC First Bank", active: false },
  { name: "Punjab National Bank", active: false },
]

const NET_BANKING_BANKS: PaymodeListItem[] = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IDFC First Bank",
  "Yes Bank",
  "IndusInd Bank",
  "Federal Bank",
  "RBL Bank",
  "Bank of India",
].map((name) => ({ name, active: false }))

const UPI_APPS: PaymodeListItem[] = [
  { name: "Google Pay", active: true },
  { name: "PhonePe", active: true },
  { name: "Paytm", active: true },
  { name: "BHIM", active: true },
  { name: "Amazon Pay", active: false },
  { name: "WhatsApp Pay", active: false },
  { name: "Mobikwik", active: false },
  { name: "CRED Pay", active: false },
]

const WALLET_PROVIDERS: PaymodeListItem[] = [
  "Paytm Wallet",
  "Amazon Pay Balance",
  "Mobikwik",
  "Freecharge",
  "PhonePe Wallet",
  "Airtel Money",
  "JioMoney",
  "Ola Money",
].map((name) => ({ name, active: false }))

const PAYMODE_CARDS: PaymodeCard[] = [
  { icon: CreditCardIcon, title: "Debit cards", subtitle: "3 / 3 issuers enabled", active: true, logos: true, action: "View details", detail: BANK_ISSUERS },
  { icon: CreditCardIcon, title: "Credit cards", subtitle: "3 / 3 issuers enabled", active: true, logos: true, action: "View details", detail: BANK_ISSUERS },
  {
    icon: BankIcon,
    title: "Net banking",
    subtitle: "15 banks supported",
    active: false,
    action: "View supported banks",
    footerNote: { text: "You are not eligible", tone: "muted" },
    detail: NET_BANKING_BANKS,
  },
  {
    icon: "upi",
    title: "UPI",
    subtitle: "UPI intent and UPI collect services are available",
    active: false,
    pills: ["UPI intent", "UPI collect"],
    action: "Edit details",
    detail: UPI_APPS,
  },
  { icon: CalendarIcon, title: "EMI", subtitle: "3 / 3 issuers enabled", active: true, logos: true, action: "View details", detail: BANK_ISSUERS },
  {
    icon: WalletIcon,
    title: "Wallets",
    subtitle: "3 wallet services provided on the platform",
    active: false,
    action: "View supported wallets",
    footerNote: { text: "Payment mode disabled by PineLabs", tone: "error" },
    detail: WALLET_PROVIDERS,
  },
]

function CardNetworkBadges() {
  return (
    <div className="flex items-center">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-white text-[6px] font-black italic text-blue-800">
        VISA
      </span>
      <span className="-ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-white text-[5px] font-bold text-emerald-700">
        RuPay
      </span>
      <span className="relative -ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-white">
        <span className="relative h-3 w-4.5">
          <span className="absolute left-0 h-3 w-3 rounded-full bg-red-500" />
          <span className="absolute left-1.5 h-3 w-3 rounded-full bg-amber-400 mix-blend-multiply" />
        </span>
      </span>
    </div>
  )
}

function PaymodeActionLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
    >
      {label}
      <CaretRightIcon className="h-3.5 w-3.5" />
    </button>
  )
}

function PaymodeDetailSheet({
  card,
  onOpenChange,
}: {
  card: PaymodeCard | null
  onOpenChange: (open: boolean) => void
}) {
  const [search, setSearch] = useState("")

  const filtered = card
    ? card.detail.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))
    : []

  return (
    <Sheet
      open={card !== null}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) setSearch("")
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-foreground">{card?.title}</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-6 pb-6">
          <div className="relative shrink-0">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="h-9 pl-9"
            />
          </div>
          <div className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto">
            {filtered.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground">{item.name}</span>
                {item.active ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <CheckCircleIcon className="h-4 w-4" weight="fill" />
                    Active
                  </span>
                ) : null}
              </div>
            ))}
            {filtered.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No results found</p> : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function PaymodesTab() {
  const [activeCard, setActiveCard] = useState<PaymodeCard | null>(null)

  return (
    <div className="grid gap-4 px-8 py-8 sm:grid-cols-2 xl:grid-cols-3">
      {PAYMODE_CARDS.map((card) => (
        <div key={card.title} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-muted">
                {card.icon === "upi" ? (
                  <span className="text-[10px] font-black tracking-tighter text-foreground">UPI</span>
                ) : (
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
              {card.active ? (
                <span className="inline-flex h-6 items-center rounded-full bg-emerald-700 px-2.5 text-xs font-medium text-white">Active</span>
              ) : null}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{card.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.subtitle}</p>
            </div>

            <div className="mt-auto pt-2">
              {card.logos ? (
                <div className="flex items-center justify-between gap-3">
                  <CardNetworkBadges />
                  <PaymodeActionLink label={card.action} onClick={() => setActiveCard(card)} />
                </div>
              ) : card.pills ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {card.pills.map((pill) => (
                      <span
                        key={pill}
                        className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 text-xs text-foreground"
                      >
                        <CheckIcon className="h-3 w-3" weight="bold" />
                        {pill}
                      </span>
                    ))}
                  </div>
                  <PaymodeActionLink label={card.action} onClick={() => setActiveCard(card)} />
                </div>
              ) : (
                <PaymodeActionLink label={card.action} onClick={() => setActiveCard(card)} />
              )}
            </div>
          </div>

          {card.footerNote ? (
            <p
              className={`px-5 py-3 text-sm ${card.footerNote.tone === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
            >
              {card.footerNote.text}
            </p>
          ) : null}
        </div>
      ))}

      <PaymodeDetailSheet card={activeCard} onOpenChange={(open) => !open && setActiveCard(null)} />
    </div>
  )
}

/* ------------------------------------ Root ------------------------------------- */

export function CheckoutContent() {
  const [tab, setTab] = useState<"customisation" | "paymodes">("customisation")

  return (
    <div className="flex h-[calc(100vh-var(--dashboard-top-offset,0px)-16px)] flex-col">
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "customisation" | "paymodes")}
        className="flex h-full min-h-0 flex-col gap-0"
      >
        <div className="px-8 pt-8 pb-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className={PAGE_HEADING_CLASSES}>Checkout</h1>
          </div>
        </div>

        <div className="px-8 pt-8 pb-0">
          <TabsList variant="line" className={LINE_TABS_LIST_CLASSES}>
            <TabsTrigger value="customisation" className={LINE_TAB_TRIGGER_CLASSES}>
              Customisation
            </TabsTrigger>
            <TabsTrigger value="paymodes" className={LINE_TAB_TRIGGER_CLASSES}>
              Paymodes
            </TabsTrigger>
          </TabsList>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "customisation" ? <CustomisationTab /> : <PaymodesTab />}
        </div>
      </Tabs>
    </div>
  )
}
