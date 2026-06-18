export type ThemeValue = "light" | "dark" | "system"

const THEME_SWITCHING_CLASS = "theme-switching"

export function setThemeWithTransition(setTheme: (theme: ThemeValue) => void, theme: ThemeValue) {
  if (typeof window === "undefined") {
    setTheme(theme)
    return
  }

  const root = document.documentElement
  root.classList.add(THEME_SWITCHING_CLASS)
  setTheme(theme)

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      root.classList.remove(THEME_SWITCHING_CLASS)
    })
  })
}
