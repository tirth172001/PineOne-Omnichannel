"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { PageHeader } from "@/components/ui/panels"

type QrStyleVariant = "classic" | "rounded" | "dots"

type StoreQrRecord = {
  id: string
  storeName: string
  storeCode: string
  location: string
  upiId: string
  status: "active" | "inactive"
  todayTransactions: number
  todayAmount: string
  lastUpdated: string
}

const STORE_QR_RECORDS: StoreQrRecord[] = [
  {
    id: "s-blr-01",
    storeName: "Indiranagar Flagship",
    storeCode: "BLR-01",
    location: "Bengaluru",
    upiId: "indiranagar.blr01@pinelabs",
    status: "active",
    todayTransactions: 182,
    todayAmount: "₹1,24,340",
    lastUpdated: "17 Apr 2026, 2:15 PM",
  },
  {
    id: "s-mum-09",
    storeName: "Andheri East",
    storeCode: "MUM-09",
    location: "Mumbai",
    upiId: "andheri.mum09@pinelabs",
    status: "active",
    todayTransactions: 141,
    todayAmount: "₹98,760",
    lastUpdated: "17 Apr 2026, 1:58 PM",
  },
  {
    id: "s-del-14",
    storeName: "Connaught Place",
    storeCode: "DEL-14",
    location: "Delhi",
    upiId: "cp.del14@pinelabs",
    status: "inactive",
    todayTransactions: 0,
    todayAmount: "₹0",
    lastUpdated: "16 Apr 2026, 7:02 PM",
  },
  {
    id: "s-hyd-07",
    storeName: "Banjara Hills",
    storeCode: "HYD-07",
    location: "Hyderabad",
    upiId: "banjara.hyd07@pinelabs",
    status: "active",
    todayTransactions: 88,
    todayAmount: "₹56,280",
    lastUpdated: "17 Apr 2026, 12:44 PM",
  },
]

function stringHash(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function inFinderPattern(x: number, y: number, offsetX: number, offsetY: number) {
  if (x < offsetX || x >= offsetX + 7 || y < offsetY || y >= offsetY + 7) return false
  const localX = x - offsetX
  const localY = y - offsetY
  if (localX === 0 || localX === 6 || localY === 0 || localY === 6) return true
  if (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4) return true
  return false
}

function createPseudoQrMatrix(seed: string, size = 29) {
  const seedNumber = stringHash(seed)
  const matrix: boolean[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => false))

  const finderCoordinates: [number, number][] = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const isFinder = finderCoordinates.some(([offsetX, offsetY]) => inFinderPattern(x, y, offsetX, offsetY))
      if (isFinder) {
        matrix[y][x] = true
        continue
      }

      const n = (x + 1) * 2654435761 ^ (y + 1) * 2246822519 ^ seedNumber
      const normalized = Math.abs(Math.sin(n) * 10000) % 1
      matrix[y][x] = normalized > 0.55
    }
  }

  return matrix
}

function StatusBadge({ status }: { status: StoreQrRecord["status"] }) {
  if (status === "active") {
    return (
      <Badge variant="outline" className="border-success/35 bg-success/10 text-success">
        Active
      </Badge>
    )
  }

  return <Badge variant="outline">Inactive</Badge>
}

