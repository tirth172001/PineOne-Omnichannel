"use client"

import { useMemo, useState } from "react"
import { CaretDownIcon, CaretLeftIcon, CopyIcon, DotsThreeVerticalIcon, QrCodeIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { AddDevicePanel } from "@/components/account/add-device-panel"
import { AddUserPanel } from "@/components/account/add-user-panel"
import { StoreQrPanel } from "@/components/account/store-qr-panel"
import { useDateRangeFilter } from "@/components/shared/date-range-filter"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { readDummyAuthSession } from "@/lib/dummy-auth"
import {
  getDeviceRows,
  recordModeChange,
  toggleDeviceStatus,
  type DeviceMode,
  type TerminalDeviceRow,
} from "@/lib/terminal-devices-data"
import { STORE_RECORDS, terminalsLinkedCount, usersInvitedForStore, type StoreRecord } from "@/lib/stores-data"
import { usersForStore, type RosterEntry } from "@/lib/user-roster-data"

function copyToClipboard(value: string, label: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(value).catch(() => {})
  }
  toast.success(`${label} copied to clipboard`)
}

function CopyableId({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        copyToClipboard(value, "ID")
      }}
      className="inline-flex items-center gap-1 text-foreground hover:text-primary"
    >
      {value}
      <CopyIcon className="h-3 w-3 text-muted-foreground" />
    </button>
  )
}

function StatusPillSmall({ active }: { active: boolean }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border/70 px-2 text-xs text-foreground">
      <span className={active ? "h-1.5 w-1.5 rounded-full bg-emerald-500" : "h-1.5 w-1.5 rounded-full bg-muted-foreground/50"} />
      {active ? "Active" : "Inactive"}
    </span>
  )
}

function ModePill({ mode }: { mode: DeviceMode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border/70 px-2 text-xs text-foreground">
      <span className={mode === "Integrated" ? "h-1.5 w-1.5 rounded-full bg-primary" : "h-1.5 w-1.5 rounded-full bg-muted-foreground/50"} />
      {mode}
    </span>
  )
}

/* ------------------------------------- List ------------------------------------- */

function StoresListView({ onSelectStore }: { onSelectStore: (storeId: string) => void }) {
  const [stores, setStores] = useState<StoreRecord[]>(() => STORE_RECORDS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const dateRangeFilter = useDateRangeFilter()

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase()
    return stores.filter((store) => {
      if (statusFilter !== "all" && store.status.toLowerCase() !== statusFilter) return false
      if (!query) return true
      return `${store.name} ${store.storeId} ${store.merchantId}`.toLowerCase().includes(query)
    })
  }, [stores, search, statusFilter])

  function handleAddStore() {
    const index = stores.length + 1
    const newStore: StoreRecord = {
      id: `store-new-${Date.now()}`,
      storeId: `STR-${Date.now()}`,
      merchantId: `MER-${Date.now()}`,
      name: `PineLabs - New Store ${index}`,
      address: "PineLabs, Candor TechSpace, Noida, 584800",
      status: "Active",
      createdOnDate: "Just now",
      createdOnTime: "",
    }
    setStores((current) => [newStore, ...current])
    toast.success(`${newStore.name} added`)
  }

  const filters: ListingFilter[] = [
    dateRangeFilter.filter,
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: setStatusFilter,
      options: [
        { label: "All status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ]

  const columns: Array<ListingColumn<StoreRecord>> = [
    {
      key: "createdOn",
      header: "Created on",
      cell: (row) => (
        <div>
          <p>{row.createdOnDate}</p>
          <p className="text-xs text-muted-foreground">{row.createdOnTime}</p>
        </div>
      ),
    },
    {
      key: "name",
      header: "Store name",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.address}</p>
        </div>
      ),
    },
    { key: "storeId", header: "Store ID", cell: (row) => <CopyableId value={row.storeId} /> },
    { key: "merchantId", header: "Merchant ID", cell: (row) => <CopyableId value={row.merchantId} /> },
    { key: "status", header: "Status", cell: (row) => <StatusPillSmall active={row.status === "Active"} /> },
    { key: "terminals", header: "Terminals linked", cell: (row) => terminalsLinkedCount(row.storeId) },
    { key: "users", header: "Users invited", cell: (row) => usersInvitedForStore(row.storeId) },
  ]

  return (
    <TransactionStyleListingPage
      title="Manage stores"
      primaryAction={
        <Button
          onClick={handleAddStore}
        >
          Add new store
        </Button>
      }
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by store name"
      filters={filters}
      columns={columns}
      onRowClick={(row) => onSelectStore(row.storeId)}
      rows={filteredStores}
      emptyText="No stores found for current filters."
      totalRows={filteredStores.length}
    />
  )
}

