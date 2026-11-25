/**
 * Guide's scripted conversation, ported from the playground's Osmosis Guide
 * assistant (merchant-onboarding-omni lib/guide/guide-script.ts, after the
 * "Guide - AI Assistant" Figma, page "Guide - V1"). Replies are data: text
 * (with **bold**), an optional card, follow-up chips and action buttons. The
 * chat screen only renders them; planReply decides what Guide says next.
 */

import { type AgentId, pendingApprovals } from "./agents"
import { AGENT_CREDIT_COST, formatCredits, spendCredits, walletBalance } from "./wallet"

export type HealthCheckKey = "battery" | "printer" | "software" | "connectivity"

export type GuideCard =
  | { kind: "kv"; rows: KvRow[]; footer?: { bank: string; label: string } }
  | { kind: "options"; options: string[] }
  | { kind: "health"; checks: { key: HealthCheckKey; ok: boolean }[] }
  | { kind: "device"; rows: KvRow[] }
  | { kind: "ticket-draft"; title: string; rows: KvRow[] }
  | { kind: "ticket"; status: "Open" | "Resolved"; title: string; when: string }
  | { kind: "callback" }
  | { kind: "vas" }
  | { kind: "success"; text: string }
  | { kind: "devices"; devices: string[]; selected: string[] }
  | { kind: "methods"; rows: { method: string; count: number; amount: string }[] }
  | { kind: "txn"; lines: string[] }
  | { kind: "donut" }
  | { kind: "trend" }
  /** Guide handing work to an agent: what it will do, what it costs in credits, and the wallet balance. */
  | { kind: "agent-credits"; agentId: AgentId; agentName: string; task: string; credits: number; rate: string; balance: number }

export type KvRow = { label: string; value: string; link?: boolean }

/** A follow-up the merchant can tap; it's sent as their next message. */
export type GuideChip = {
  label: string
  /** Handled by the chat surface instead of being answered. */
  effect?: "resolved" | "new-topic" | "shuffle" | "support"
}

export type GuideAction = {
  label: string
  tone?: "neutral" | "primary" | "support" | "danger"
  icon?: "ticket"
}

export type GuideReply = {
  text?: string
  /** Secondary line under the text, in muted grey. */
  note?: string
  tone?: "danger"
  card?: GuideCard
  /** Option lists and pickers disappear once the merchant moves on. */
  ephemeralCard?: boolean
  chips?: GuideChip[]
  actions?: GuideAction[]
  actionsLayout?: "stack" | "row" | "card"
  /** The Shuffle and Need support row under the chips. */
  extras?: boolean
}

export type GuideStep = { delay: number; reply: GuideReply }

type SupportIssue =
  | "Network issues"
  | "Internet not working"
  | "Screen problem"
  | "Battery draining soon"
  | "Printer issues"

export type GuideSession = {
  mode: "business" | "support"
  issue?: SupportIssue | string
  awaiting?: "txn-id" | "store-split"
  vas?: "offer" | "choose" | "done"
  ticketAttempts: number
  ticketsRaised: { title: string; when: string }[]
  /** An agent Guide has offered to run, awaiting the merchant's yes or no. */
  agentOffer?: "chargeback"
}

export const NEW_SESSION: GuideSession = { mode: "business", ticketAttempts: 0, ticketsRaised: [] }

export const SUPPORT_OPENER = "I need support assistance on a Pine product or service"

export const STARTER_POOL = [
  "What’s my total sales today",
  "How many transactions failed today",
  "Where is my last settlement",
  "Give me transaction trends",
  "Show my payment method split",
  "Check my payment failures for the past 3 hours",
  "Find a transaction by ID",
  "Show today’s sales by payment method",
  "Aaj ka total collection kitna hai?",
  "How am I doing in comparison to other business",
  "Help me handle my chargebacks",
]

export const SUPPORT_CATEGORIES = [
  "Device & Hardware",
  "Payments",
  "UPI",
  "Settlements",
  "Reports",
  "Training",
  "Pine Checkout",
  "Account & Access",
]

const DEVICE_ISSUES: SupportIssue[] = [
  "Network issues",
  "Internet not working",
  "Screen problem",
  "Battery draining soon",
  "Printer issues",
]

