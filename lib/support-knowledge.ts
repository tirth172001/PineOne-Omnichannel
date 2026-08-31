export type SupportTopicSlug =
  | "device-hardware"
  | "payments"
  | "upi"
  | "settlements"
  | "reports"
  | "account-access"
  | "training"
  | "pine-checkout"

export type SupportTopic = {
  slug: SupportTopicSlug
  label: string
  /** Resolved to an icon component via components/support/support-topic-icon.tsx */
  iconKey: SupportTopicSlug
}

export type KnowledgeFaq = {
  question: string
  answer: string
}

export type KnowledgeVideo = {
  title: string
  summary: string
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced"
  topicSlug: SupportTopicSlug
}

/** The 8-topic taxonomy shown across the support landing page, chat topic picker,
 *  FAQ tabs, and ticket categorization — same list, same order, everywhere. */
export const SUPPORT_TOPICS: SupportTopic[] = [
  { slug: "device-hardware", label: "Device & Hardware", iconKey: "device-hardware" },
  { slug: "payments", label: "Payments", iconKey: "payments" },
  { slug: "upi", label: "UPI", iconKey: "upi" },
  { slug: "settlements", label: "Settlements", iconKey: "settlements" },
  { slug: "reports", label: "Reports", iconKey: "reports" },
  { slug: "account-access", label: "Account & Access", iconKey: "account-access" },
  { slug: "training", label: "Training", iconKey: "training" },
  { slug: "pine-checkout", label: "Pine Checkout", iconKey: "pine-checkout" },
]

export function getSupportTopic(slug: string) {
  return SUPPORT_TOPICS.find((topic) => topic.slug === slug) ?? null
}

/** FAQs per topic. Device & Hardware's list matches the Figma "All FAQs" screen exactly
 *  (11 questions); the rest are plausible mock content, reusing prior knowledge-hub
 *  copy where a topic maps cleanly. */