function QrPreview({
  matrix,
  moduleColor,
  backgroundColor,
  styleVariant,
}: {
  matrix: boolean[][]
  moduleColor: string
  backgroundColor: string
  styleVariant: QrStyleVariant
}) {
  const moduleClassName =
    styleVariant === "dots"
      ? "h-[62%] w-[62%] rounded-full"
      : styleVariant === "rounded"
        ? "h-full w-full rounded-[2.5px]"
        : "h-full w-full rounded-none"

  return (
    <div
      className="relative mx-auto w-fit rounded-xl border border-border/70 p-4 shadow-sm"
      style={{ backgroundColor }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${matrix[0]?.length ?? 0}, minmax(0, 1fr))`,
          gap: 2,
        }}
      >
        {matrix.flatMap((row, rowIndex) =>
          row.map((filled, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className="flex h-[9px] w-[9px] items-center justify-center">
              {filled ? <span className={moduleClassName} style={{ backgroundColor: moduleColor }} /> : null}
            </div>
          ))
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-md border border-border/70 bg-background/90 p-1.5 shadow-sm">
          <img
            src="/brand/pine-labs-icon.ico"
            alt="Pine Labs"
            className="h-7 w-7 rounded-sm object-contain grayscale brightness-0 contrast-200 dark:invert"
          />
        </div>
      </div>
    </div>
  )
}

export function UpiQrStickerContent() {
  const [selectedStoreId, setSelectedStoreId] = useState(STORE_QR_RECORDS[0]?.id ?? "")
  const [styleVariant, setStyleVariant] = useState<QrStyleVariant>("classic")
  const [moduleColor, setModuleColor] = useState("#0f172a")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")

  const selectedStore = useMemo(
    () => STORE_QR_RECORDS.find((store) => store.id === selectedStoreId) ?? STORE_QR_RECORDS[0],
    [selectedStoreId]
  )

  const qrMatrix = useMemo(
    () =>
      createPseudoQrMatrix(
        `${selectedStore?.storeCode ?? "store"}::${selectedStore?.upiId ?? "upi"}::${styleVariant}::${moduleColor}::${backgroundColor}`
      ),
    [backgroundColor, moduleColor, selectedStore?.storeCode, selectedStore?.upiId, styleVariant]
  )

  const storeColumns = useMemo<DataTableColumn<StoreQrRecord>[]>(
    () => [
      {
        id: "storeName",
        header: "STORE",
        cell: (row) => (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">{row.storeName}</p>
            <p className="text-[11px] text-muted-foreground">
              {row.storeCode} · {row.location}
            </p>
          </div>
        ),
        getSearchValue: (row) => `${row.storeName} ${row.storeCode} ${row.location}`,
      },
      {
        id: "upiId",
        header: "UPI ID",
        accessorKey: "upiId",
        getSearchValue: (row) => row.upiId,
      },
      {
        id: "status",
        header: "STATUS",
        accessorKey: "status",
        filterOptions: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
        getFilterValue: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "todayTransactions",
        header: "TODAY TXNS",
        accessorKey: "todayTransactions",
      },
      {
        id: "todayAmount",
        header: "TODAY AMOUNT",
        accessorKey: "todayAmount",
      },
      {
        id: "lastUpdated",
        header: "LAST UPDATED",
        accessorKey: "lastUpdated",
      },
      {
        id: "action",
        header: "ACTION",
        align: "right",
        searchable: false,
        cell: (row) => (
          <div className="flex justify-end gap-1.5">
            <Button
              variant={row.id === selectedStoreId ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSelectedStoreId(row.id)}
            >
              Preview
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
              <Link href={`/offline-payments/transactions?source=upi-qr&store=${encodeURIComponent(row.storeCode)}`}>
                View transactions
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [selectedStoreId]
  )

  const centerMain = (
    <div className="h-full space-y-3 overflow-y-auto p-4">
      <Card className="rounded-lg border border-border/70 bg-card/85">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">QR settings</CardTitle>
          <CardDescription className="text-xs">
            Each store and UPI ID has a unique QR. Select a store, customize style, and preview the linked code.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="qr-store-select">Linked store</Label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger id="qr-store-select" className="h-9 text-xs">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {STORE_QR_RECORDS.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.storeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="rounded-md border border-border/70 bg-muted/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">UPI ID</p>
              <p className="mt-1 text-xs font-medium text-foreground">{selectedStore?.upiId}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {selectedStore?.storeCode} · {selectedStore?.location}
              </p>
            </div>
          </div>

          <div className="space-y-3 md:col-span-1">
            <div className="space-y-1.5">
              <Label className="text-xs">Style</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["classic", "rounded", "dots"] as QrStyleVariant[]).map((variant) => (
                  <Button
                    key={variant}
                    type="button"
                    variant={styleVariant === variant ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs capitalize"
                    onClick={() => setStyleVariant(variant)}
                  >
                    {variant}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="qr-module-color" className="text-xs">
                  QR color
                </Label>
                <div className="flex items-center gap-2 rounded-md border border-border/70 px-2 py-1.5">
                  <Input
                    id="qr-module-color"
                    type="color"
                    className="h-7 w-10 cursor-pointer border-0 bg-transparent p-0"
                    value={moduleColor}
                    onChange={(event) => setModuleColor(event.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">{moduleColor.toUpperCase()}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr-bg-color" className="text-xs">
                  Background
                </Label>
                <div className="flex items-center gap-2 rounded-md border border-border/70 px-2 py-1.5">
                  <Input
                    id="qr-bg-color"
                    type="color"
                    className="h-7 w-10 cursor-pointer border-0 bg-transparent p-0"
                    value={backgroundColor}
                    onChange={(event) => setBackgroundColor(event.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">{backgroundColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center md:col-span-1">
            <QrPreview
              matrix={qrMatrix}
              moduleColor={moduleColor}
              backgroundColor={backgroundColor}
              styleVariant={styleVariant}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border border-border/70 bg-card/85">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">Store and UPI linkage</CardTitle>
          <CardDescription className="text-xs">
            Validate which QR is linked to which store and open transaction details directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={STORE_QR_RECORDS}
            columns={storeColumns}
            rowId={(row) => row.id}
            searchPlaceholder="Search store or UPI ID..."
            statusColumnId="status"
            defaultRowsPerPage={10}
            rowsPerPageOptions={[10, 25, 50]}
            className="rounded-lg border border-border/70"
            tableClassName="rounded-lg"
            onRowClick={(row) => setSelectedStoreId(row.id)}
          />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
        <p className="text-[11px] text-muted-foreground">
          Active preview: <span className="font-medium text-foreground">{selectedStore?.storeName}</span> ·{" "}
          <span className="font-medium text-foreground">{selectedStore?.upiId}</span>
        </p>
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Products · In-store payment · UPI QR sticker"
        description="Configure branded store-level QR stickers and track store-linked UPI performance."
        backHref="/products/in-store-payments"
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                if (typeof window !== "undefined") window.print()
              }}
            >
              Print QR
            </Button>
            <Button size="sm" className="h-8 text-xs" asChild>
              <Link href="/offline-payments/order-devices?product=upi-qr-sticker">Order payment QR options</Link>
            </Button>
          </>
        }
      />

      <WorkspaceShell centerMain={centerMain} />
    </>
  )
}
