"use client"

import { CheckCircle2, Download, FileUp, Loader2 } from "lucide-react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export type BulkOperationState = "idle" | "processing" | "partial-failed" | "completed"

type BulkOperationSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  templateSummary: string
  status: BulkOperationState
  progressPercent: number
  processedRows: number
  totalRows: number
  estimatedMinutes?: number
  uploadedFileName?: string
  accept?: string
  onDownloadTemplate: () => void
  onFilePicked: (event: ChangeEvent<HTMLInputElement>) => void
  onStart: () => void
  onBackground?: () => void
  onRetryFailed?: () => void
  onDownloadErrors?: () => void
  onDone?: () => void
  startLabel?: string
}

export function BulkOperationSheet({
  open,
  onOpenChange,
  title,
  description,
  templateSummary,
  status,
  progressPercent,
  processedRows,
  totalRows,
  estimatedMinutes,
  uploadedFileName,
  accept = ".csv,.xlsx,.xls",
  onDownloadTemplate,
  onFilePicked,
  onStart,
  onBackground,
  onRetryFailed,
  onDownloadErrors,
  onDone,
  startLabel = "Upload and process",
}: BulkOperationSheetProps) {
  const isIdle = status === "idle"
  const isProcessing = status === "processing"
  const isPartialFailed = status === "partial-failed"
  const isCompleted = status === "completed"

  const progressLabel = isPartialFailed ? "Processed with row-level errors" : "Processing uploaded file"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        a11yTitle={title}
        a11yDescription={description}
        className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[460px]"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {isProcessing || isPartialFailed ? (
              <div className="space-y-4 rounded-lg border border-border/70 bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{progressLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {estimatedMinutes && estimatedMinutes > 0
                        ? `About ${estimatedMinutes} min remaining`
                        : "Finishing up validation and processing"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Processed rows</span>
                    <span className="font-medium text-foreground">
                      {processedRows.toLocaleString("en-IN")} / {totalRows.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File</span>
                    <span className="font-medium text-foreground">{uploadedFileName || "-"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {onBackground ? (
                    <Button variant="outline" onClick={onBackground}>
                      Move to background
                    </Button>
                  ) : null}
                  {isPartialFailed && onDownloadErrors ? (
                    <Button variant="outline" onClick={onDownloadErrors}>
                      Download errors
                    </Button>
                  ) : null}
                  {isPartialFailed && onRetryFailed ? (
                    <Button onClick={onRetryFailed}>Retry failed rows</Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {isCompleted ? (
              <div className="space-y-4 rounded-lg border border-success/35 bg-card p-4">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Bulk operation completed</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {processedRows.toLocaleString("en-IN")} rows processed successfully.
                  </p>
                </div>
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Processed rows</span>
                    <span className="font-medium text-foreground">
                      {processedRows.toLocaleString("en-IN")} / {totalRows.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Upload</span>
                    <span className="font-medium text-foreground">{uploadedFileName || "-"}</span>
                  </div>
                </div>
                <Button className="w-full" onClick={onDone}>
                  Done
                </Button>
              </div>
            ) : null}

            {isIdle ? (
              <>
                <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
                  <p className="text-xs font-medium text-foreground">1. Download template</p>
                  <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{templateSummary}</p>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onDownloadTemplate}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download template
                    </Button>
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
                  <p className="text-xs font-medium text-foreground">2. Upload prepared file</p>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-center">
                    <FileUp className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">Upload file</p>
                      <p className="text-[11px] text-muted-foreground">Supports .csv, .xlsx, .xls</p>
                    </div>
                    <Input type="file" accept={accept} onChange={onFilePicked} className="sr-only" />
                  </label>
                  {uploadedFileName ? (
                    <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Selected file: <span className="font-medium text-foreground">{uploadedFileName}</span>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          {isIdle ? (
            <div className="border-t border-border/60 p-4">
              <Button className="w-full" disabled={!uploadedFileName} onClick={onStart}>
                {startLabel}
              </Button>
            </div>
          ) : null}

          {isProcessing ? (
            <div className="border-t border-border/60 p-3 text-center text-xs text-muted-foreground">
              <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />
              Processing in progress
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
