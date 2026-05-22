import type { StatusTone } from "@/components/shared/status-pill"

export type PaymentMode = "upi" | "card" | "netbanking"

export type TransactionRecord = {
  orderId: string
  transactionId: string
  merchantId: string
  rrn: string
  storeName: string
  storeAddress: string
  transactionType: "Order" | "Payment"
  amount: number
  paymentMode: PaymentMode
  paymentLabel: string
  provider: string
  date: string
  time: string
  status: {
    label: string
    tone: StatusTone
  }
}

const seedRows: TransactionRecord[] = [
  { orderId: "ORD-5161", transactionId: "1525039333", merchantId: "MCNT-5161", rrn: "6876347862374", storeName: "PineLabs - Noida Kiosk", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Payment", amount: 20000, paymentMode: "upi", paymentLabel: "UPI", provider: "xx9898", date: "16 Aug 2026", time: "10:10 PM", status: { label: "Pending", tone: "processing" } },
  { orderId: "ORD-5163", transactionId: "1525039336", merchantId: "MCNT-5163", rrn: "6876347862381", storeName: "PineLabs - Sector 35", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Payment", amount: 10000, paymentMode: "card", paymentLabel: "Card", provider: "VISA xx9898", date: "18 Aug 2026", time: "9:30 PM", status: { label: "Success", tone: "success" } },
  { orderId: "ORD-5164", transactionId: "1525039339", merchantId: "MCNT-5164", rrn: "6876347862377", storeName: "PineLabs - Sector 21", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Order", amount: 25000, paymentMode: "card", paymentLabel: "Card", provider: "Mastercard xx8742", date: "20 Aug 2026", time: "3:00 PM", status: { label: "Failed", tone: "failed" } },
  { orderId: "ORD-5165", transactionId: "1525039335", merchantId: "MCNT-5165", rrn: "6876347862378", storeName: "PineLabs - Sector 27", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Payment", amount: 30000, paymentMode: "card", paymentLabel: "Card", provider: "Rupay xx8793", date: "21 Aug 2026", time: "1:00 PM", status: { label: "Session expired", tone: "failed" } },
  { orderId: "ORD-5166", transactionId: "1525039337", merchantId: "MCNT-5166", rrn: "6876347862376", storeName: "PineLabs - Sector 10", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Payment", amount: 35000, paymentMode: "netbanking", paymentLabel: "Net banking", provider: "HDFC xx9835", date: "19 Aug 2026", time: "2:45 PM", status: { label: "Cancelled", tone: "failed" } },
  { orderId: "ORD-5167", transactionId: "1525039338", merchantId: "MCNT-5167", rrn: "6876347862379", storeName: "PineLabs - Sector 15", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Order", amount: 40000, paymentMode: "netbanking", paymentLabel: "Net banking", provider: "Axis xx9835", date: "22 Aug 2026", time: "4:30 PM", status: { label: "User cancelled", tone: "failed" } },
  { orderId: "ORD-5168", transactionId: "1525039334", merchantId: "MCNT-5168", rrn: "6876347862375", storeName: "PineLabs - Sector 12", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Payment", amount: 45000, paymentMode: "upi", paymentLabel: "UPI", provider: "CRED", date: "17 Aug 2026", time: "11:15 AM", status: { label: "Success", tone: "success" } },
  { orderId: "ORD-5169", transactionId: "1525039340", merchantId: "MCNT-5169", rrn: "6876347862380", storeName: "PineLabs - Sector 32", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Payment", amount: 50000, paymentMode: "upi", paymentLabel: "UPI", provider: "PhonePe", date: "25 Aug 2026", time: "8:00 AM", status: { label: "Success", tone: "success" } },
  { orderId: "ORD-5171", transactionId: "1525039341", merchantId: "MCNT-5171", rrn: "6876347862382", storeName: "PineLabs - Sector 11", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Order", amount: 60000, paymentMode: "upi", paymentLabel: "UPI", provider: "PhonePe", date: "23 Aug 2026", time: "5:15 PM", status: { label: "Success", tone: "success" } },
  { orderId: "ORD-5170", transactionId: "1525039342", merchantId: "MCNT-5170", rrn: "6876347862383", storeName: "PineLabs - Sector 42", storeAddress: "PineLabs, Candor TechSpace, Noida, 5848...", transactionType: "Payment", amount: 55000, paymentMode: "upi", paymentLabel: "UPI", provider: "PayTm", date: "24 Aug 2026", time: "6:00 PM", status: { label: "Success", tone: "success" } },
]

const statusCatalog: Array<TransactionRecord["status"]> = [
  { label: "Success", tone: "success" },
  { label: "Pending", tone: "processing" },
  { label: "Failed", tone: "failed" },
  { label: "Cancelled", tone: "failed" },
  { label: "Session expired", tone: "failed" },
  { label: "User cancelled", tone: "failed" },
  { label: "Processing", tone: "processing" },
  { label: "Initiated", tone: "initiated" },
]

const modeCatalog: Array<{
  paymentMode: PaymentMode
  paymentLabel: string
  providers: string[]
}> = [
  { paymentMode: "upi", paymentLabel: "UPI", providers: ["PhonePe", "PayTm", "CRED", "Google Pay", "BHIM"] },
  { paymentMode: "card", paymentLabel: "Card", providers: ["VISA xx9898", "Mastercard xx8742", "Rupay xx8793", "AMEX xx7701"] },
  { paymentMode: "netbanking", paymentLabel: "Net banking", providers: ["HDFC xx9835", "Axis xx9835", "ICICI xx7721", "SBI xx6620"] },
]

const storeCatalog = [
  "PineLabs - Noida Kiosk",
  "PineLabs - Sector 35",
  "PineLabs - Sector 21",
  "PineLabs - Sector 27",
  "PineLabs - Sector 10",
  "PineLabs - Sector 15",
  "PineLabs - Sector 12",
  "PineLabs - Sector 32",
  "PineLabs - Sector 11",
  "PineLabs - Sector 42",
]

const areaCatalog = [
  "Candor TechSpace, Noida",
  "DLF Cyber City, Gurugram",
  "Phoenix Marketcity, Mumbai",
  "Brigade Road, Bengaluru",
  "Salt Lake, Kolkata",
]

const generatedRows: TransactionRecord[] = Array.from({ length: 220 }, (_, index) => {
  const seq = index + 1
  const mode = modeCatalog[index % modeCatalog.length]
  const provider = mode.providers[index % mode.providers.length]
  const status = statusCatalog[index % statusCatalog.length]
  const transactionType: TransactionRecord["transactionType"] = index % 2 === 0 ? "Payment" : "Order"
  const day = ((index * 3) % 28) + 1
  const hour = (index * 5) % 24
  const minute = (index * 7) % 60
  const amPm = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12
  const amount = 9000 + (index % 40) * 1750

  return {
    orderId: `ORD-${6000 + seq}`,
    transactionId: String(1525040000 + seq),
    merchantId: `MCNT-${6000 + seq}`,
    rrn: String(6876347863000 + seq),
    storeName: storeCatalog[index % storeCatalog.length]!,
    storeAddress: `PineLabs, ${areaCatalog[index % areaCatalog.length]!}, Outlet ${((index % 18) + 1)
      .toString()
      .padStart(2, "0")}...`,
    transactionType,
    amount,
    paymentMode: mode.paymentMode,
    paymentLabel: mode.paymentLabel,
    provider,
    date: `${String(day).padStart(2, "0")} Sep 2026`,
    time: `${formattedHour}:${String(minute).padStart(2, "0")} ${amPm}`,
    status,
  }
})

export const transactionRows: TransactionRecord[] = [...seedRows, ...generatedRows]

export function findTransactionById(transactionId: string) {
  return transactionRows.find((row) => row.transactionId.toLowerCase() === transactionId.toLowerCase()) ?? null
}
