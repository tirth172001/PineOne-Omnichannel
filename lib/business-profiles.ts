"use client"

/**
 * Lets us demo how the platform looks for different merchants/roles without a real
 * backend — a small set of business "stages" (online-only startup, single in-store
 * shop, growing omnichannel business, online support agent), each carrying the
 * permission keys a real role of that shape would have (reusing the same catalog
 * the Manage users & roles screens use, so the two stay in sync).
 */

import { useEffect, useState } from "react"
import {
  computeAccessScope,
  OFFLINE_ROLE_PERMISSIONS,
  ONLINE_ROLE_PERMISSIONS,
  unionKeys,
  type AccessScope,
} from "@/lib/role-permissions"
import { STORE_RECORDS, type StoreRecord } from "@/lib/stores-data"

export type BusinessProfile = {
  id: string
  businessName: string
  stage: string
  roleLabel: string
  description: string
  permissionKeys: string[]
}

export const BUSINESS_PROFILES: BusinessProfile[] = [
  {
    id: "online-startup",
    businessName: "Zenith Sportswear",
    stage: "New business",
    roleLabel: "Online Owner",
    description: "Just started accepting payments online. No physical stores yet.",
    permissionKeys: ONLINE_ROLE_PERMISSIONS.Owner,
  },
  {
    id: "single-store",
    businessName: "Vijay Sales — Sector 21 store",
    stage: "Single store",
    roleLabel: "Store Manager",
    description: "One physical store, run day-to-day by a Store Manager. No online storefront.",
    permissionKeys: OFFLINE_ROLE_PERMISSIONS["Store Manager"],
  },
  {
    id: "multi-store-manager",
    businessName: "Vijay Sales — Noida cluster",
    stage: "Multiple stores",
    roleLabel: "Store Manager",
    description: "A handful of physical stores in one cluster, run by a Store Manager. No online storefront.",
    permissionKeys: OFFLINE_ROLE_PERMISSIONS["Store Manager"],
  },
  {
    id: "omnichannel-admin",
    businessName: "Vijay Sales Private Limited",
    stage: "Growing omnichannel business",
    roleLabel: "Admin",
    description: "Multiple stores plus an online storefront, run by an Admin with visibility across both channels.",
    permissionKeys: unionKeys(OFFLINE_ROLE_PERMISSIONS.Admin, ONLINE_ROLE_PERMISSIONS.Operations),
  },
  {
    id: "online-support",
    businessName: "Zenith Sportswear",
    stage: "Support agent",
    roleLabel: "Support",
    description: "Handles refunds and gateway configuration for the online storefront. Can't view transactions or settlements.",
    permissionKeys: ONLINE_ROLE_PERMISSIONS.Support,
  },
]

/** Keeps today's full-access experience as the default so existing pages don't
 *  suddenly look empty for anyone who hasn't opened the switcher. */
export const DEFAULT_BUSINESS_PROFILE_ID = "omnichannel-admin"

export const BUSINESS_PROFILE_STORAGE_KEY = "pine-one-business-profile"
export const BUSINESS_PROFILE_CHANGED_EVENT = "business-profile-changed"

export function getBusinessProfile(id: string | null | undefined): BusinessProfile {
  return (
    BUSINESS_PROFILES.find((profile) => profile.id === id) ??
    BUSINESS_PROFILES.find((profile) => profile.id === DEFAULT_BUSINESS_PROFILE_ID)!
  )
}

export function readActiveBusinessProfile(): BusinessProfile {
  if (typeof window === "undefined") return getBusinessProfile(DEFAULT_BUSINESS_PROFILE_ID)
  return getBusinessProfile(window.localStorage.getItem(BUSINESS_PROFILE_STORAGE_KEY))
}

export function writeActiveBusinessProfile(id: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(BUSINESS_PROFILE_STORAGE_KEY, id)
  window.dispatchEvent(new Event(BUSINESS_PROFILE_CHANGED_EVENT))
}

/** Subscribes to profile switches made anywhere (this tab or another) so any
 *  component can stay in sync without prop drilling. */
export function useActiveBusinessProfile(): BusinessProfile {
  const [profile, setProfile] = useState<BusinessProfile>(readActiveBusinessProfile)

  useEffect(() => {
    setProfile(readActiveBusinessProfile())
    const sync = () => setProfile(readActiveBusinessProfile())
    window.addEventListener(BUSINESS_PROFILE_CHANGED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(BUSINESS_PROFILE_CHANGED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return profile
}

export function businessProfileHasAnyPermission(profile: BusinessProfile, permissionKeys: string[]) {
  return permissionKeys.some((key) => profile.permissionKeys.includes(key))
}

export function businessProfileAccessScope(profile: BusinessProfile): AccessScope {
  return computeAccessScope(profile.permissionKeys)
}

/** No per-profile store list exists in the demo data yet, so this infers one from
 *  the profile shape: online-only profiles run no physical stores, the single-store
 *  profile is pinned to exactly one store record, the multi-store manager sees a
 *  small cluster, and the omnichannel admin sees the full store list — matching
 *  the "single store" vs "multiple stores" distinction the store/channel filters
 *  key off of. */
export function businessProfileStores(profile: BusinessProfile): StoreRecord[] {
  if (businessProfileAccessScope(profile) === "Online") return []
  if (profile.id === "single-store") return STORE_RECORDS.slice(0, 1)
  if (profile.id === "multi-store-manager") return STORE_RECORDS.slice(0, 4)
  return STORE_RECORDS
}

export function businessProfileIsMultiStore(profile: BusinessProfile): boolean {
  return businessProfileStores(profile).length > 1
}
