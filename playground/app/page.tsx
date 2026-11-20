import { HeroBanner } from "@/components/hero-banner/hero-banner";
import { LibraryHome } from "@/components/library/library-home";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDocSummaries } from "@/lib/docs";
import { HOME_HERO } from "@/lib/heroes";
import { PAGE_COLUMN } from "@/lib/page-width";
import { getAllPrototypes } from "@/lib/prototypes";

export default function Home() {
  return (
    <main className={`${PAGE_COLUMN} flex flex-col gap-6 pt-[max(1rem,env(safe-area-inset-top))] pb-16`}>
      <HeroBanner title="Playground" pattern={HOME_HERO} action={<ThemeToggle />} className="sm:min-h-64" />
      <LibraryHome prototypes={getAllPrototypes()} docs={getDocSummaries()} />
    </main>
  );
}
