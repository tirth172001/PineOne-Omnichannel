// Mock summary of everything collected across tickets 02–09 (each ticket route runs
// independently in this prototype, so state isn't threaded between them).
export type ReviewField = { id: string; label: string; value: string }
export type ReviewGroup = { id: string; title: string; fields: ReviewField[] }

export const reviewGroups: ReviewGroup[] = [
  {
    id: "verification",
    title: "Business verification",
    fields: [
      { id: "products", label: "Products selected", value: "A910 — Lifetime Plan × 2, Apple Tap to Pay" },
      { id: "legal-name", label: "Legal business name", value: "Kopi & Co Pte. Ltd." },
      { id: "uen", label: "UEN / registration number", value: "202312345K" },
      { id: "category", label: "Business category", value: "Cafe / coffee shop" },
      { id: "store-location", label: "Store location", value: "maps.app.goo.gl/sBKS3hLGGvBgt3cu7" },
      { id: "store-photo", label: "Storefront photo", value: "storefront.jpg" },
      { id: "website", label: "Website", value: "kopiandco.sg" },
    ],
  },
  {
    id: "details",
    title: "Business details",
    fields: [
      { id: "bank", label: "Settlement bank account", value: "DBS Bank •••• 4471" },
      { id: "owners", label: "Business owners", value: "Samuel King (40%), Seol Ali (30%), Arun Kapoor (30%)" },
    ],
  },
  {
    id: "kyc",
    title: "KYC",
    fields: [
      { id: "signatory", label: "Authorised signatory", value: "Seol Ali, Business owner" },
      { id: "face-auth", label: "Face authentication", value: "Verified" },
    ],
  },
]

export const agreementParagraphs = [
  `This Merchant Signing Agreement ("Agreement") is made effective as of the date of signing by and between Kopi & Co Pte. Ltd. ("Merchant") and Pine Labs Online ("Company").`,
  `1. Purpose. The purpose of this Agreement is to outline the terms under which the Merchant will accept payments and provide goods and/or services to customers through the Company's platform.`,
  `2. Obligations of the Merchant. The Merchant agrees to provide accurate information about their business and products, maintain compliance with applicable laws, and ensure timely fulfilment of orders.`,
  `3. Payment Terms. The Company will process payments on behalf of the Merchant and remit settlements to the bank account provided within the agreed settlement cycle.`,
  `4. Termination. Either party may terminate this Agreement with 30 days' written notice to the other party.`,
  `5. Governing Law. This Agreement shall be governed by the laws of the Republic of Singapore.`,
]
