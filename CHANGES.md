# Pine One — Navigation Comparison Build

This document covers all changes made to create a two-version navigation prototype for comparison, along with a shared demo settings system.

---

## Overview

Two parallel versions of the Pine Labs ONE dashboard exist for A/B comparison:

| Version | Nav pattern | Local URL |
|---------|-------------|-----------|
| V1 | Always-expanded icon rail (left) | `http://localhost:3000` |
| V2 | Persistent sidebar with sub-navigation | `http://localhost:3001` |

V2 lives in a separate project directory: `Pine One User Journey V2/`

---

## What Changed in V1

### Sidebar (`components/dashboard/app-topbar.tsx`)
- **Was**: Collapsed to a 64px icon rail by default, expanding to 224px on hover
- **Now**: Always expanded at 224px — labels and icons are always visible, no hover animation
- Converted from absolute-positioned icon+label pairs to a clean flex row layout per item
- Removed `group/nav` hover group and all `group-hover/nav` transition classes
- Plain `<Link>` and `<button>` elements replace shadcn `Button` wrapper for nav items

### Demo Settings entry point
- Profile dropdown now includes a **Demo settings** menu item (Monitor icon)
- Opens a modal dialog — see [Demo Settings Dialog](#demo-settings-dialog) below

---

## What's New in V2

V2 is a full copy of V1 with the following architectural differences.

### Persistent Left Sidebar (`components/dashboard/v2-sidebar.tsx`)
- Fixed width: 240px, never collapses
- Divided into sections: Products, Explore, Account
- Each product section has an **accordion** of sub-links:
  - **Online Payments** → Overview, Transactions, Settlements, Disputes, Refunds, Reports
  - **Offline Payments** → Overview, Transactions, Settlements, Disputes, Refunds, Reports
  - **Payment Links** → Overview, All Links, Transactions, Reports
  - **Card Payments** → Overview, Transactions, Settlements, Disputes, Reports
  - **International** → Overview, Transactions, Settlements, Reports
- **Explore section** contains: Products, Use Cases, Help & Support
- **Account section** removed from nav — Settings is in the profile dropdown only
- Business/store selector removed from the top (logo only)

### Sidebar selection states
- **Parent item** (active section): plain `text-foreground`, no background — visually muted
- **Active sub-link**: `bg-primary/15 text-primary font-semibold` — clearly highlighted
- Parent items are **toggle-only buttons** (no navigation) — clicking navigates via sub-links
- Sub-link active detection uses exact `pathname === href` matching to avoid prefix collisions

### New sub-page routes in V2
Each sub-link maps to a real Next.js route that renders the parent content component pre-set to that section:

```
/online-payments/transactions     → OnlinePaymentsContent({ initialSection: "transactions" })
/online-payments/settlements      → OnlinePaymentsContent({ initialSection: "settlements" })
/online-payments/disputes         → OnlinePaymentsContent({ initialSection: "disputes" })
/online-payments/refunds          → OnlinePaymentsContent({ initialSection: "refunds" })
/online-payments/reports          → OnlinePaymentsContent({ initialSection: "reports" })
```
Same pattern applies for Offline Payments and Payment Links.

Card Payments and International Payments sub-pages render their parent component directly (they use internal section tabs rather than nav-controlled sections).

### Content components updated
`OnlinePaymentsContent`, `OfflinePaymentsContent`, and `PaymentLinksContent` now accept an optional `initialSection` prop so sub-pages can pre-select a section without duplicating component logic.

### Left panel removed in V2
All `WorkspaceShell` usages in V2 pass `showLeftContext={false}` — the left panel nav that previously appeared inside the content area is no longer shown, since sub-navigation has moved to the persistent sidebar.

### V2 layout (`components/dashboard/v2-dashboard-layout.tsx`)
A dedicated layout wrapper for V2 pages — mirrors `DashboardLayout` but mounts `V2Sidebar` instead of `AppTopbar`. Wraps with `NavVisibilityProvider` (required by `WorkspaceShell`).

---

## Demo Settings Dialog

**File**: `components/dashboard/demo-settings-dialog.tsx`  
**Accessed via**: Profile dropdown → "Demo settings" (in both V1 and V2)

A modal dialog that acts as a single control panel for the prototype demo.

### Version Switcher
- Shows V1 and V2 as selectable cards
- Current version is highlighted
- Switching navigates to the same path on the target version
- **Path resolution when switching V2 → V1**: if the current path is a V2-only sub-route (e.g. `/online-payments/transactions`), it falls back to the parent route (`/online-payments`). If no match, falls back to `/`

### Center Panel Max Width
Three options for `WorkspaceShell`'s content max-width:

| Option | Value | Description |
|--------|-------|-------------|
| 1100 | 1100px | Focused / narrower reading width |
| 1440 | 1440px | Wide (default) |
| Custom | User input | Any value between 800–2560px |

- Changes apply **instantly** without a page reload
- Uses a `demo-settings-changed` custom DOM event to notify `WorkspaceShell`
- Settings persist in `localStorage` under key `pine-one-demo-settings`

---

## Version Switcher (standalone)

**File**: `components/dashboard/version-switcher.tsx`

A compact `V1 | V2` pill used by the Demo Settings dialog. Reads env vars to determine URLs — not port-based, so it works on any deployment.

---

## Environment Variables

Each deployed instance must set these three variables:

```env
# Which version this instance is
NEXT_PUBLIC_APP_VERSION=v1   # or v2

# Full base URLs for each version (no trailing slash)
NEXT_PUBLIC_V1_URL=https://your-v1-deployment.com
NEXT_PUBLIC_V2_URL=https://your-v2-deployment.com
```

For local development the defaults are:
```env
# V1 project (.env.local)
NEXT_PUBLIC_APP_VERSION=v1
NEXT_PUBLIC_V1_URL=http://localhost:3000
NEXT_PUBLIC_V2_URL=http://localhost:3001

# V2 project (.env.local)
NEXT_PUBLIC_APP_VERSION=v2
NEXT_PUBLIC_V1_URL=http://localhost:3000
NEXT_PUBLIC_V2_URL=http://localhost:3001
```

> When deploying to Vercel or another host, set these as environment variables in the project settings. The switcher will automatically use them — no code changes needed.

---

## New Files Added

### Shared (both V1 and V2)
| File | Purpose |
|------|---------|
| `lib/demo-settings.ts` | localStorage read/write helpers for demo config |
| `lib/dummy-auth.ts` | Fake auth session (localStorage-based) for prototype |
| `components/dashboard/demo-settings-dialog.tsx` | Demo settings modal |
| `components/dashboard/version-switcher.tsx` | V1/V2 pill toggle |
| `components/dashboard/product-workspace-nav.tsx` | Left-panel section nav (used in V1 WorkspaceShell) |
| `components/ui/data-table.tsx` | Reusable data table with sort, filter, pin, search |
| `components/auth/auth-shell.tsx` | Login/signup page wrapper |
| `app/login/page.tsx` | Login page |
| `app/signup/page.tsx` | Signup page |

### V2-only
| File | Purpose |
|------|---------|
| `components/dashboard/v2-sidebar.tsx` | Persistent sidebar with accordion sub-nav |
| `components/dashboard/v2-dashboard-layout.tsx` | Layout wrapper using V2 sidebar |
| `app/online-payments/[section]/page.tsx` | Sub-pages: transactions, settlements, disputes, refunds, reports |
| `app/offline-payments/[section]/page.tsx` | Same pattern |
| `app/payment-links/[section]/page.tsx` | all, transactions, reports |
| `app/card-payments/[section]/page.tsx` | transactions, settlements, disputes, reports |
| `app/international-payments/[section]/page.tsx` | transactions, settlements, reports |

---

## Running Locally

```bash
# Terminal 1 — V1
cd "Pine One User Journey"
npm run dev          # → http://localhost:3000

# Terminal 2 — V2
cd "Pine One User Journey V2"
npm run dev -- --port 3001   # → http://localhost:3001
```

Switch between versions using **Profile → Demo settings** in either app.

---

## Deployment Checklist

1. Deploy V1 project → get URL (e.g. `https://pine-one-v1.vercel.app`)
2. Deploy V2 project → get URL (e.g. `https://pine-one-v2.vercel.app`)
3. Set env vars in V1:
   ```
   NEXT_PUBLIC_APP_VERSION=v1
   NEXT_PUBLIC_V1_URL=https://pine-one-v1.vercel.app
   NEXT_PUBLIC_V2_URL=https://pine-one-v2.vercel.app
   ```
4. Set env vars in V2:
   ```
   NEXT_PUBLIC_APP_VERSION=v2
   NEXT_PUBLIC_V1_URL=https://pine-one-v1.vercel.app
   NEXT_PUBLIC_V2_URL=https://pine-one-v2.vercel.app
   ```
5. Redeploy both (env vars require a rebuild in Next.js)
