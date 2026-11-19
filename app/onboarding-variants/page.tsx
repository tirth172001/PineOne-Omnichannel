import Link from "next/link"
import { STEP_VARIANTS } from "./_variants"

// Index of the archived onboarding variants.
export default function OnboardingVariantsIndex() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Onboarding variants</h1>
        <p className="text-sm text-muted-foreground">
          The design alternatives tried for each onboarding step. The live flow uses the winner; these are the others, kept for comparison.
        </p>
      </div>
      <ul className="divide-y divide-border rounded-xl border border-border">
        {Object.entries(STEP_VARIANTS).map(([step, entry]) => (
          <li key={step}>
            <Link href={`/onboarding-variants/${step}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted">
              <span className="font-medium">{entry.title}</span>
              <span className="text-sm text-muted-foreground">{entry.variants.map((v) => v.key.toUpperCase()).join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
