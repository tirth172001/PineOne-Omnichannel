"use client"

import { useState } from "react"
import { CaretDownIcon, StorefrontIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { StoreIdentity } from "@/lib/store-identity"
import { cn } from "@/lib/utils"

export interface StoreMultiSelectProps {
  stores: StoreIdentity[]
  selectedStoreIds: string[]
  onChange: (storeIds: string[]) => void
  placeholder?: string
  className?: string
}

/** Searchable multi-select for assigning a user to one or more stores — shown only for
 *  roles that grant offline/in-store access, since online-only roles have no store concept. */
export function StoreMultiSelect({ stores, selectedStoreIds, onChange, placeholder = "Select stores", className }: StoreMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedStores = stores.filter((store) => selectedStoreIds.includes(store.storeId))

  function toggleStore(storeId: string) {
    onChange(
      selectedStoreIds.includes(storeId)
        ? selectedStoreIds.filter((id) => id !== storeId)
        : [...selectedStoreIds, storeId]
    )
  }

  const label =
    selectedStores.length === 0
      ? placeholder
      : selectedStores.length === 1
        ? selectedStores[0].name
        : `${selectedStores.length} stores selected`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-between gap-1.5 font-normal", className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            <StorefrontIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className={cn("truncate", selectedStores.length === 0 && "text-muted-foreground")}>{label}</span>
          </span>
          <CaretDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] gap-0 p-0">
        <Command>
          <CommandInput placeholder="Type to search stores" />
          <CommandList>
            <CommandEmpty>No stores found.</CommandEmpty>
            <CommandGroup>
              {stores.map((store) => {
                const checked = selectedStoreIds.includes(store.storeId)
                return (
                  <CommandItem
                    key={store.storeId}
                    value={`${store.name} ${store.storeId}`}
                    onSelect={() => toggleStore(store.storeId)}
                  >
                    <Checkbox checked={checked} className="pointer-events-none" />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{store.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{store.address}</p>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
