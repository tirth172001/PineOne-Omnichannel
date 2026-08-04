import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SubPagePlaceholderProps {
  section: string
  page: string
  parentHref: string
  parentLabel: string
  description?: string
}

export function SubPagePlaceholder({ section, page, parentHref, parentLabel, description }: SubPagePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-border/70 bg-card/50 px-6 py-4">
        <Link
          href={parentHref}
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {parentLabel}
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{page}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center space-y-3 max-w-sm">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-lg text-primary font-semibold">
              {page.charAt(0)}
            </span>
          </div>
          <h2 className="text-base font-medium text-foreground">
            {section} · {page}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a placeholder for the {page.toLowerCase()} section under {section}. Content and data will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
