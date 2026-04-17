import Link from "next/link"
import { notFound } from "next/navigation"
import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/panels"
import { getKnowledgeTopicBySlug } from "@/lib/support-knowledge"
import { Clock3, PlayCircle } from "lucide-react"

type PageProps = {
  params: Promise<{ topic: string }>
}

export default async function KnowledgeTopicPage({ params }: PageProps) {
  const { topic } = await params
  const item = getKnowledgeTopicBySlug(topic)
  if (!item) notFound()

  return (
    <V2DashboardLayout>
      <PageHeader
        title={item.title}
        subtitle={item.description}
        actions={
          <Button asChild size="sm" variant="outline" className="h-8 text-xs">
            <Link href="/support/support-queries">Raise support query</Link>
          </Button>
        }
        backHref="/support/knowledge-hub"
        backLabel="Back to knowledge hub"
      />

      <WorkspaceShell
        centerMain={
          <div className="h-full overflow-y-auto p-4 space-y-4">
            <Card className="rounded-lg border-border/70 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">FAQs</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {item.faqs.map((faq, index) => (
                    <AccordionItem value={`faq-${index}`} key={faq.question}>
                      <AccordionTrigger className="text-left text-sm">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-border/70 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Training videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.videos.map((video) => (
                    <div
                      key={video.title}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <PlayCircle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{video.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{video.summary}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{video.level}</Badge>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            {video.duration}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                        Watch
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
    </V2DashboardLayout>
  )
}
