export const DUMMY_AUTH_STORAGE_KEY = "pine-one-dummy-auth"

export type DummyAuthSession = {
  email: string
  name: string
  role: string
  loggedInAt: string
}

export function readDummyAuthSession(): DummyAuthSession | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(DUMMY_AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<DummyAuthSession>
    if (!parsed.email || !parsed.name) return null
    return {
      email: parsed.email,
      name: parsed.name,
      role: parsed.role ?? "Admin",
      loggedInAt: parsed.loggedInAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function writeDummyAuthSession(session: DummyAuthSession) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DUMMY_AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearDummyAuthSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(DUMMY_AUTH_STORAGE_KEY)
}

export function isDummyAuthenticated() {
  return Boolean(readDummyAuthSession())
}