/* ------------------------------------ Detail ------------------------------------ */

function StoreDetailView({ storeId, onBack }: { storeId: string; onBack: () => void }) {
  const store = STORE_RECORDS.find((entry) => entry.storeId === storeId)
  const [tab, setTab] = useState<"devices" | "users">("devices")
  const [deviceRows, setDeviceRows] = useState<TerminalDeviceRow[]>(() =>
    getDeviceRows().filter((row) => row.storeId === storeId)
  )
  const [users, setUsers] = useState<RosterEntry[]>(() => usersForStore(storeId))
  const [qrPanelOpen, setQrPanelOpen] = useState(false)
  const [addDeviceOpen, setAddDeviceOpen] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)

  function currentActor() {
    const session = readDummyAuthSession()
    return { name: session?.name ?? "Admin", role: session?.role ?? "Admin" }
  }

  function handleChangeMode(device: TerminalDeviceRow, nextMode: DeviceMode) {
    const { name, role } = currentActor()
    const result = recordModeChange(device.id, nextMode, name, role)
    if (!result) return
    setDeviceRows((current) => current.map((row) => (row.id === device.id ? result.device : row)))
    toast.success(`${device.model} switched to ${nextMode}`)
  }

  function handleToggleStatus(device: TerminalDeviceRow) {
    const updated = toggleDeviceStatus(device.id)
    if (!updated) return
    setDeviceRows((current) => current.map((row) => (row.id === device.id ? updated : row)))
    toast.success(`${device.model} ${updated.status === "Active" ? "reactivated" : "deactivated"}`)
  }

  if (!store) {
    return (
      <div className="p-8">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <CaretLeftIcon className="h-4 w-4" />
          Back
        </button>
        <p className="mt-4 text-sm text-muted-foreground">Store not found.</p>
      </div>
    )
  }

  const deviceColumns: Array<ListingColumn<TerminalDeviceRow>> = [
    {
      key: "model",
      header: "Hardware model ID",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.model}</p>
          <p className="text-xs text-muted-foreground">{row.hardwareId}</p>
        </div>
      ),
    },
    { key: "posId", header: "POS ID", cell: (row) => row.posId },
    {
      key: "installation",
      header: "Installation date",
      cell: (row) => (
        <div>
          <p>{row.installationDate}</p>
          <p className="text-xs text-muted-foreground">{row.installationTime}</p>
        </div>
      ),
    },
    { key: "mode", header: "Mode", cell: (row) => <ModePill mode={row.mode} /> },
    { key: "status", header: "Status", cell: (row) => <StatusPillSmall active={row.status === "Active"} /> },
    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/70 bg-transparent">
                <DotsThreeVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onSelect={() => handleChangeMode(row, row.mode === "Standalone" ? "Integrated" : "Standalone")}>
                Change mode to {row.mode === "Standalone" ? "Integrated" : "Standalone"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleToggleStatus(row)}>
                {row.status === "Active" ? "Deactivate device" : "Reactivate device"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const userColumns: Array<ListingColumn<RosterEntry>> = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (row) => row.role },
    { key: "scope", header: "Access scope", cell: (row) => row.scope },
    { key: "status", header: "Status", cell: (row) => row.status },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <CaretLeftIcon className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-[8px] border-border/70 bg-background"
            onClick={() => setQrPanelOpen(true)}
          >
            <QrCodeIcon className="h-4 w-4" />
            View &amp; edit store QR
          </Button>
          <ButtonGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-1.5">
                  Add
                  <CaretDownIcon className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    setTab("devices")
                    setAddDeviceOpen(true)
                  }}
                >
                  Add device
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setTab("users")
                    setAddUserOpen(true)
                  }}
                >
                  Add user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </div>
      </div>
      <div className="border-b border-border/70 px-8 pt-3">
        <div className="pb-5">
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.4px] text-foreground">{store.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{store.address}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 items-center rounded-full border border-border/70 px-2.5 text-xs text-muted-foreground">
              Store ID: <CopyableId value={store.storeId} />
            </span>
            <span className="inline-flex h-7 items-center rounded-full border border-border/70 px-2.5 text-xs text-muted-foreground">
              Merchant ID: <CopyableId value={store.merchantId} />
            </span>
          </div>
        </div>
        <Tabs value={tab} onValueChange={(value) => setTab(value as "devices" | "users")}>
          <TabsList variant="line" className="h-9 w-fit gap-6 p-0">
            <TabsTrigger value="devices" className="flex-none px-1 text-sm data-active:font-semibold after:bg-primary">
              Devices
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-none px-1 text-sm data-active:font-semibold after:bg-primary">
              Users
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-8 pb-8 pt-4">
        <div className="overflow-hidden rounded-[8px] border border-border bg-background">
          <div className="overflow-x-auto">
            {tab === "devices" ? (
              <Table className="min-w-[60rem]">
                <TableHeader>
                  <TableRow className="h-10">
                    {deviceColumns.map((column) => (
                      <TableHead key={column.key} className={`px-3 text-sm font-medium text-muted-foreground ${column.align === "right" ? "text-right" : ""}`}>
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deviceRows.length === 0 ? (
                    <TableRow className="h-[4.5rem] hover:bg-transparent">
                      <TableCell colSpan={deviceColumns.length} className="px-4 text-sm text-muted-foreground">
                        No devices linked to this store.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deviceRows.map((row) => (
                      <TableRow key={row.id} className="h-[4.5rem]">
                        {deviceColumns.map((column) => (
                          <TableCell key={`${row.id}-${column.key}`} className={`px-3 text-sm text-foreground ${column.align === "right" ? "text-right" : ""}`}>
                            {column.cell(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table className="min-w-[60rem]">
                <TableHeader>
                  <TableRow className="h-10">
                    {userColumns.map((column) => (
                      <TableHead key={column.key} className="px-3 text-sm font-medium text-muted-foreground">
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow className="h-[4.5rem] hover:bg-transparent">
                      <TableCell colSpan={userColumns.length} className="px-4 text-sm text-muted-foreground">
                        No users assigned to this store.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((row) => (
                      <TableRow key={row.id} className="h-[4.5rem]">
                        {userColumns.map((column) => (
                          <TableCell key={`${row.id}-${column.key}`} className="px-3 text-sm text-foreground">
                            {column.cell(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      <StoreQrPanel open={qrPanelOpen} onOpenChange={setQrPanelOpen} store={store} />

      <AddDevicePanel
        open={addDeviceOpen}
        onOpenChange={setAddDeviceOpen}
        store={store}
        onAdd={(device) => setDeviceRows((current) => [device, ...current])}
      />

      <AddUserPanel
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        store={store}
        roster={users}
        onAdd={(user) => setUsers((current) => [user, ...current])}
      />
    </div>
  )
}

/* ------------------------------------ Root ------------------------------------- */

export function ManageStoresSection() {
  const [screen, setScreen] = useState<"list" | "detail">("list")
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)

  if (screen === "detail" && selectedStoreId) {
    return <StoreDetailView storeId={selectedStoreId} onBack={() => setScreen("list")} />
  }

  return (
    <StoresListView
      onSelectStore={(storeId) => {
        setSelectedStoreId(storeId)
        setScreen("detail")
      }}
    />
  )
}
