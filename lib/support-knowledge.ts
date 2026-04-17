export type KnowledgeFaq = {
  question: string
  answer: string
}

export type KnowledgeVideo = {
  title: string
  summary: string
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced"
}

export type KnowledgeTopic = {
  slug: string
  title: string
  subtitle: string
  description: string
  iconKey: "checkout" | "pos" | "settlements" | "disputes"
  faqs: KnowledgeFaq[]
  videos: KnowledgeVideo[]
}

export const knowledgeTopics: KnowledgeTopic[] = [
  {
    slug: "checkout-payments",
    title: "Checkout payments",
    subtitle: "Success rate, retries, and payment journey reliability",
    description:
      "Understand failure patterns, improve conversion at checkout, and reduce drop-offs in online payment flows.",
    iconKey: "checkout",
    faqs: [
      {
        question: "Why are some checkout payments failing intermittently?",
        answer:
          "Intermittent failures usually happen because of bank-side timeouts, issuer risk checks, or peak-hour routing congestion. Use smart retries, monitor issuer-level failure patterns, and configure fallback payment options.",
      },
      {
        question: "How can I improve payment success for UPI users?",
        answer:
          "Enable multiple PSP routes, keep intent and collect options available, and surface alternate UPI apps when one app path is degraded.",
      },
      {
        question: "When should I trigger an automatic retry?",
        answer:
          "Trigger retries only on retry-safe failure codes such as timeout or technical decline. Avoid retries for hard declines like blocked account or invalid PIN.",
      },
    ],
    videos: [
      {
        title: "Checkout diagnostics 101",
        summary: "Reading failure reasons and prioritizing high-impact fixes.",
        duration: "08:24",
        level: "Beginner",
      },
      {
        title: "Routing and retry strategy",
        summary: "How to configure resilient routing for peak-hour reliability.",
        duration: "14:10",
        level: "Intermediate",
      },
    ],
  },
  {
    slug: "pos-terminal-operations",
    title: "POS terminal operations",
    subtitle: "Device uptime, printer reliability, and day-to-day troubleshooting",
    description:
      "Keep in-store devices healthy with guided checks for connectivity, printer health, firmware versions, and battery state.",
    iconKey: "pos",
    faqs: [
      {
        question: "My POS is online but receipts are not printing. What should I check?",
        answer:
          "Check paper roll alignment, thermal head condition, and printer cable latch. Then run a printer self-test from device diagnostics.",
      },
      {
        question: "How often should POS firmware be updated?",
        answer:
          "Use stable release windows and update once every sprint cycle unless there is a security hotfix. Always verify merchant app compatibility before rollout.",
      },
      {
        question: "Can I monitor device health centrally?",
        answer:
          "Yes. Device health signals such as connectivity, battery, printer, and app crash telemetry can be tracked from the manage devices workspace.",
      },
    ],
    videos: [
      {
        title: "POS health checklist",
        summary: "Daily health checks for store operators and field teams.",
        duration: "09:12",
        level: "Beginner",
      },
      {
        title: "Printer issue deep-dive",
        summary: "Diagnosing print-head and paper-sensor issues quickly.",
        duration: "11:46",
        level: "Intermediate",
      },
    ],
  },
  {
    slug: "settlements-and-payouts",
    title: "Settlements and payouts",
    subtitle: "Settlement cycles, deductions, and payout reconciliation",
    description:
      "Learn how payout amounts are calculated, why deductions happen, and how to reconcile UTR and bank references.",
    iconKey: "settlements",
    faqs: [
      {
        question: "Why is my settlement amount lower than gross transaction amount?",
        answer:
          "Settlement amount reflects net payout after MDR, GST, refunds, reversals, and any applicable risk holds or release adjustments.",
      },
      {
        question: "How do same-day and on-demand settlement differ?",
        answer:
          "Same-day follows an accelerated standard cycle, while on-demand is merchant-triggered and typically has additional convenience fees.",
      },
      {
        question: "How do I reconcile payout in bank statement?",
        answer:
          "Use UTR, bank reference, and batch-level transaction list together. Match net payout first, then verify deductions line-by-line.",
      },
    ],
    videos: [
      {
        title: "Settlement breakdown explained",
        summary: "Understanding gross, deductions, and net payout values.",
        duration: "10:02",
        level: "Beginner",
      },
      {
        title: "Batch reconciliation workflow",
        summary: "How finance teams reconcile batches and bank entries.",
        duration: "13:31",
        level: "Advanced",
      },
    ],
  },
  {
    slug: "disputes-and-refunds",
    title: "Disputes and refunds",
    subtitle: "Chargeback response, evidence strategy, and refund operations",
    description:
      "Handle dispute SLAs confidently with defend/accept flows, evidence checklists, and refund lifecycle visibility.",
    iconKey: "disputes",
    faqs: [
      {
        question: "What happens if I miss a pending-action dispute deadline?",
        answer:
          "If evidence is not submitted before due date, the dispute can move to loss automatically based on network rules.",
      },
      {
        question: "When should I partially defend versus fully defend?",
        answer:
          "Choose partial defend when only part of the transaction is disputable. Use full defend when complete order fulfillment evidence is available.",
      },
      {
        question: "How long does a refund usually take to complete?",
        answer:
          "Most refunds complete within 2–7 business days depending on payment method and issuer processing timelines.",
      },
    ],
    videos: [
      {
        title: "Dispute evidence playbook",
        summary: "What documents improve win rates in dispute handling.",
        duration: "12:20",
        level: "Intermediate",
      },
      {
        title: "Refund operations best practices",
        summary: "Reducing refund backlog and improving customer communication.",
        duration: "07:55",
        level: "Beginner",
      },
    ],
  },
]

export function getKnowledgeTopicBySlug(slug: string) {
  return knowledgeTopics.find((topic) => topic.slug === slug) ?? null
}
