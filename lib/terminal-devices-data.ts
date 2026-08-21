import { STORE_IDENTITIES } from "@/lib/store-identity"
import { MONTHS, formatTime } from "@/lib/user-roster-data"

export type DeviceMode = "Standalone" | "Integrated"
export type DeviceStatus = "Active" | "Inactive"

export type TerminalDeviceRow = {
  id: string
  model: string
  hardwareId: string
  posId: string
  installationDate: string
  installationTime: string
  storeId: string
  storeName: string
  storeAddress: string
  mode: DeviceMode
  status: DeviceStatus
}

export type DeviceAuditRow = {
  id: string
  hardwareId: string
  model: string
  changedBy: string
  changedByRole: string
  storeName: string
  previousMode: DeviceMode
  finalMode: DeviceMode
  date: string
  time: string
}

const MODEL_CYCLE = ["Touch A910", "Touch B920", "Touch C930", "Touch D940", "Touch E950", "Touch F960", "Touch G970", "Touch H980", "Touch I990", "Touch J1000"]

function storeAt(index: number) {
  return STORE_IDENTITIES[index % STORE_IDENTITIES.length]
}

/** First ten rows match the supplied mockup 1:1 (model, hardware/POS ids, install date, store, mode). */
const SEED_DEVICES: TerminalDeviceRow[] = [
  { id: "dev-1", model: "Touch A910", hardwareId: "HRD-110239874", posId: "POS-738723323881", installationDate: "14 Jun 2026", installationTime: "09:45 AM", ...identityFields(0), mode: "Standalone", status: "Active" },
  { id: "dev-2", model: "Touch C930", hardwareId: "HRD-330459876", posId: "POS-738723324892", installationDate: "18 Jun 2026", installationTime: "04:20 PM", ...identityFields(1), mode: "Integrated", status: "Inactive" },
  { id: "dev-3", model: "Touch D940", hardwareId: "HRD-440569877", posId: "POS-738723325903", installationDate: "20 Jun 2026", installationTime: "06:25 PM", ...identityFields(2), mode: "Standalone", status: "Active" },
  { id: "dev-4", model: "Touch F960", hardwareId: "HRD-660789879", posId: "POS-738723329914", installationDate: "12 Jun 2026", installationTime: "10:14 AM", ...identityFields(3), mode: "Integrated", status: "Active" },
  { id: "dev-5", model: "Touch H980", hardwareId: "HRD-880909881", posId: "POS-738723330925", installationDate: "19 Jun 2026", installationTime: "05:10 PM", ...identityFields(4), mode: "Standalone", status: "Active" },
  { id: "dev-6", model: "Touch I990", hardwareId: "HRD-990019882", posId: "POS-738723331936", installationDate: "15 Jun 2026", installationTime: "01:30 PM", ...identityFields(5), mode: "Standalone", status: "Active" },
  { id: "dev-7", model: "Touch G970", hardwareId: "HRD-770899880", posId: "POS-738723327947", installationDate: "16 Jun 2026", installationTime: "02:15 PM", ...identityFields(6), mode: "Integrated", status: "Active" },
  { id: "dev-8", model: "Touch B920", hardwareId: "HRD-220349875", posId: "POS-738723328958", installationDate: "13 Jun 2026", installationTime: "11:00 PM", ...identityFields(7), mode: "Standalone", status: "Active" },
  { id: "dev-9", model: "Touch J1000", hardwareId: "HRD-1001123883", posId: "POS-738723326969", installationDate: "21 Jun 2026", installationTime: "07:40 PM", ...identityFields(8), mode: "Standalone", status: "Inactive" },
  { id: "dev-10", model: "Touch E950", hardwareId: "HRD-550679878", posId: "POS-738723332970", installationDate: "17 Jun 2026", installationTime: "03:00 PM", ...identityFields(9), mode: "Standalone", status: "Active" },
]

function identityFields(storeIndex: number) {
  const store = storeAt(storeIndex)
  return { storeId: store.storeId, storeName: store.name, storeAddress: store.address }
}

function buildGeneratedDevice(index: number): TerminalDeviceRow {
  const model = MODEL_CYCLE[(index * 3 + 1) % MODEL_CYCLE.length]
  const storeIndex = (index * 7 + 2) % STORE_IDENTITIES.length
  const day = (index % 27) + 1
  const month = MONTHS[(index * 5 + 2) % MONTHS.length]
  const hour = (index * 4 + 8) % 24
  const minute = (index * 13) % 60

  return {
    id: `dev-${index}`,
    model,
    hardwareId: `HRD-${100000 + index * 271}`,
    posId: `POS-${738723300 + index * 37}`,
    installationDate: `${day} ${month} 2026`,
    installationTime: formatTime(hour, minute),
    ...identityFields(storeIndex),
    mode: index % 3 === 0 ? "Integrated" : "Standalone",
    status: index % 5 === 0 ? "Inactive" : "Active",
  }
}

let deviceRows: TerminalDeviceRow[] = [
  ...SEED_DEVICES,
  ...Array.from({ length: 14 }, (_, i) => buildGeneratedDevice(i + 11)),
]

let auditRows: DeviceAuditRow[] = []

export function getDeviceRows() {
  return deviceRows
}

export function getAuditRows() {
  return auditRows
}

export function findDeviceById(id: string) {
  return deviceRows.find((row) => row.id === id)
}

export function countDevicesForStore(storeId: string) {
  return deviceRows.filter((row) => row.storeId === storeId).length
}

function formatNow() {
  const now = new Date()
  return {
    date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    time: formatTime(now.getHours(), now.getMinutes()),
  }
}

/** Mutates the shared device row's Mode and appends a live audit entry — the only action that
 *  gets recorded in the Audit log (locked scope: Deactivate/Reactivate is silent). Returns the
 *  updated device + new audit row so the calling component can also update its own local state
 *  without a second read. */
export function recordModeChange(deviceId: string, nextMode: DeviceMode, changedBy: string, changedByRole: string) {
  const device = deviceRows.find((row) => row.id === deviceId)
  if (!device) return null

  const previousMode = device.mode
  const updatedDevice: TerminalDeviceRow = { ...device, mode: nextMode }
  deviceRows = deviceRows.map((row) => (row.id === deviceId ? updatedDevice : row))

  const { date, time } = formatNow()
  const auditRow: DeviceAuditRow = {
    id: `audit-${Date.now()}`,
    hardwareId: device.hardwareId,
    model: device.model,
    changedBy,
    changedByRole,
    storeName: device.storeName,
    previousMode,
    finalMode: nextMode,
    date,
    time,
  }
  auditRows = [auditRow, ...auditRows]

  return { device: updatedDevice, auditRow }
}

/** Silent — not audit-logged (locked scope). */
export function toggleDeviceStatus(deviceId: string) {
  const device = deviceRows.find((row) => row.id === deviceId)
  if (!device) return null

  const updatedDevice: TerminalDeviceRow = { ...device, status: device.status === "Active" ? "Inactive" : "Active" }
  deviceRows = deviceRows.map((row) => (row.id === deviceId ? updatedDevice : row))
  return updatedDevice
}
