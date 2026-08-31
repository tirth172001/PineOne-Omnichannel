"use client"

import { useMemo, useState } from "react"
import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/**
 * How the options inside one category should render:
 * - "list": dense rows, control on the left, no border — good for long simple lists.
 * - "card": bordered rows with title + subtext on the left and the selection
 *   control on the right — good when options need explanation.
 * - "badge": wrapping toggle chips, label only — good for short, tag-like values.
 */
export type MoreFilterDisplay = "list" | "card" | "badge"
export type MoreFilterSelectionMode = "single" | "multi"

export interface MoreFilterOption {
  id: string
  label: string
  /** Shown as muted subtext under the label. Ignored by the "badge" display. */
  description?: string
}

export interface MoreFilterCategory {
  id: string
  label: string
  options: MoreFilterOption[]
  /** @default "card" */
  display?: MoreFilterDisplay
  /** @default "multi" */
  selectionMode?: MoreFilterSelectionMode
  /** Shows the per-category search box. @default true */
  searchable?: boolean
}

export interface MoreFiltersPanelProps {
  title?: string
  categories: MoreFilterCategory[]
  /** Selected option ids, keyed by category id. */
  selected: Record<string, string[]>
  /** Called with the full next selection for a category (toggle, select-all, and single-select all funnel through this). */
  onChange: (categoryId: string, nextSelectedIds: string[]) => void
  activeCategoryId: string
  onActiveCategoryChange: (categoryId: string) => void
  onClear?: () => void
  onApply?: () => void
  className?: string
  /** @default "620px" */
  height?: string
}

function toggleInList(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

function OptionRow({
  option,
  checked,
  selectionMode,
  display,
  onToggle,
}: {
  option: MoreFilterOption
  checked: boolean
  selectionMode: MoreFilterSelectionMode
  display: MoreFilterDisplay
  onToggle: () => void
}) {
  const control =
    selectionMode === "single" ? (
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-primary bg-primary" : "border-input bg-background"
        )}
      >
        {checked ? <span className="size-1.5 rounded-full bg-primary-foreground" /> : null}
      </span>
    ) : (
      <Checkbox checked={checked} onCheckedChange={onToggle} className="pointer-events-none" />
    )

  if (display === "list") {
    return (
      <button
        type="button"
        role={selectionMode === "single" ? "radio" : "checkbox"}
        aria-checked={checked}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-[8px] px-2 py-2 text-left text-sm transition-colors",
          checked ? "bg-accent text-foreground" : "hover:bg-accent/60"
        )}
      >
        {control}
        <span className="min-w-0 flex-1 truncate font-medium">{option.label}</span>
      </button>
    )
  }

  // "card"
  return (
    <button
      type="button"
      role={selectionMode === "single" ? "radio" : "checkbox"}
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-[8px] border px-3 py-2 text-left transition-colors",
        checked ? "border-primary/70 bg-muted" : "border-border bg-transparent hover:bg-accent/40"
      )}
    >
      <div className="min-w-0 pr-3">
        <p className="truncate text-sm font-medium text-foreground">{option.label}</p>
        {option.description ? (
          <p className="truncate text-sm text-muted-foreground">{option.description}</p>
        ) : null}
      </div>
      {control}
    </button>
  )
}

