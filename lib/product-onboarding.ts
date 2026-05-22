export type ProductOnboardingFeature = "payout"

export type ProductOnboardingProgress = {
  feature: ProductOnboardingFeature
  status: "not_started" | "in_progress" | "configured"
  stepsCompleted: number
  totalSteps: number
  updatedAt: string
}

const STORAGE_KEY = "pine.productOnboardingProgress.v1"
const FEATURE_SET: ProductOnboardingFeature[] = ["payout"]

function clampSteps(stepsCompleted: number, totalSteps: number) {
  if (!Number.isFinite(stepsCompleted)) return 0
  return Math.max(0, Math.min(Math.floor(stepsCompleted), totalSteps))
}

export function resolveOnboardingFeature(rawValue?: string | null): ProductOnboardingFeature | null {
  if (!rawValue) return null
  const normalized = rawValue.toLowerCase().trim()
  if (FEATURE_SET.includes(normalized as ProductOnboardingFeature)) {
    return normalized as ProductOnboardingFeature
  }
  return null
}

function readStore(): Record<ProductOnboardingFeature, ProductOnboardingProgress> {
  const fallback = {} as Record<ProductOnboardingFeature, ProductOnboardingProgress>
  if (typeof window === "undefined") return fallback

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<Record<ProductOnboardingFeature, ProductOnboardingProgress>>
    const next = {} as Record<ProductOnboardingFeature, ProductOnboardingProgress>

    for (const feature of FEATURE_SET) {
      const candidate = parsed[feature]
      if (!candidate) continue
      const totalSteps = Math.max(1, Number(candidate.totalSteps) || 4)
      const stepsCompleted = clampSteps(Number(candidate.stepsCompleted), totalSteps)
      next[feature] = {
        feature,
        totalSteps,
        stepsCompleted,
        status:
          candidate.status === "configured"
            ? "configured"
            : stepsCompleted > 0
              ? "in_progress"
              : "not_started",
        updatedAt: candidate.updatedAt || new Date().toISOString(),
      }
    }

    return next
  } catch {
    return fallback
  }
}

function writeStore(data: Record<ProductOnboardingFeature, ProductOnboardingProgress>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getOnboardingProgress(
  feature: ProductOnboardingFeature
): ProductOnboardingProgress | null {
  return readStore()[feature] ?? null
}

export function markOnboardingStarted(
  feature: ProductOnboardingFeature,
  totalSteps = 4
): ProductOnboardingProgress {
  const store = readStore()
  const previous = store[feature]
  const nextTotal = Math.max(1, totalSteps)
  const nextSteps = clampSteps(Math.max(previous?.stepsCompleted ?? 0, 1), nextTotal)
  const nextStatus = nextSteps >= nextTotal ? "configured" : "in_progress"
  const next: ProductOnboardingProgress = {
    feature,
    totalSteps: nextTotal,
    stepsCompleted: nextSteps,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  }
  store[feature] = next
  writeStore(store)
  return next
}

export function advanceOnboardingProgress(
  feature: ProductOnboardingFeature,
  delta = 1
): ProductOnboardingProgress {
  const store = readStore()
  const previous = store[feature] ?? {
    feature,
    status: "not_started" as const,
    stepsCompleted: 0,
    totalSteps: 4,
    updatedAt: new Date().toISOString(),
  }

  const totalSteps = Math.max(1, previous.totalSteps)
  const stepsCompleted = clampSteps(previous.stepsCompleted + Math.max(1, delta), totalSteps)
  const status = stepsCompleted >= totalSteps ? "configured" : "in_progress"
  const next: ProductOnboardingProgress = {
    feature,
    totalSteps,
    stepsCompleted,
    status,
    updatedAt: new Date().toISOString(),
  }
  store[feature] = next
  writeStore(store)
  return next
}
