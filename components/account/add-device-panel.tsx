"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MONTHS, formatTime } from "@/lib/user-roster-data"
import type { DeviceMode, TerminalDeviceRow } from "@/lib/terminal-devices-data"

const MODEL_OPTIONS = ["Touch A910", "Touch B920", "Touch C930", "Touch D940", "Touch E950", "Touch F960", "Touch G970", "Touch H980", "Touch I990", "Touch J1000"]

function nowStamp() {
  const now = new Date()
  return {
    date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    time: formatTime(now.getHours(), now.getMinutes()),
  }
}

export function AddDevicePanel({
  open,
  onOpenChange,
  store,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: { storeId: string; name: string; address: string } | null
  onAdd: (device: TerminalDeviceRow) => void
}) {
  const [model, setModel] = useState(MODEL_OPTIONS[0])
  const [hardwareId, setHardwareId] = useState("")
  const [posId, setPosId] = useState("")
  const [mode, setMode] = useState<DeviceMode>("Standalone")

  useEffect(() => {
    if (!open) return
    setModel(MODEL_OPTIONS[0])
    setHardwareId("")
    setPosId("")
    setMode("Standalone")
  }, [open])

  const canAdd = hardwareId.trim().length > 0 && posId.trim().length > 0

  function handleAdd() {
    if (!canAdd || !store) return
    const { date, time } = nowStamp()
    onAdd({
      id: `dev-${Date.now()}`,
      model,
      hardwareId: hardwareId.trim(),
      posId: posId.trim(),
      installationDate: date,
      installationTime: time,
      storeId: store.storeId,
      storeName: store.name,
      storeAddress: store.address,
      mode,
      status: "Active",
    })
    onOpenChange(false)
    toast.success(`${model} added to ${store.name}`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-foreground">Add device</SheetTitle>
          <SheetDescription>{store ? `Register a new terminal for ${store.name}.` : "Register a new terminal."}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label>Hardware model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-device-hardware-id">Hardware ID</Label>
            <Input
              id="add-device-hardware-id"
              value={hardwareId}
              onChange={(event) => setHardwareId(event.target.value)}
              placeholder="HRD-110239874"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-device-pos-id">POS ID</Label>
            <Input
              id="add-device-pos-id"
              value={posId}
              onChange={(event) => setPosId(event.target.value)}
              placeholder="POS-738723323881"
            />
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as DeviceMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standalone">Standalone</SelectItem>
                <SelectItem value="Integrated">Integrated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border/70">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!canAdd}>
            Add device
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