const CATEGORY_ISSUES: Record<string, string[]> = {
  Payments: ["A transaction failed", "Card payments are declining", "Refund not received by customer"],
  UPI: ["UPI payment pending", "QR code not working", "Payment received but not shown"],
  Settlements: ["Settlement not received", "My settlement amount is wrong", "Change settlement bank account"],
  Reports: ["Download MPR report", "Report numbers don’t match"],
  Training: ["Book a training session", "Watch tutorial videos"],
  "Pine Checkout": ["Payment link not working", "Integration help"],
  "Account & Access": ["Add a team member", "Reset my password", "Update business details"],
}

const ANSWERED_SUB_ISSUES = [
  "A transaction failed",
  "Card payments are declining",
  "UPI payment pending",
  "Payment received but not shown",
  "Settlement not received",
  "My settlement amount is wrong",
]

const DEVICE_ROWS: KvRow[] = [
  { label: "Device", value: "PAX A910" },
  { label: "Store", value: "986730" },
  { label: "PosID", value: "4287664" },
  { label: "Location", value: "Koramangala", link: true },
]

const ISSUE_TICKET_TITLE: Record<SupportIssue, string> = {
  "Network issues": "Terminal keeps losing network. Payments time out.",
  "Internet not working": "Terminal not connecting to the internet. Not able to receive payments",
  "Screen problem": "Terminal screen frozen after restart. Not able to receive payments",
  "Battery draining soon": "Terminal battery drains within a few hours",
  "Printer issues": "Printer out of paper. Not able to print charge slips",
}

const ISSUE_FAILING_CHECK: Record<SupportIssue, HealthCheckKey> = {
  "Network issues": "connectivity",
  "Internet not working": "connectivity",
  "Screen problem": "software",
  "Battery draining soon": "battery",
  "Printer issues": "printer",
}

const ISSUE_FINDING: Record<SupportIssue, string> = {
  "Network issues": "**the 4G signal at the counter is weak**",
  "Internet not working": "**the device is not connected to the internet**",
  "Screen problem": "**the display driver needs a restart**",
  "Battery draining soon": "**the battery health is at 41%**",
  "Printer issues": "**device is out of Printing paper**",
}

const POS_DEVICES = ["P-3213", "P-3214", "P-3215", "P-3216", "P-3217", "P-3218"]

const RESOLVED_CHIPS: GuideChip[] = [
  { label: "My issue is resolved", effect: "resolved" },
  { label: "I need other help", effect: "new-topic" },
]

const SETTLEMENT_ROWS: KvRow[] = [
  { label: "Amount", value: "₹42,180" },
  { label: "Status", value: "Processed" },
  { label: "Settlement date", value: "22 Sep 2026" },
  { label: "UTR", value: "428731920184" },
]

const HDFC_FOOTER = { bank: "HDFC", label: "Settled to HDFC XXXX3456" }

function step(reply: GuideReply, delay = 700): GuideStep {
  return { delay, reply }
}

function healthChecks(failing: HealthCheckKey) {
  return (["battery", "printer", "software", "connectivity"] as const).map((key) => ({ key, ok: key !== failing }))
}

function ticketDraft(session: GuideSession): GuideReply {
  const issue = session.issue ?? "Screen problem"
  const title = ISSUE_TICKET_TITLE[issue as SupportIssue] ?? issue
  return {
    text: "I’ll create a support request with these details",
    card: { kind: "ticket-draft", title, rows: DEVICE_ROWS },
    actions: [
      { label: "Create a ticket" },
      { label: "Edit details" },
      { label: "Cancel", tone: "danger" },
    ],
  }
}

