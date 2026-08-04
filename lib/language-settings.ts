"use client"

export const LANGUAGE_STORAGE_KEY = "pine-one-language"

export type SupportedLanguage = {
  code: string
  label: string
  nativeLabel: string
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
]

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0]

export function getLanguageByCode(code?: string | null) {
  return SUPPORTED_LANGUAGES.find((language) => language.code === code) ?? DEFAULT_LANGUAGE
}

export function readLanguagePreference() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE
  return getLanguageByCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
}

export function writeLanguagePreference(code: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, getLanguageByCode(code).code)
}