function BadgeOptions({
  options,
  selectedIds,
  onToggle,
}: {
  options: MoreFilterOption[]
  selectedIds: string[]
  onToggle: (optionId: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = selectedIds.includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={checked}
            onClick={() => onToggle(option.id)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
              checked
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent/60"
            )}
          >
            {checked ? <CheckIcon className="size-3.5" /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function MoreFiltersPanel({
  title = "More filters",
  categories,
  selected,
  onChange,
  activeCategoryId,
  onActiveCategoryChange,
  onClear,
  onApply,
  className,
  height = "620px",
}: MoreFiltersPanelProps) {
  const [searchByCategory, setSearchByCategory] = useState<Record<string, string>>({})

  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0]
  const display = activeCategory?.display ?? "card"
  const selectionMode = activeCategory?.selectionMode ?? "multi"
  const searchable = activeCategory?.searchable ?? true
  const search = searchByCategory[activeCategory?.id ?? ""] ?? ""
  const activeSelectedIds = selected[activeCategory?.id ?? ""] ?? []

  const visibleOptions = useMemo(() => {
    if (!activeCategory) return []
    const query = search.trim().toLowerCase()
    if (!query) return activeCategory.options
    return activeCategory.options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) || option.description?.toLowerCase().includes(query)
    )
  }, [activeCategory, search])

  const isAllVisibleSelected =
    visibleOptions.length > 0 && visibleOptions.every((option) => activeSelectedIds.includes(option.id))

  function handleToggleOption(optionId: string) {
    if (!activeCategory) return
    if (selectionMode === "single") {
      onChange(activeCategory.id, activeSelectedIds.includes(optionId) ? [] : [optionId])
      return
    }
    onChange(activeCategory.id, toggleInList(activeSelectedIds, optionId))
  }

  function handleToggleSelectAllVisible() {
    if (!activeCategory) return
    const visibleIds = visibleOptions.map((option) => option.id)
    if (isAllVisibleSelected) {
      onChange(
        activeCategory.id,
        activeSelectedIds.filter((id) => !visibleIds.includes(id))
      )
    } else {
      onChange(activeCategory.id, Array.from(new Set([...activeSelectedIds, ...visibleIds])))
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[12px] border border-border bg-popover",
        className
      )}
      style={{ height }}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-[20px] font-semibold leading-7 text-foreground">{title}</h3>
        <div className="flex items-center gap-3">
          {onClear ? (
            <Button variant="link" className="h-auto p-0 text-primary" onClick={onClear}>
              Clear filter
            </Button>
          ) : null}
          {onApply ? <Button onClick={onApply}>Apply</Button> : null}
        </div>
      </div>

      <Separator />

      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] gap-0 p-3">
        <div className="pr-3">
          <div className="space-y-1">
            {categories.map((category) => {
              const count = selected[category.id]?.length ?? 0
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onActiveCategoryChange(category.id)}
                  className={cn(
                    "flex h-10 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm font-normal text-foreground transition-colors",
                    activeCategoryId === category.id ? "bg-accent font-semibold" : "hover:bg-accent/70"
                  )}
                >
                  <span className="truncate">{category.label}</span>
                  {count > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-secondary px-1.5 text-xs font-medium text-secondary-foreground">
                      {count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-col pl-3">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-foreground">{activeCategory?.label}</h4>
            {selectionMode === "multi" && visibleOptions.length > 0 ? (
              <Button variant="link" className="h-auto p-0 text-primary" onClick={handleToggleSelectAllVisible}>
                {isAllVisibleSelected ? "Deselect all" : "Select all"}
              </Button>
            ) : null}
          </div>

          {searchable ? (
            <div className="relative mt-3 shrink-0">
              <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) =>
                  setSearchByCategory((current) => ({ ...current, [activeCategory?.id ?? ""]: event.target.value }))
                }
                placeholder={`Search ${activeCategory?.label.toLowerCase() ?? ""}`}
                className="pl-9"
              />
            </div>
          ) : null}

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {display === "badge" ? (
              <BadgeOptions options={visibleOptions} selectedIds={activeSelectedIds} onToggle={handleToggleOption} />
            ) : (
              <div className="space-y-2">
                {visibleOptions.map((option) => (
                  <OptionRow
                    key={option.id}
                    option={option}
                    display={display}
                    selectionMode={selectionMode}
                    checked={activeSelectedIds.includes(option.id)}
                    onToggle={() => handleToggleOption(option.id)}
                  />
                ))}
              </div>
            )}

            {visibleOptions.length === 0 ? (
              <div className="rounded-[8px] border border-dashed border-border p-4 text-sm text-muted-foreground">
                No results found.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Owns the draft/applied selection state for a "More filters" panel and returns
 * `toolbarProps` ready to spread onto `ListingToolbar`/`TransactionStyleListingPage`
 * (`moreFiltersContent`, `moreFiltersOpen`, `onMoreFiltersOpenChange`, `moreFiltersCount`,
 * `moreFiltersActive`) instead of hand-rolling the open/apply/clear wiring per page.
 */
export function useMoreFiltersPanel(categories: MoreFilterCategory[], title?: string) {
  const [open, setOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "")
  const [applied, setApplied] = useState<Record<string, string[]>>({})
  const [draft, setDraft] = useState<Record<string, string[]>>({})

  function onOpenChange(nextOpen: boolean) {
    if (nextOpen) setDraft(applied)
    setOpen(nextOpen)
  }

  function apply() {
    setApplied(draft)
    setOpen(false)
  }

  function clear() {
    setDraft({})
    setApplied({})
    setOpen(false)
  }

  const count = Object.values(applied).reduce((sum, ids) => sum + ids.length, 0)

  const toolbarProps = {
    moreFiltersContent: (
      <MoreFiltersPanel
        title={title}
        categories={categories}
        selected={draft}
        onChange={(categoryId: string, next: string[]) =>
          setDraft((current) => ({ ...current, [categoryId]: next }))
        }
        activeCategoryId={activeCategoryId}
        onActiveCategoryChange={setActiveCategoryId}
        onClear={clear}
        onApply={apply}
      />
    ),
    moreFiltersOpen: open,
    onMoreFiltersOpenChange: onOpenChange,
    moreFiltersCount: count,
    moreFiltersActive: count > 0,
  }

  return { applied, draft, open, count, toolbarProps }
}
