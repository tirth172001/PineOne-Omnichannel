import type { ReactNode } from "react";
import { CARD_LINK } from "@/components/library/card-styles";

/** A gallery card as it appears in a folder: the composed picture and the title (not a link here). */
export function SampleCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={CARD_LINK}>
      {children}
      <p className="px-4 py-3 text-sm font-medium">{title}</p>
    </div>
  );
}
