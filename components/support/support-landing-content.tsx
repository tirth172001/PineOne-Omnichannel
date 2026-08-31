"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowCounterClockwiseIcon, ChatCircleTextIcon, PlayCircleIcon } from "@phosphor-icons/react"
import { PAGE_HEADING_CLASSES } from "@/components/shared/listing-page-primitives"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import { SupportTopicIcon } from "@/components/support/support-topic-icon"
import { TicketDetailPanel } from "@/components/support/ticket-detail-panel"
import { TicketEditPanel, type TicketEditDraft } from "@/components/support/ticket-edit-panel"
import { Button } from "@/components/ui/button"
import { SUPPORT_TOPICS, SUPPORT_VIDEOS } from "@/lib/support-knowledge"
import { SUPPORT_TICKETS, type SupportTicket, type TicketStatus } from "@/lib/support-tickets"

const QUICK_ACTIONS = ["Get payout report", "Request Paper roll", "VAS Activation"]

function ticketStatusTone(status: TicketStatus): StatusTone {
  if (status === "Resolved") return "success"
  if (status === "In progress") return "initiated"
  return "processing"
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <Button asChild variant="link" className="h-auto p-0 text-sm text-primary">
        <Link href={href}>View all</Link>
      </Button>
    </div>
  )
}

export function SupportLandingContent() {
  const router = useRouter()
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS)

  const recentTickets = tickets.slice(0, 3)
  const previewTopics = SUPPORT_TOPICS.slice(0, 6)
  const previewVideos = SUPPORT_VIDEOS.slice(0, 3)

  function openDetail(ticket: SupportTicket) {
    setSelectedTicket(ticket)
    setDetailOpen(true)
  }

  function openEdit(ticket: SupportTicket) {
    setSelectedTicket(ticket)
    setDetailOpen(false)
    setEditOpen(true)
  }

  function handleSaveEdit(draft: TicketEditDraft) {
    if (!selectedTicket) return
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              category: draft.category,
              product: draft.product,
              issue: draft.issueDescription,
              deviceId: draft.posId || ticket.deviceId,
              storeDetails: { name: draft.storeName, contact: draft.storeContact, address: draft.storeAddress },
            }
          : ticket
      )
    )
  }

  return (
    <div className="pb-10">
      <div className="px-8 pt-8">
        <h1 className={PAGE_HEADING_CLASSES}>Support</h1>
      </div>

      <div className="mx-8 mt-6 rounded-xl border border-border/70 bg-muted/30 px-8 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <ArrowCounterClockwiseIcon className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">We&apos;re here for your help</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button key={action} variant="outline" size="sm" className="h-8 rounded-full text-xs">
              {action}
            </Button>
          ))}
        </div>
        <Button className="mt-5 gap-2" onClick={() => router.push("/support/chat")}>
          <ChatCircleTextIcon className="h-4 w-4" />
          Chat with us
        </Button>
      </div>

      <div className="space-y-10 px-8 pt-10">
        <section className="space-y-4">
          <SectionHeader title="Support tickets" href="/support/tickets" />
          <div className="grid gap-3 sm:grid-cols-3">
            {recentTickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => openDetail(ticket)}
                className="rounded-lg border border-border/70 bg-card p-4 text-left transition-colors hover:bg-muted/35"
              >
                <StatusPill label={ticket.status} tone={ticketStatusTone(ticket.status)} />
                <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{ticket.issue}</p>
                <p className="mt-1 text-xs text-muted-foreground">{ticket.createdAt}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="All topics" href="/support/faqs" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {previewTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/support/faqs?topic=${topic.slug}`}
                className="flex items-center gap-3 rounded-lg border border-border/70 bg-card px-4 py-3.5 transition-colors hover:bg-muted/35"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <SupportTopicIcon topicSlug={topic.slug} className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground">{topic.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Tutorial videos" href="/support/videos" />
          <div className="grid gap-3 sm:grid-cols-3">
            {previewVideos.map((video) => (
              <Link key={video.title} href="/support/videos" className="group block">
                <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/60">
                  <PlayCircleIcon weight="fill" className="h-10 w-10 text-foreground/70 transition-transform group-hover:scale-110" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{video.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <TicketDetailPanel open={detailOpen} onOpenChange={setDetailOpen} ticket={selectedTicket} onEdit={openEdit} />
      <TicketEditPanel open={editOpen} onOpenChange={setEditOpen} ticket={selectedTicket} onSave={handleSaveEdit} />
    </div>
  )
}
