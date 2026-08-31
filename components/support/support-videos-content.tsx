"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, ClockIcon, MagnifyingGlassIcon, PlayCircleIcon } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PAGE_HEADING_CLASSES } from "@/components/shared/listing-page-primitives"
import { SUPPORT_VIDEOS } from "@/lib/support-knowledge"

export function SupportVideosContent() {
  const [search, setSearch] = useState("")

  const videos = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return SUPPORT_VIDEOS
    return SUPPORT_VIDEOS.filter((video) => video.title.toLowerCase().includes(q))
  }, [search])

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
        <h1 className={PAGE_HEADING_CLASSES}>All videos</h1>
        <div className="relative w-[260px]">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search videos"
            className="h-9 rounded-[8px] border-input bg-background pl-9 text-sm"
          />
        </div>
      </div>

      <div className="px-8 pt-6">
        {videos.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">No videos match your search.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <div key={video.title} className="group">
                <button
                  type="button"
                  className="flex aspect-video w-full items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/60 transition-colors hover:from-muted/80"
                >
                  <PlayCircleIcon weight="fill" className="h-10 w-10 text-foreground/70 transition-transform group-hover:scale-110" />
                </button>
                <p className="mt-2 text-sm font-medium text-foreground">{video.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{video.summary}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {video.level}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {video.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