function deviceIssueReplies(issue: SupportIssue): GuideStep[] {
  if (issue === "Screen problem") {
    return [
      step({ text: "Let’s check your device, don’t exit the chat while we try to connect with your device" }, 600),
      step(
        {
          text: "I found a device - **POS 4287664**.",
          card: {
            kind: "device",
            rows: [
              { label: "Device", value: "PAX A910" },
              { label: "Store", value: "986730" },
              { label: "Status", value: "Online" },
              { label: "Network", value: "4G" },
              { label: "Battery", value: "78%" },
            ],
          },
        },
        1800
      ),
      step(
        {
          text:
            "Since the terminal is freezing, please **restart it once and check whether the screen responds normally**.\n\nLet me know what happens after the restart.",
          actions: [{ label: "It’s working now" }, { label: "Still having problem" }],
          actionsLayout: "row",
        },
        900
      ),
    ]
  }

  const actions: GuideAction[] =
    issue === "Printer issues"
      ? [{ label: "Order paper roll" }, { label: "Raise support ticket", tone: "support", icon: "ticket" }]
      : [{ label: "Try another fix" }, { label: "Raise support ticket", tone: "support", icon: "ticket" }]

  return [
    step({ text: "Let’s check your device, don’t exit the chat while we try to connect with your device" }, 600),
    step(
      {
        text: `We have found 1 device linked to your account.\nDevice health check report on 25 Sept 12:36 PM found that your ${ISSUE_FINDING[issue]}`,
        card: { kind: "health", checks: healthChecks(ISSUE_FAILING_CHECK[issue]) },
        actions,
      },
      2000
    ),
  ]
}

