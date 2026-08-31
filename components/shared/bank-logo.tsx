import { cn } from "@/lib/utils"

/**
 * Symbol marks sourced from https://github.com/praveenpuglia/indian-banks
 * (assets/logos/<slug>/symbol.svg), stored locally under public/bank-logos.
 */
const BANK_LOGO_SOURCES: Record<string, string> = {
  HDFC: "/bank-logos/hdfc.svg",
  ICICI: "/bank-logos/icic.svg",
  AXIS: "/bank-logos/utib.svg",
  SBI: "/bank-logos/sbin.svg",
}

const BANK_FALLBACK_COLORS: Record<string, string> = {
  ICICI: "#ae282e",
  AXIS: "#97144d",
  SBI: "#1f4e96",
}

export interface BankLogoProps {
  bank: string
  size?: number
  className?: string
}

/** Renders a bank's symbol mark, falling back to a colored initial for banks without a logo asset yet. */
export function BankLogo({ bank, size = 16, className }: BankLogoProps) {
  const src = BANK_LOGO_SOURCES[bank]

  if (src) {
    return (
      <img
        src={src}
        alt={`${bank} logo`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-[3px] object-contain", className)}
      />
    )
  }

  const color = BANK_FALLBACK_COLORS[bank] ?? "#6b7280"
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[3px] font-bold leading-none text-white",
        className
      )}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.56 }}
    >
      {bank[0]}
    </span>
  )
}
