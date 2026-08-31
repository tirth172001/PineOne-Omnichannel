"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LINE_TAB_TRIGGER_CLASSES, LINE_TABS_LIST_CLASSES, PAGE_HEADING_CLASSES } from "@/components/shared/listing-page-primitives"
import { SUPPORT_TOPICS, TOPIC_FAQS, type SupportTopicSlug } from "@/lib/support-knowledge"

export function SupportFaqsContent() {
  const searchParams = useSearchParams()
  const initialTopic = (searchParams.get("topic") as SupportTopicSlug | null) ?? SUPPORT_TOPICS[0].slug
  const [activeTopic, setActiveTopic] = useState<SupportTopicSlug>(
    SUPPORT_TOPICS.some((topic) => topic.slug === initialTopic) ? initialTopic : SUPPORT_TOPICS[0].slug
  )
  const [search, setSearch] = useState("")

  const faqs = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = TOPIC_FAQS[activeTopic] ?? []
    if (!q) return list
    return list.filter((faq) => faq.question.toLowerCase().includes(q))
  }, [activeTopic, search])

  return (
    <div className="pb-10">
      <div className="px-8 pt-6">
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 rounded-md px-2 text-xs text-foreground hover:bg-muted">
          <Link href="/support">
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 px-8 pt-2">
        <h1 className={PAGE_HEADING_CLASSES}>All FAQs</h1>
        <div className="relative w-[260px]">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search FAQs"
            className="h-9 rounded-[8px] border-input bg-background pl-9 text-sm"
          />
        </div>
      </div>

      <div className="px-8 pt-6">
        <Tabs value={activeTopic} onValueChange={(value) => setActiveTopic(value as SupportTopicSlug)}>
          <TabsList variant="line" className={LINE_TABS_LIST_CLASSES}>
            {SUPPORT_TOPICS.map((topic) => (
              <TabsTrigger key={topic.slug} value={topic.slug} className={LINE_TAB_TRIGGER_CLASSES}>
                {topic.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Separator className="mt-2" />

      <div className="px-8 pt-4">
        {faqs.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">No FAQs match your search.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-left text-sm font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}
