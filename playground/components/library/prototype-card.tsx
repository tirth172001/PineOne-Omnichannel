import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { Prototype } from "@/lib/prototypes";
import { CARD_LINK } from "./card-styles";
import { Thumbnail } from "./thumbnail";

/**
 * Where a card goes. Separately deployed apps that would only get an "Open" page
 * (`external.embed: "none"`) open their URL in a new tab; everything else opens its playground page.
 */
export function cardTarget(prototype: Prototype) {
  const ext = prototype.meta.external;
  return ext?.embed === "none" && ext.url ? { href: ext.url, external: true } : { href: `/prototypes/${prototype.slug}`, external: false };
}

export function PrototypeCard({ prototype, variantOfTitle, delay }: { prototype: Prototype; variantOfTitle?: string; delay?: number }) {
  const { meta } = prototype;
  const target = cardTarget(prototype);
  const body: ReactNode = (
    <>
      <Thumbnail prototype={prototype} delay={delay} />
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium">{meta.title}</h4>
          {meta.public && <Badge variant="outline">Public</Badge>}
          {target.external && (
            <ArrowUpRight aria-hidden className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
          )}
        </div>
        {variantOfTitle && <p className="text-sm text-muted-foreground">Variant of {variantOfTitle}</p>}
        <p className="line-clamp-2 text-sm text-muted-foreground">{meta.description}</p>
      </div>
    </>
  );
  return target.external ? (
    <a href={target.href} target="_blank" rel="noreferrer" className={CARD_LINK} aria-label={`${meta.title} (opens in a new tab)`}>
      {body}
    </a>
  ) : (
    <Link href={target.href} className={CARD_LINK}>
      {body}
    </Link>
  );
}
