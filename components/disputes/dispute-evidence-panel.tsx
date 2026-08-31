"use client"

import { useRef } from "react"
import { InfoIcon, UploadSimpleIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export type EvidenceFieldKey = "invoice" | "delivery" | "rebuttal" | "refund" | "additional"

export type EvidenceDocument = { fileName: string }

export type EvidenceDocuments = Partial<Record<EvidenceFieldKey, EvidenceDocument>>

export type EvidencePanelMode = "defend" | "view" | "reupload"

export const EVIDENCE_FIELDS: { key: EvidenceFieldKey; label: string; placeholder: string }[] = [
  { key: "invoice", label: "Invoice / Bill copy", placeholder: "Upload invoice / Bill copy" },
  { key: "delivery", label: "Delivery / Service proof", placeholder: "Upload delivery / service proof" },
  { key: "rebuttal", label: "Rebuttal letter / ID proof", placeholder: "Upload rebuttal letter / ID proof" },
  { key: "refund", label: "Refund details", placeholder: "Upload refund details" },
  { key: "additional", label: "Additional documents", placeholder: "Upload additional documents" },
]

const PANEL_COPY: Record<EvidencePanelMode, { title: string; sectionTitle: string }> = {
  defend: { title: "Defend dispute", sectionTitle: "Upload supporting proofs" },
  view: { title: "Response details", sectionTitle: "Supporting proofs" },
  reupload: { title: "Re-upload documents", sectionTitle: "Upload supporting proofs" },
}

export function DisputeEvidencePanel({
  open,
  onOpenChange,
  mode,
  amount,
  documents,
  onDocumentsChange,
  flaggedField,
  issueMessage,
  comment,
  onCommentChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: EvidencePanelMode
  amount: string
  documents: EvidenceDocuments
  onDocumentsChange: (documents: EvidenceDocuments) => void
  flaggedField?: EvidenceFieldKey | null
  issueMessage?: string
  comment: string
  onCommentChange: (value: string) => void
  onSubmit: () => void
}) {
  const fileInputs = useRef<Partial<Record<EvidenceFieldKey, HTMLInputElement | null>>>({})
  const isView = mode === "view"
  const copy = PANEL_COPY[mode]
  const hasAnyDocument = Object.keys(documents).length > 0

  function handleFileSelected(key: EvidenceFieldKey, file: File | undefined) {
    if (!file) return
    onDocumentsChange({ ...documents, [key]: { fileName: file.name } })
  }

  function handleRemove(key: EvidenceFieldKey) {
    const next = { ...documents }
    delete next[key]
    onDocumentsChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-foreground">{copy.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Review and manage the evidence submitted for this dispute.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label>Defend amount</Label>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground">
              <span className="text-muted-foreground">₹</span>
              <input
                type="text"
                readOnly={isView}
                defaultValue={amount}
                className="w-full bg-transparent outline-none"
              />
            </div>
            {!isView ? <p className="text-xs text-muted-foreground">Change amount to partially defend</p> : null}
          </div>

          <div className="h-px w-full bg-border/70" />

          {mode === "reupload" && issueMessage ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-200">
              <InfoIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>{issueMessage}</p>
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{copy.sectionTitle}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Supported file format is .JPG, .JPEG, .PDF Upload the certificates in the uploaders below.
              </p>
            </div>

            <div className="space-y-4">
              {EVIDENCE_FIELDS.map((field) => {
                const document = documents[field.key]
                const isFlagged = mode === "reupload" && flaggedField === field.key

                return (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">{field.label}</Label>
                    {!isView ? (
                      <input
                        ref={(el) => {
                          fileInputs.current[field.key] = el
                        }}
                        type="file"
                        accept=".jpg,.jpeg,.pdf"
                        className="hidden"
                        onChange={(event) => handleFileSelected(field.key, event.target.files?.[0])}
                      />
                    ) : null}
                    <div
                      className={cn(
                        "flex h-10 items-center justify-between gap-2 rounded-lg border px-3 text-sm",
                        isFlagged ? "border-destructive/60 bg-destructive/5" : "border-input bg-transparent"
                      )}
                    >
                      <span
                        className={cn(
                          "flex min-w-0 items-center gap-2",
                          document ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <UploadSimpleIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{document?.fileName ?? field.placeholder}</span>
                      </span>
                      {isView ? (
                        document ? (
                          <button
                            type="button"
                            onClick={() => toast.success(`Downloading ${document.fileName}...`)}
                            className="shrink-0 text-sm font-medium text-primary hover:underline"
                          >
                            Download
                          </button>
                        ) : null
                      ) : document ? (
                        <button
                          type="button"
                          onClick={() => handleRemove(field.key)}
                          className="shrink-0 text-sm font-medium text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputs.current[field.key]?.click()}
                          className="shrink-0 text-sm font-medium text-primary hover:underline"
                        >
                          Upload
                        </button>
                      )}
                    </div>
                    {isFlagged ? (
                      <p className="text-xs text-destructive">Please re-upload previous document was blurry</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          {!isView ? (
            <div className="space-y-2">
              <Label>Additional comments</Label>
              <Textarea
                value={comment}
                onChange={(event) => onCommentChange(event.target.value)}
                placeholder="Add your comment"
                className="min-h-24"
              />
            </div>
          ) : null}
        </div>

        {!isView ? (
          <SheetFooter className="border-t border-border/70">
            <Button onClick={onSubmit} disabled={!hasAnyDocument} className="w-full sm:w-auto">
              Submit response
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
