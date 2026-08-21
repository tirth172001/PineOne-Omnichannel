import type { Icon } from "@phosphor-icons/react"

export function IconSwatch({ name, icon: IconComponent }: { name: string; icon: Icon }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border p-4">
      <IconComponent size={24} weight="regular" className="text-foreground" />
      <p className="text-center font-mono text-[11px] leading-tight text-muted-foreground">{name}</p>
    </div>
  )
}

export function IconGrid({ icons }: { icons: Array<{ name: string; icon: Icon }> }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
      {icons.map((item) => (
        <IconSwatch key={item.name} {...item} />
      ))}
    </div>
  )
}

export function ColorSwatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-12 w-12 shrink-0 rounded-lg border border-border"
        style={{ backgroundColor: `var(${varName})` }}
      />
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{varName}</p>
      </div>
    </div>
  )
}

export function ColorSwatchGroup({
  title,
  colors,
}: {
  title: string
  colors: Array<{ name: string; varName: string }>
}) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {colors.map((color) => (
          <ColorSwatch key={color.varName} {...color} />
        ))}
      </div>
    </section>
  )
}

export function RadiusSwatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-16 w-16 shrink-0 border-2 border-foreground/70 bg-muted"
        style={{ borderRadius: `var(${varName})` }}
      />
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{varName}</p>
      </div>
    </div>
  )
}

export function ShadowSwatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-16 w-16 shrink-0 rounded-lg bg-card"
        style={{ boxShadow: `var(${varName})` }}
      />
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{varName}</p>
      </div>
    </div>
  )
}

export function SpacingBar({ label, px }: { label: string; px: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
      <div className="h-4 rounded-sm bg-primary" style={{ width: `${px}px` }} />
      <span className="font-mono text-xs text-muted-foreground">{px}px</span>
    </div>
  )
}

export function ZIndexTier({
  value,
  description,
  usages,
}: {
  value: string
  description: string
  usages: string[]
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border/60 py-3 last:border-b-0">
      <span className="w-16 shrink-0 rounded-md bg-primary/10 px-2 py-1 text-center font-mono text-sm font-semibold text-primary">
        {value}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{description}</p>
        <ul className="mt-1 space-y-0.5">
          {usages.map((usage) => (
            <li key={usage} className="truncate font-mono text-xs text-muted-foreground">
              {usage}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function MotionSample({
  label,
  duration,
  easing,
  usages,
}: {
  label: string
  duration: string
  easing: string
  usages: string[]
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border/60 py-4 last:border-b-0">
      <div className="group h-12 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        <div
          className="h-full w-8 bg-primary transition-transform group-hover:translate-x-[96px]"
          style={{ transitionDuration: duration, transitionTimingFunction: easing }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {duration} · {easing}
        </p>
        <ul className="mt-1 space-y-0.5">
          {usages.map((usage) => (
            <li key={usage} className="truncate font-mono text-xs text-muted-foreground">
              {usage}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function ContainerWidthBar({
  label,
  px,
  maxPx,
  usages,
}: {
  label: string
  px: number
  maxPx: number
  usages: string[]
}) {
  const pct = Math.min((px / maxPx) * 100, 100)
  return (
    <div className="border-b border-border/60 py-3 last:border-b-0">
      <div className="flex items-center gap-4">
        <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
        <div className="h-3 flex-1 rounded-sm bg-muted">
          <div className="h-3 rounded-sm bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="mt-1 ml-24 space-y-0.5">
        {usages.map((usage) => (
          <li key={usage} className="truncate font-mono text-xs text-muted-foreground">
            {usage}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TypeSample({
  label,
  sizeClassName,
  sizeLabel,
}: {
  label: string
  sizeClassName: string
  sizeLabel: string
}) {
  return (
    <div className="flex items-baseline gap-4 border-b border-border/60 py-3">
      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
      <span className={sizeClassName}>The quick brown fox jumps</span>
      <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{sizeLabel}</span>
    </div>
  )
}
