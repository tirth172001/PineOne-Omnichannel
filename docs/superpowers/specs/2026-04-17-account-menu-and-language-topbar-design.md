# Account Menu And Language Topbar Design

Date: 2026-04-17  
Scope: V3 branch only  
Status: Draft approved in conversation, pending user review of written spec

## 1. Goal

Replace the current profile dropdown structure with account-focused destinations and add a language control in the topbar, while preserving the existing V3 visual language and interaction style.

This change is intended to:

- remove the overloaded `Settings` entry from the profile menu
- make account and business administration discoverable through explicit destinations
- introduce a language switcher suitable for an India-focused merchant platform
- preserve the current V3 UI style rather than redesigning the topbar

## 2. Confirmed Product Decisions

The following requirements were confirmed in chat:

- `Settings` should be removed from the profile menu
- all replacement items should open full pages
- `Users management` should remain available only to admins
- the topbar should include a language-change button
- the platform should support 11 Indian languages

## 3. Information Architecture

### 3.1 Profile menu structure

The profile dropdown will contain the following items in this order:

1. `Profile`
2. `Business details`
3. `Users management`
4. `Preferences`
5. `Security`
6. `Feedback`
7. `Logout`

### 3.2 Access rules

- `Users management` is shown only when the signed-in role is `Admin`
- non-admin users who directly open the route should see a restricted-access state

### 3.3 Route model

All account-related pages will live under one route family:

- `/account/profile`
- `/account/business-details`
- `/account/users`
- `/account/preferences`
- `/account/security`
- `/account/feedback`

This keeps the branch compact and gives account surfaces a single ownership boundary.

## 4. Topbar Language Control

### 4.1 Placement

The language button will live in the right-side action cluster of the existing V3 topbar, alongside the current mode switcher, notifications, and profile menu.

It should behave like the rest of the topbar controls:

- same button rhythm
- same hover/active behavior
- same compact dropdown treatment

### 4.2 Supported languages

The menu will expose these 11 languages:

1. English
2. Hindi
3. Bengali
4. Telugu
5. Marathi
6. Tamil
7. Urdu
8. Gujarati
9. Kannada
10. Malayalam
11. Punjabi

### 4.3 Initial implementation scope

For this phase, language support means:

- a language button in the topbar
- a selection dropdown
- persisted selected language state
- visible active-language feedback in the menu and/or trigger

For this phase, it does **not** mean:

- fully translated page content
- locale-specific formatting overhaul
- route-based i18n
- multilingual copy management

This keeps implementation aligned with the request and avoids silently introducing a much larger localization system.

## 5. Page Design

Each account destination will be a full page using the current V3 page structure:

- existing topbar
- existing sidebar
- standard page header
- content aligned to the same workspace width rules

### 5.1 Header behavior

Each account page will use the shared `PageHeader` pattern with:

- a back button when appropriate
- a page title
- optional right-side actions only when needed

No new visual language should be introduced here; the pages should look native to the current V3 system.

### 5.2 Expected page purposes

#### `/account/profile`

Personal information about the current user:

- name
- role
- email
- mobile
- profile identity details

#### `/account/business-details`

Merchant/business information and operational identity:

- legal business details
- business documents
- linked bank accounts
- KYC-linked records

#### `/account/users`

Admin-only management surface:

- added users
- roles
- status
- invitations

#### `/account/preferences`

User-level working preferences:

- default views
- notification preferences
- language preference
- compactness or workflow defaults if already supported

#### `/account/security`

Security controls:

- password
- login/session information
- authentication and device/session review surfaces

#### `/account/feedback`

Dedicated feedback submission page:

- structured text input
- optional rating or category selection if needed

## 6. Component And State Strategy

### 6.1 Topbar

Primary touchpoint:

- `components/dashboard/v2-topbar.tsx`

Changes:

- remove `Settings` from the profile dropdown
- replace with account destination items
- add a language button and menu in the right-side control cluster

### 6.2 Shared state

We should use a small client-side preference storage mechanism for the selected language, similar in spirit to current local persisted workspace preferences.

Suggested approach:

- create a small `lib/language-settings.ts` or equivalent lightweight utility
- persist the current selection in local storage
- keep implementation independent from runtime version switching, since this branch is V3-only

### 6.3 Account pages

Create dedicated page routes and keep them thin:

- route file
- V3 layout wrapper
- account-specific content component

Recommended structure:

- `app/account/...`
- `components/account/...`

This keeps account concerns out of unrelated workflow modules.

## 7. Error Handling And Edge Cases

### 7.1 Non-admin access to `/account/users`

If a non-admin lands on the page directly:

- do not crash
- do not redirect silently without explanation
- show a clean restricted-access state

### 7.2 Missing session data

If user identity fields are partially unavailable:

- render known values
- use stable placeholders for missing values
- avoid blocking the entire page

### 7.3 Language selection

If local persisted language is missing or invalid:

- default to `English`
- avoid broken trigger labels

## 8. Testing Strategy

### 8.1 Behavioral coverage

We should verify:

- profile menu renders the new items
- `Settings` no longer appears
- admin sees `Users management`
- non-admin does not see `Users management`
- direct non-admin access to `/account/users` shows restricted state
- selected language persists after reload

### 8.2 Route coverage

We should verify:

- all `/account/*` pages render inside the V3 shell
- page headers align with the existing workspace layout

## 9. Recommended Implementation Order

1. Add lightweight language-settings persistence utility
2. Update `v2-topbar` profile menu and language button
3. Create `/account/*` routes and base content components
4. Add admin gating for `/account/users`
5. Verify topbar interactions and account-route rendering

## 10. Out Of Scope For This Pass

- translated platform copy
- locale-aware routing
- language-specific dashboards
- role and permission system redesign beyond simple admin gating for users management
- deeper business-details workflow redesign

## 11. Summary

This change keeps the existing V3 UI intact while improving account discoverability and setting up a future-ready language preference surface. The architecture remains compact by grouping account pages under `/account/*` and by treating language selection as a lightweight persisted preference instead of a full localization system in this phase.