export const TOPIC_FAQS: Record<SupportTopicSlug, KnowledgeFaq[]> = {
  "device-hardware": [
    {
      question: "Run Connectivity Check",
      answer:
        "Open the device diagnostics panel and run a connectivity check to confirm the terminal can reach the payment network. This tests GPRS/Wi-Fi signal, gateway ping, and last successful heartbeat.",
    },
    {
      question: "GPRS / Network Issues",
      answer:
        "If the device shows a GPRS or network error, open Payments App → Menu → Set Connection, set the connection priority to GPRS, and submit Activate Connection. Restart the device if the issue continues.",
    },
    {
      question: "No SIM / SIM Lock on PoS",
      answer:
        "A SIM lock usually resolves after a device restart and settling any pending batch. If the SIM is still not detected, reseat the SIM card and run a test transaction to confirm connectivity.",
    },
    {
      question: "Alert Tampered Error",
      answer:
        "A tamper alert is a hardware security trigger. Power-cycle the terminal; if the alert persists after restart, the device must be sent for a physical inspection — raise a ticket with the device ID.",
    },
    {
      question: "Invalid Batch Roc Iso Packet",
      answer:
        "This usually means the batch settlement packet was corrupted mid-transmission. Retry the batch settlement; if it fails again, download the batch log and raise a ticket with the diagnostic report attached.",
    },
    {
      question: "Batch Locked Error",
      answer:
        "A locked batch means a previous settlement attempt did not complete cleanly. Wait a few minutes for the lock to clear automatically, then retry. If it stays locked for over 15 minutes, raise a ticket.",
    },
    {
      question: "Pos Display Blank",
      answer:
        "Check the power connection and battery charge first. If the display stays blank after a full restart, it may indicate a display panel fault — run a device health check from the app to confirm.",
    },
    {
      question: "Terminal Restarting During Txns",
      answer:
        "Unexpected restarts mid-transaction are commonly caused by a failing battery or a firmware mismatch. Check battery health, then confirm the terminal is on the latest stable firmware version.",
    },
    {
      question: "Pos Not Responding",
      answer:
        "Hold the power button for 10 seconds to force a restart. If the terminal still doesn't respond, check the charging cable and power adapter before raising a hardware ticket.",
    },
    {
      question: "Paper Roll Not Printing",
      answer:
        "Open the printer cover and confirm the paper roll is seated the right way round. Clean the print head gently with a dry cloth and run a test print from device settings.",
    },
    {
      question: "Battery Or Charger Issue",
      answer:
        "Use only the charger shipped with the device. If the battery drains unusually fast or won't charge past a certain percentage, run a battery health check and raise a ticket if it fails.",
    },
  ],
  payments: [
    {
      question: "Why are some checkout payments failing intermittently?",
      answer:
        "Intermittent failures usually happen because of bank-side timeouts, issuer risk checks, or peak-hour routing congestion. Use smart retries and monitor issuer-level failure patterns.",
    },
    {
      question: "Failed transaction — what to do",
      answer:
        "Check the transaction status in the Payments tab before retrying — a failed status with no debit is safe to retry immediately, while a pending status should be given a few minutes to resolve on its own.",
    },
    {
      question: "When should I trigger an automatic retry?",
      answer:
        "Trigger retries only on retry-safe failure codes such as timeout or technical decline. Avoid retries for hard declines like blocked account or invalid PIN.",
    },
  ],
  upi: [
    {
      question: "UPI QR not working at checkout",
      answer:
        "Confirm the QR code hasn't expired and that the linked VPA is active. Regenerate the QR from the Payments app if it was created more than 24 hours ago.",
    },
    {
      question: "How can I improve payment success for UPI users?",
      answer:
        "Enable multiple PSP routes, keep intent and collect options available, and surface alternate UPI apps when one app path is degraded.",
    },
    {
      question: "Customer says amount was debited but order shows failed",
      answer:
        "This is usually a delayed webhook. Check the transaction status via RRN lookup — if the bank confirms a debit with no matching success status within 24 hours, it auto-reverses.",
    },
  ],
  settlements: [
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
  reports: [
    {
      question: "Report download failed",
      answer:
        "Large date ranges can time out during generation. Narrow the date range or reduce the selected columns, then retry — you'll also see the report under History once it completes.",
    },
    {
      question: "How do I schedule a recurring report?",
      answer:
        "Use Schedule report from the Reports page to set a frequency (daily/weekly/monthly) and recipients — the first report is delivered per the schedule's start date.",
    },
    {
      question: "Why don't yesterday's transactions show up in today's report?",
      answer:
        "Reports are generated as of the report creation time, not real time. Regenerate the report to include the latest data.",
    },
  ],
  "account-access": [
    {
      question: "I can't log in to my account",
      answer:
        "Confirm you're using the registered email or mobile number. Use Forgot password to reset — if the account shows as locked, raise a ticket for a manual unlock.",
    },
    {
      question: "How do I add a new team member?",
      answer:
        "Go to Settings → Manage users, invite by email, and assign a role. The invited user gets an activation link valid for 7 days.",
    },
    {
      question: "How do I change store or user permissions?",
      answer:
        "Roles and permissions are managed under Settings → Manage users & roles. Only Admin and Owner roles can edit another user's permissions.",
    },
  ],
  training: [
    {
      question: "Where can I find onboarding material for new staff?",
      answer:
        "The Training tab under All videos has short walkthroughs for daily POS operations, settlement checks, and common troubleshooting — a good first stop for new store staff.",
    },
    {
      question: "Is there a certification for store staff?",
      answer:
        "Not currently — training content is self-paced. We recommend every new team member completes the core device-operations videos in their first week.",
    },
  ],
  "pine-checkout": [
    {
      question: "How do I customize my checkout page?",
      answer:
        "Checkout branding, accepted payment modes, and EMI options can be configured from Payments → Checkout settings.",
    },
    {
      question: "Can I test checkout before going live?",
      answer:
        "Yes, use test mode (top-right toggle) to run sandbox transactions that don't affect real settlements.",
    },
    {
      question: "Why is my checkout success rate dropping?",
      answer:
        "Check the Reports tab for a breakdown of failure reasons by payment mode — a sudden drop is usually isolated to one issuer or payment method rather than checkout as a whole.",
    },
  ],
}

/** Aggregated across all topics for the Videos listing page. Titles/summaries below reuse
 *  the prior knowledge-hub video catalogue where topics map, extended to cover all 8 topics. */
export const SUPPORT_VIDEOS: KnowledgeVideo[] = [
  { title: "How to reconnect your billing terminal after a network drop", summary: "Restoring connectivity on a POS device after a GPRS/Wi-Fi drop.", duration: "04:12", level: "Beginner", topicSlug: "device-hardware" },
  { title: "Printer issue deep-dive", summary: "Diagnosing print-head and paper-sensor issues quickly.", duration: "11:46", level: "Intermediate", topicSlug: "device-hardware" },
  { title: "POS health checklist", summary: "Daily health checks for store operators and field teams.", duration: "09:12", level: "Beginner", topicSlug: "device-hardware" },
  { title: "Checkout diagnostics 101", summary: "Reading failure reasons and prioritizing high-impact fixes.", duration: "08:24", level: "Beginner", topicSlug: "payments" },
  { title: "How to retry a failed card payment without double charging", summary: "Safe retry patterns for card and UPI failures.", duration: "05:40", level: "Beginner", topicSlug: "payments" },
  { title: "Routing and retry strategy", summary: "How to configure resilient routing for peak-hour reliability.", duration: "14:10", level: "Intermediate", topicSlug: "payments" },
  { title: "How to check whether a pending UPI payment was captured correctly", summary: "Using RRN lookup to confirm UPI debit status.", duration: "06:05", level: "Beginner", topicSlug: "upi" },
  { title: "UPI collect vs intent — choosing the right flow", summary: "When to use collect requests versus app-intent links.", duration: "07:30", level: "Intermediate", topicSlug: "upi" },
  { title: "Daily MPR settlement steps", summary: "Downloading and reading your daily merchant payout report.", duration: "05:15", level: "Beginner", topicSlug: "settlements" },
  { title: "Settlement breakdown explained", summary: "Understanding gross, deductions, and net payout values.", duration: "10:02", level: "Beginner", topicSlug: "settlements" },
  { title: "Batch reconciliation workflow", summary: "How finance teams reconcile batches and bank entries.", duration: "13:31", level: "Advanced", topicSlug: "settlements" },
  { title: "Building your first custom report", summary: "Filters, columns, and scheduling for the reports module.", duration: "08:47", level: "Beginner", topicSlug: "reports" },
  { title: "Reading transaction reports for reconciliation", summary: "Matching report columns against bank statements.", duration: "09:55", level: "Intermediate", topicSlug: "reports" },
  { title: "Setting up roles and permissions", summary: "Structuring access for store staff, managers, and admins.", duration: "06:48", level: "Beginner", topicSlug: "account-access" },
  { title: "Recovering a locked account", summary: "Self-serve steps before raising an access ticket.", duration: "03:58", level: "Beginner", topicSlug: "account-access" },
  { title: "New staff onboarding walkthrough", summary: "A guided first day on the POS and dashboard.", duration: "12:33", level: "Beginner", topicSlug: "training" },
  { title: "How to fix card machine battery drain during store hours", summary: "Battery care and charging best practices for handheld POS.", duration: "04:47", level: "Beginner", topicSlug: "training" },
  { title: "Pine Labs DCC — choosing currency of choice made easy", summary: "Configuring dynamic currency conversion at checkout.", duration: "05:02", level: "Intermediate", topicSlug: "pine-checkout" },
  { title: "Customizing your checkout page", summary: "Branding, payment modes, and EMI options walkthrough.", duration: "07:18", level: "Beginner", topicSlug: "pine-checkout" },
  { title: "How to verify printer alignment and receipt readability on Pine devices", summary: "Quick print-quality checks after paper roll changes.", duration: "03:36", level: "Beginner", topicSlug: "pine-checkout" },
]
