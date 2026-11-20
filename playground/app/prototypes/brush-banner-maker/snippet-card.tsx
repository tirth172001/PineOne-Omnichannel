"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import type { BrushPattern } from "@/components/hero-banner/brush";
import { Button } from "@/components/ui/button";
import { toSnippet } from "./data";

/** The pattern as code, with Copy. Paste it over the page's entry in lib/heroes.ts. */
export function SnippetCard({ pattern, target }: { pattern: BrushPattern; target: string }) {
  const [copied, setCopied] = useState(false);
  const code = toSnippet(pattern);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context or denied); the code stays selectable.
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0 text-sm text-muted-foreground">
          Paste into <code className="font-mono text-foreground">lib/heroes.ts</code> → <code className="font-mono break-all text-foreground">{target}</code>
        </p>
        <Button variant="secondary" className="h-11 shrink-0" onClick={copy} aria-label="Copy pattern">
          {copied ? <Check /> : <Copy />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="rounded-xl bg-muted/60 p-4 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap select-all">{code}</pre>
    </section>
  );
}