function strip(text: string) {
  return text.replace(/\*\*/g, "").replace(/[’']/g, "'").trim().toLowerCase()
}

/** What Guide says next, given the merchant's message and the session so far. */
export function planReply(
  input: string,
  session: GuideSession,
  payload?: { devices?: string[] }
): { steps: GuideStep[]; session: GuideSession } {
  const text = strip(input)
  const has = (pattern: RegExp) => pattern.test(text)
  const next: GuideSession = { ...session }
  const reply = (steps: GuideStep[]) => ({ steps, session: next })

  // ---- Support: categories, device issues, tickets ------------------------

  if (text === strip(SUPPORT_OPENER) || has(/^(need support|i need support|talk to support)$/)) {
    next.mode = "support"
    return reply([
      step({
        text: "We are happy to help solving your issue. Help us with the issue that you are facing currently.",
        card: { kind: "options", options: SUPPORT_CATEGORIES },
        ephemeralCard: true,
      }),
    ])
  }

  const category = SUPPORT_CATEGORIES.find((item) => strip(item) === text)
  if (category) {
    next.mode = "support"
    if (category === "Device & Hardware") {
      return reply([
        step({
          text: "What is the problem you are facing with your device?",
          card: { kind: "options", options: DEVICE_ISSUES },
          ephemeralCard: true,
        }),
      ])
    }
    return reply([
      step({
        text: `What’s going on with ${category === "UPI" ? "UPI" : category.toLowerCase()}?`,
        card: { kind: "options", options: CATEGORY_ISSUES[category] ?? [] },
        ephemeralCard: true,
      }),
    ])
  }

  const deviceIssue = DEVICE_ISSUES.find((item) => strip(item) === text)
  if (deviceIssue) {
    next.mode = "support"
    next.issue = deviceIssue
    return reply(deviceIssueReplies(deviceIssue))
  }

  if (has(/^order paper roll/)) {
    return reply([
      step({
        text: "Done. I’ve ordered **2 paper rolls** for POS 4287664. They’ll reach the Koramangala store in **2 working days**.",
        note: "Until then, you can share receipts with customers by SMS from the terminal.",
        chips: RESOLVED_CHIPS,
      }),
    ])
  }

  if (has(/^raise (a )?support ticket$/)) {
    next.mode = "support"
    return reply([step(ticketDraft(next))])
  }

  if (has(/^(create a ticket|create support ticket|try again|create new ticket)$/)) {
    const issue = (next.issue as SupportIssue | undefined) ?? "Screen problem"
    const title = ISSUE_TICKET_TITLE[issue] ?? String(issue)
    next.ticketAttempts += 1

    // The screen freeze already has a ticket open (Figma "Existing ticket").
    if (issue === "Screen problem" && text !== "create new ticket") {
      return reply([
        step(
          {
            text: "You have an existing ticket with this issue, it will be resolved in the next 3 working days",
            card: { kind: "ticket", status: "Open", title, when: "6 May, 12:42 pm" },
            chips: RESOLVED_CHIPS,
          },
          1100
        ),
      ])
    }

    // The first try for a connectivity issue fails, to show "Ticket creation failed".
    if (issue === "Internet not working" && next.ticketAttempts === 1) {
      return reply([
        step(
          {
            text: "I couldn't create the ticket right now.\nYour details are still here, so you don't need to enter them again.",
            tone: "danger",
            card: { kind: "ticket-draft", title, rows: DEVICE_ROWS },
            actions: [{ label: "Try again" }, { label: "Edit details" }, { label: "Cancel", tone: "danger" }],
          },
          1100
        ),
      ])
    }

    next.ticketsRaised = [{ title, when: "Today, just now" }, ...next.ticketsRaised]
    return reply([
      step(
        {
          text: "Your ticket **SR-48213** is raised. Our team will get back to you within **24 hours**.",
          card: { kind: "ticket", status: "Open", title, when: "Today, just now" },
          chips: RESOLVED_CHIPS,
        },
        1100
      ),
    ])
  }

  if (has(/^(edit details|change address)$/)) {
    return reply([
      step({
        text: "Sure. Tell me what to change, for example the **issue description** or the **store location**, and I’ll update the request.",
      }),
    ])
  }

  if (text === "cancel") {
    return reply([
      step({
        text: "No problem, I haven’t raised a ticket. Is there anything else I can help with?",
        chips: [{ label: "I need other help", effect: "new-topic" }, { label: "Done" }],
      }),
    ])
  }

  if (has(/^it'?s working now$/)) {
    return reply([step({ text: "Great, glad the restart fixed it.", chips: RESOLVED_CHIPS })])
  }

  if (has(/^still having problem/)) {
    return reply([
      step({
        text: "Since restarting didn't fix the issue, I can raise a terminal support request for POS 4287664.",
        actions: [{ label: "Try another fix" }, { label: "Raise support ticket", tone: "support", icon: "ticket" }],
      }),
    ])
  }

  if (has(/^try another fix$/)) {
    return reply([
      step({
        text:
          "Let’s try a hard reset: **switch the terminal off, take the battery out for 30 seconds**, then start it again.\n\nLet me know what happens after the restart.",
        actions: [{ label: "It’s working now" }, { label: "Still having problem" }],
        actionsLayout: "row",
      }),
    ])
  }

  if (has(/talk to (a )?(human|person|agent|someone)|call ?back|call me|request a callback/)) {
    next.mode = "support"
    return reply([
      step({
        text: "I can create a **support request** so the team can follow up with you.",
        card: { kind: "callback" },
        chips: [{ label: "Need help with something else" }, { label: "Done" }],
      }),
    ])
  }

  if (text === "done") {
    return reply([step({ text: "Happy to help. I’m here if you need anything else.", extras: true })])
  }

  if (has(/^need help with something else$/)) {
    return reply([
      step({
        text: "Sure, what else can I help with?",
        chips: STARTER_POOL.slice(0, 3).map((label) => ({ label })),
        extras: true,
      }),
    ])
  }

  // ---- International card VAS --------------------------------------------

  // ---- Handing work to an agent (uses agent credits) ---------------------

  if (session.agentOffer === "chargeback" && text === "start agent") {
    next.agentOffer = undefined
    const cases = pendingApprovals("chargeback")
    const credits = AGENT_CREDIT_COST.chargeback.credits * cases.length
    if (!spendCredits("chargeback", "Chargeback Agent", `${cases.length} chargebacks · via Guide`, credits)) {
      return reply([
        step({
          text: `You need **${credits} credits** for this and have **${formatCredits(walletBalance())}**. Add credits from your wallet (the coins at the top of Agents), then ask me again.`,
          tone: "danger",
          chips: [{ label: "Need help with something else" }],
        }),
      ])
    }
    return reply([
      step(
        {
          card: {
            kind: "success",
            text: `The **Chargeback Agent** is on it: gathering evidence and drafting rebuttals for ${cases.length} chargebacks. **${credits} credits** used, **${formatCredits(walletBalance())} credits** left.`,
          },
          chips: [{ label: "Need help with something else" }, { label: "Done" }],
        },
        1000
      ),
    ])
  }

  if (session.agentOffer === "chargeback" && text === "not now") {
    next.agentOffer = undefined
    return reply([
      step({
        text: "No problem. Your chargebacks stay as they are; ask me whenever you want the Chargeback Agent to take them on.",
        chips: [{ label: "Need help with something else" }, { label: "Done" }],
      }),
    ])
  }

  if (has(/chargeback|dispute/)) {
    const cases = pendingApprovals("chargeback")
    const worth = cases.reduce((sum, item) => sum + Number(item.title.split("₹")[1]?.replace(/,/g, "") ?? 0), 0)
    const { credits: rate, per } = AGENT_CREDIT_COST.chargeback
    next.agentOffer = "chargeback"
    return reply([
      step({
        text: `You have **${cases.length} chargebacks** waiting, worth **₹${worth.toLocaleString("en-IN")}**. ${cases[0].title.replace(" · ", " for ")} is due first.`,
      }),
      step(
        {
          text: "I can hand them to the **Chargeback Agent**. It gathers the evidence and drafts a rebuttal for each, and nothing goes to the bank until you approve.",
          card: {
            kind: "agent-credits",
            agentId: "chargeback",
            agentName: "Chargeback Agent",
            task: `${cases.length} chargebacks`,
            credits: rate * cases.length,
            rate: `${rate} credits per ${per}`,
            balance: walletBalance(),
          },
          actions: [{ label: "Not now" }, { label: "Start agent", tone: "primary" }],
          actionsLayout: "card",
        },
        600
      ),
    ])
  }

  if (has(/payment failures|transactions failed|failed today|card payments are declining/)) {
    next.vas = "offer"
    return reply([
      step({
        text:
          "You had 2 payment failures in the last 3 hours. Both the payment failures were on Amex credit cards on your POS device **P-3213.** The failures were caused because international cards are not enabled for you.",
      }, 900),
      step(
        {
          card: { kind: "vas" },
          actions: [{ label: "Not now" }, { label: "Enable VAS", tone: "primary" }],
          actionsLayout: "card",
        },
        400
      ),
    ])
  }

  if (text === "enable vas" && payload?.devices) {
    next.vas = "done"
    const count = payload.devices.length
    return reply([
      step(
        {
          card: {
            kind: "success",
            text: `I have successfully enabled “**International Card**” value aided service (VAS) for ${count} device${count === 1 ? "" : "s"}. You can now accept payments through those cards`,
          },
          chips: [{ label: "Need help with something else" }, { label: "Done" }],
        },
        1000
      ),
    ])
  }

  if (text === "enable vas") {
    next.vas = "choose"
    return reply([
      step({
        text:
          "I have found 6 POS devices linked to your ID. Before I proceed I need the confirmation on which devices you want the VAS enabled on",
        actions: [
          { label: "Enable only for **P-3213**" },
          { label: "Enable for all devices" },
          { label: "Select devices" },
        ],
      }),
    ])
  }

  if (has(/^enable only for p-3213$|^enable for all devices$/)) {
    next.vas = "done"
    const all = text.includes("all")
    return reply([
      step(
        {
          card: {
            kind: "success",
            text: all
              ? "I have successfully enabled “**International Card**” value aided service (VAS) for all 6 devices. You can now accept payments through those cards"
              : "I have enabled “**International Card**” value aided service (VAS). You can now accept payments through those cards",
          },
          chips: [{ label: "Need help with something else" }, { label: "Done" }],
        },
        1000
      ),
    ])
  }

  if (text === "select devices") {
    return reply([
      step({
        text: "Pick the devices you want the VAS enabled on.",
        card: { kind: "devices", devices: POS_DEVICES, selected: ["P-3213"] },
      }),
    ])
  }

  if (text === "not now") {
    next.vas = "done"
    return reply([
      step({
        text: "Okay, I won’t enable it. International cards will keep failing on **P-3213** until it’s on. You can ask me any time.",
        chips: [{ label: "Need help with something else" }, { label: "Done" }],
      }),
    ])
  }

  // Sub-issues from the other support categories go to a person, unless
  // Guide can answer them itself below.
  const subIssue = Object.values(CATEGORY_ISSUES).flat().find((item) => strip(item) === text)
  if (subIssue && !ANSWERED_SUB_ISSUES.includes(subIssue)) {
    next.mode = "support"
    next.issue = subIssue
    return reply([
      step({
        text: "This one needs a specialist. I can create a **support request** so the team can follow up with you.",
        actions: [{ label: "Request a callback" }, { label: "Raise support ticket", tone: "support", icon: "ticket" }],
      }),
    ])
  }

  // ---- Business queries ---------------------------------------------------

  if (next.awaiting === "store-split" && (text === "yes" || text === "no")) {
    next.awaiting = undefined
    if (text === "no") {
      return reply([step({ text: "Okay. Anything else you’d like to look at?", extras: true })])
    }
    return reply([
      step({
        text:
          "Store 986730 collected **₹14,180** today across **13** transactions.\nStore 986731 collected **₹42,552** today across **35** transactions.",
        chips: [{ label: "Where is my last settlement" }, { label: "Give me transaction trends" }],
      }),
    ])
  }

  if (has(/by payment method|by method|payment mode/)) {
    next.awaiting = "store-split"
    return reply([
      step({
        text: "Your total collection today is\n**₹56,732** across **48** transactions.",
        card: {
          kind: "methods",
          rows: [
            { method: "Card", count: 29, amount: "₹41,180" },
            { method: "UPI", count: 18, amount: "₹14,347" },
            { method: "Wallet", count: 1, amount: "₹1,205" },
          ],
        },
      }),
      step({ text: "Want to see this by store?", actions: [{ label: "Yes" }, { label: "No" }], actionsLayout: "row" }, 200),
    ])
  }

  if (has(/aaj|kitna|kitni|bataiye|batao/)) {
    return reply([
      step({
        text: "Aaj aapka total collection **₹56,732** hai **48** baar transactions hue\nStore-wise breakdown bhi dikha sakta hoon",
        chips: [{ label: "Show today’s sales by payment method" }, { label: "Where is my last settlement" }],
      }),
    ])
  }

  if (has(/total sales|total collection|sales today|collection today/)) {
    return reply([
      step({
        text: "Your total collection today is **₹56,732** across **48** transactions",
        chips: [{ label: "Where is my last settlement" }, { label: "Give me transaction trends" }],
      }),
    ])
  }

  if (has(/view breakdown|less amount|deduction|my settlement amount is wrong|why is (there|my).*(less|lower)|mdr/)) {
    return reply([
      step({
        text: "Your settlement is calculated after applicable deductions.",
        card: {
          kind: "kv",
          rows: [
            { label: "Gross Amount", value: "₹42,680" },
            { label: "MDR", value: "₹420" },
            { label: "GST", value: "₹80" },
            { label: "Net settlement", value: "₹42,180" },
          ],
        },
        chips: [{ label: "My issue is resolved", effect: "resolved" }, { label: "Need help with something else" }],
        extras: true,
      }),
    ])
  }

  if (has(/check another settlement/)) {
    return reply([
      step({
        text: "Here is the settlement before that",
        card: {
          kind: "kv",
          rows: [
            { label: "Amount", value: "₹38,940" },
            { label: "Status", value: "Processed" },
            { label: "Settlement date", value: "21 Sep 2026" },
            { label: "UTR", value: "428731877102" },
          ],
          footer: HDFC_FOOTER,
        },
        chips: [{ label: "View breakdown" }, { label: "Give me transaction trends" }],
      }),
    ])
  }

  if (has(/settlement/)) {
    return reply([
      step({
        text: "Here is the detail of your settlement amount",
        card: { kind: "kv", rows: SETTLEMENT_ROWS, footer: HDFC_FOOTER },
        chips: [{ label: "View breakdown" }, { label: "Check another settlement" }],
      }),
    ])
  }

  if (has(/trend|mom\b|month on month|income/)) {
    return reply([
      step({
        text: "Here’s a monthly trend of your income through Pine payment methods. Your income has grown **16% MoM**",
        card: { kind: "trend" },
        chips: [{ label: "Show my payment method split" }, { label: "How am I doing in comparison to other business" }],
      }),
    ])
  }

  if (has(/split|payment methods?|how (do|did) (my )?customers pay/)) {
    return reply([
      step({
        text: "Your customers paid using UPI the most.\nHere’s a split of payment methods",
        card: { kind: "donut" },
        chips: [{ label: "Tell me about my income trend" }, { label: "How am I doing in comparison to other business" }],
      }),
    ])
  }

  if (has(/comparison|compare|other business/)) {
    return reply([
      step({
        text:
          "You’re ahead of **68%** of electronics stores in Koramangala this month. Your average ticket size is **₹1,182**, 14% above the area median.",
        chips: [{ label: "Give me transaction trends" }, { label: "Show my payment method split" }],
      }),
    ])
  }

  // ---- Transactions -------------------------------------------------------

  const txnId = input.match(/\b\d{8,}\b/)?.[0]
  if (txnId) {
    next.awaiting = undefined
    if (!txnId.startsWith("2")) {
      return reply([
        step({
          text: `I **couldn't find** a transaction matching that **${txnId}**.`,
          note: "Please check the Transaction ID and send it again.",
        }),
      ])
    }
    return reply([
      step({
        text: `I found transaction **${txnId}.**`,
        card: { kind: "txn", lines: ["Amount: ₹110", "Payment mode: UPI", "Status: Pending final confirmation"] },
      }),
      step({ text: "Want me to check the latest status?", chips: [{ label: "Check latest status" }] }, 200),
    ])
  }

  if (has(/check latest status/)) {
    return reply([
      step(
        {
          text:
            "This transaction was **not completed successfully**.\nThe customer’s bank reversed it, so the ₹110 will go back to them within 5 working days.",
          chips: [{ label: "I need other help", effect: "new-topic" }, { label: "Done" }],
        },
        1000
      ),
    ])
  }

  if (has(/transaction id|find (a )?transaction|a transaction failed|upi payment pending|payment received but not shown/)) {
    next.awaiting = "txn-id"
    return reply([
      step({ text: "I can check that.\nPlease share the **Transaction ID** so I can find the exact payment." }),
    ])
  }

  // ---- Device words without the menu --------------------------------------

  if (has(/paper|printer|print/)) {
    next.mode = "support"
    next.issue = "Printer issues"
    return reply(deviceIssueReplies("Printer issues"))
  }

  if (has(/frozen|freez|screen|terminal|device|pos\b/)) {
    next.mode = "support"
    next.issue = "Screen problem"
    return reply(deviceIssueReplies("Screen problem"))
  }

  if (has(/support|help|issue|problem|complain|not working/)) {
    next.mode = "support"
    return reply([
      step({
        text: "We are happy to help solving your issue. Help us with the issue that you are facing currently.",
        card: { kind: "options", options: SUPPORT_CATEGORIES },
        ephemeralCard: true,
      }),
    ])
  }

  if (has(/^something else$/)) {
    return reply([
      step({
        text: "Tell me a little more and I’ll take it from there. You can also talk to someone from our team.",
        chips: [{ label: "Talk to a person" }],
      }),
    ])
  }

  // ---- Not sure what they mean --------------------------------------------

  return reply([
    step({
      text: "I can help. Which of these do you mean?",
      chips: [{ label: "A transaction failed" }, { label: "My settlement amount is wrong" }, { label: "Something else" }],
    }),
  ])
}

/** Sentence-cased titles for past chats, as History lists them. */
export function titleFor(text: string) {
  const clean = strip(text).replace(/\?$/, "")
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

export const PAST_QUERIES = [
  "Total sales yesterday",
  "Settlement breakdown for 20 Sep",
  "Why my settlement was lower than sales",
  "Refunds issued this week",
  "Store-wise collection for September",
  "Average ticket size this month",
  "UPI vs card share in August",
  "Find transaction 2034311870",
  "Monthly income trend",
  "Failed payments on P-3215",
  "Payout schedule during Diwali",
  "Compare Koramangala and Indiranagar stores",
]

export const PAST_TICKETS = {
  open: ["Terminal screen frozen after restart", "QR code standee not delivered"],
  resolved: [
    "Printer out of paper on P-3214",
    "Settlement delayed on bank holiday",
    "Add a team member to Pine One",
    "Card payments declining on P-3216",
    "Battery draining quickly on P-3213",
    "MPR report for August",
  ],
}
