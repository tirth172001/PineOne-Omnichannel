"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Fragment, useSyncExternalStore } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export const SCROLL_THRESHOLD = 56;

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

/** True once the page has scrolled past the header. False on the server. */
export function useScrolledPast(threshold: number) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false
  );
}

/**
 * Header for every page below home, laid out in the page's content column (`width`).
 * At the top: back, the breadcrumb trail and the theme toggle. Once the page scrolls,
 * only a floating Back pill stays, with a background and shadow so it reads as a way out.
 */
export function PageHeader({
  crumbs,
  back,
  width = "max-w-2xl",
  floatingClassName,
}: {
  crumbs: Crumb[];
  back: { href: string; label: string };
  width?: string;
  /** Extra classes on the floating Back pill's layer, e.g. `lg:hidden` when a page shows Back in its own sticky rail. */
  floatingClassName?: string;
}) {
  const scrolled = useScrolledPast(SCROLL_THRESHOLD);
  return (
    <>
      <header className={cn("mx-auto flex w-full items-center gap-1 px-4 pt-[max(0.5rem,env(safe-area-inset-top))]", width)}>
        <Button asChild variant="ghost" size="icon" className="-ml-3 size-11 shrink-0">
          <Link href={back.href} aria-label={`Back to ${back.label}`}>
            <ArrowLeft />
          </Link>
        </Button>
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap">
            {crumbs.map((crumb, i) => {
              const last = i === crumbs.length - 1;
              return (
                <Fragment key={`${crumb.label}-${i}`}>
                  <BreadcrumbItem className={cn(last ? "min-w-0" : "shrink-0", !last && i < crumbs.length - 2 && "hidden sm:inline-flex")}>
                    {last || !crumb.href ? (
                      <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!last && <BreadcrumbSeparator className={cn(i < crumbs.length - 2 && "hidden sm:inline-flex")} />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <ThemeToggle />
      </header>

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-40 transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
          scrolled ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
          floatingClassName
        )}
      >
        <div className={cn("mx-auto w-full px-4 pt-[max(0.75rem,env(safe-area-inset-top))]", width)}>
          <Button
            asChild
            variant="outline"
            className={cn(
              "-ml-1 h-11 rounded-full border-border bg-background/90 pr-4 pl-3 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/75",
              scrolled && "pointer-events-auto"
            )}
          >
            <Link href={back.href} tabIndex={scrolled ? 0 : -1} aria-hidden={!scrolled}>
              <ArrowLeft />
              {back.label}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
