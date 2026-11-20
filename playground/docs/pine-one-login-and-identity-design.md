---
title: Login and Identity design document
description: Unified authentication, identity resolution and business selection.
kind: Module design
date: 2026-10-05
topics: [in-store, online, login, identity, business selection]
source: docs/exports/omni-design-suite/Pine One Login and Identity Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Unified authentication, identity resolution and business selection

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Pine One needs one entry point for users who currently reach Online and In-store services through different credentials and identity models.
- The target experience resolves the person once, applies their account memberships and channel access, and asks them to select a linked business before showing merchant data.

- This module supports business clarity (G1), reliable self-service (G2) and platform consistency (G5).
- Success means that legitimate users enter the intended business without duplicate identities, accidental access or avoidable recovery work.
- It does not mean removing security steps that protect Online access.

- The latest platform direction requires business selection after every login and does not preserve the last selected business across sessions.
- This replaces an earlier PRD acceptance criterion that allowed a single-account user to skip the selector.

# User and behaviour references

- This module applies to every primary persona because login establishes the identity and business boundary before work begins.
- P1 Business owner or merchant administrator and P5 Access administrator are particularly relevant for multi-business membership and invitations.

- The design refers to B01 Establish context before interpreting data, B13 Re-establish business context each session and B14 Expect access to shape the workspace.
- Existing Online and In-store login histories are migration cohorts, not separate personas.
- Their different identifier and authentication expectations are module-specific conditions described below.

## Research implications

- Use B14/B18 and R03 Issues Raised in the canonical persona reference: staff selecting New user instead of Existing user reportedly create an unlinked account and require support tracing.
- This supports clearer existing-user recovery; it does not validate the proposed central identity mechanism or every-session selector.
- R02 Store Cashier supports location-scoped access after login.
- R05 User Management supports invitations and staff changes as important entry contexts.

- R01–R05 do not test unified login, conditional OTP, legal-entity linking or business selection each session.
- Those remain product/security directions or hypotheses as labelled here.
- Do not cite the merchant visits as proof of authentication success or reduced wrong-business entry.

# Problem and motivation

- Online and In-store systems currently use different identifiers, two-factor rules and user-to-merchant relationships.
- A person working across both may maintain separate credentials and cannot rely on one list of permitted businesses.
- Incorrect linking can also create a serious data-exposure risk.

- The design problem is therefore wider than combining login screens.
- Pine One must distinguish identity, business membership, channel entitlement and functional permission.
- A successful password check does not by itself establish which merchant data the person may see.

# Goals and success measures

| **Local goal** | **Proposed measurement** | **Parent goal** |
| --- | --- | --- |
| Enter the correct linked business | Successful login and intended-business selection without support | G1, G2 |
| Prevent duplicate identity journeys | Duplicate-account and repeated set-password cases among migrated or invited users | G2, G5 |
| Preserve required security | Authentication failures, access-control incidents and step-up completion | G5 |
| Make multi-business access understandable | Correct interpretation of business name, merchant ID context and channel badges | G1 |

- Set baselines separately for migrated Online, migrated In-store and linked omnichannel users.
- Authentication completion alone is not sufficient; confirm that the person enters the intended business and channel scope.

# Requirements

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| L1 I need one recognised login identity | Accept email or retained In-store username and resolve one central identity | P0 |
| L2 I need security appropriate to my access | Require email OTP when the identity has Online access | P0 |
| L3 I need to choose the business I am entering | Show the current linked business list after each login | P0 |
| L4 I need to distinguish similar businesses | Show business name, merchant ID context and Online, In-store or Both badge | P0 |
| L5 I need access only to my memberships | Evaluate account, channel and role scope before entry | P0 |
| L6 I need a path when Online access requires email | Collect and verify email before Online access can continue | P0 |
| L7 I need a safe result when accounts are not linked | Show separate business entries until authorised mapping is complete | P0 |
| L8 I need sensitive changes protected | Re-authenticate for approved financial and access actions | P1 |
| L9 I need recovery without creating another identity | Route forgotten credentials and locked access through the central identity | P1 |
| L10 I need to recover existing staff access without accidental registration | Make existing-user sign-in, invitation and credential help explicit; B18, R03 | P0 proposed |

## Out of scope

1. Business onboarding and KYC.
2. Heuristic or brand-name-based account linking.
3. Partner, acquirer, parent-child and Brand EMI persona experiences.
4. The complete invitation, access-request and password-recovery specifications.

# Mental models and design principles

- **My login represents me.**
  - Credentials resolve a person, not a merchant ID.
  - Business and channel access come from memberships attached to that identity.

- **I choose where I am working.**
  - The business list is a deliberate boundary before financial data appears.
  - Selection occurs every session, and the product does not silently reopen the previous business.

- **A business and a channel are different scopes.**
  - The selector chooses the business.
  - The page-level channel switcher then chooses Online or In-store within the permitted business.
  - Users do not switch merchant IDs to move between channels.

- **Security follows access.**
  - Email OTP is triggered by Online entitlement, not by whether the business itself owns an Online product.
  - An In-store-only user inside an omnichannel business should not receive an Online security step solely because of the business configuration.

# Proposed solution and design

## Identity and membership model

- One central identity contains verified attributes such as email, username and phone.
- Each account membership records the business, permitted channel and role.
- Functional authorisation is evaluated from membership, channel entitlement, role permissions and any store scope.

- The model supports one person in several unrelated businesses without merging those businesses.
- It also allows the same business to grant different people different channel access.

## Login and business selection journey

**Journey**

1. Enter email or username and password
2. Resolve central identity
3. If any current membership includes Online access, complete email OTP
4. If Online access exists without a verified email, collect and verify email
5. Show linked businesses
6. Select a business
7. Apply permitted channel and role scope
8. Open Overview

- The business list shows business name, merchant ID context and channel badge.
- A business with linked Online and In-store entities appears once with a Both badge.
- Unlinked entities remain separate.
- Business selection does not persist across sessions.

- Keep Existing user sign-in and access recovery recognisable before any registration path.
- If a staff member has an invitation, guide them to the intended identity/membership confirmation instead of suggesting another account.
- When no membership is available, explain how to contact the merchant administrator or support.
- Do not resolve identity or membership solely from a POS/terminal ID.
- The business onboarding journey remains out of scope (L9, L10; B18; R03).

- After entry, retain easy navigation to Reports, Transactions and Settlements for recurring work (B03, B16).
- Opening Overview remains the current default; this research does not authorise bypassing the business-selection rule or implementing a remembered business.

## Linking existing accounts

- The supplied PRD identifies roughly one hundred existing omnichannel brands and proposes curated mapping rather than heuristic matching.
- Linkage uses legal-entity evidence such as GST or PAN; brand name is only a review aid.
- The final operational verification and rollback process needs security and operations approval.
- Until a link is active, the user must see separate entries rather than a guessed combined business.

## Authentication and sensitive actions

- Online access currently requires email OTP.
- The design preserves that rule and adds a verified-email gate for users who previously had only a phone or username.
- Step-up authentication is proposed for bank or settlement configuration and user management.
- Each child module must state which action triggers it and what happens when the challenge fails or expires.

## App behaviour

- Use the same identity, conditional OTP rule and every-session business selection.
- The linked-business list should support touch scanning and make the selected entry unmistakable.
- Mobile recovery from app switching during OTP must preserve the entered identifier without exposing merchant data.

## Web behaviour

- Use the same sequence and decisions.
- The selector can add search when the number of linked businesses makes scanning inefficient.
- Keyboard navigation, visible focus, paste support for OTP and clear expiry or resend behaviour are required for the final interaction specification.

## States and recovery

| **State** | **User-facing treatment** |
| --- | --- |
| Incorrect credentials | Explain that entry failed without revealing whether an identity exists |
| OTP required | Name the protected destination, mask the email and show expiry and resend rules |
| Online access without verified email | Explain why email verification is required before continuing |
| No active memberships | Explain that the identity has no available business and provide an access-support path |
| Mapping pending | Keep Online and In-store entries separate; do not imply the business is already unified |
| Service unavailable | Preserve no financial context, explain the temporary problem and allow retry |
| Access changed during session | Re-evaluate scope before opening data and explain that access was updated |
| Existing staff member chose registration | Explain existing-user recovery and the administrator/support path; do not silently create or merge memberships |

# Dependencies and tradeoffs

- The central identity provider, legacy federation, membership data and account mapping must be reliable before the unified screen can be trusted.
- Conditional OTP reduces added friction for In-store-only users but creates different login lengths for people in the same business.
- Requiring business selection every session makes scope explicit but adds a step for single-business users; measure selection errors and completion time rather than assuming the tradeoff is acceptable.

# Hypotheses and validation

- **H1:** an explicit business selector with business name, merchant ID context and channel badge will reduce wrong-business entry in multi-business scenarios.

- **H2:** conditional OTP based on the person's Online entitlement will preserve Online security without adding an unnecessary step for In-store-only users.

- **H3:** adding membership to an existing identity will reduce duplicate accounts and recovery work during invitations.

- **H4:** clearer Existing user and invitation/recovery entry points will reduce accidental registration and unlinked-account support work.
  - Test staff who already belong to a business and newly invited replacements using the R03 scenario.
  - Track accidental-registration attempts and correct entry, not just login completion.
  - The reported problem supports this test; no outcome has yet been measured.

- Test migrated Online, In-store and both-channel users.
- Include people with one business, several businesses, separate unlinked entities and a newly added Online entitlement.
- Validate app interruption and web keyboard flows independently.

# Open questions

1. What identifiers should appear when one business has several merchant IDs, and which identifier is meaningful to merchants?
2. Does the OTP rule evaluate every membership on the identity or only memberships relevant to the selected business? The supplied PRD says any Online membership; confirm the security decision.
3. Which sensitive actions require step-up authentication, and how long does a successful challenge remain valid?
4. What evidence, approver and rollback path are required for an Online and In-store entity link?
5. What happens when the same email exists on both legacy systems but represents different people or shared role accounts?
6. How should accidentally created unlinked staff identities be recovered by an authorised administrator or support team without guessing membership from a terminal ID?

# Alternatives considered

- **Separate legacy login choices:** preserves the current models but keeps portal knowledge and duplicate credentials in the user journey.

- **Remember the last business across sessions:** shortens repeat entry but conflicts with the current platform decision and increases the chance of beginning in the wrong business.

- **Automatic account matching:** reduces operations effort but creates unacceptable ambiguity when legal entities differ or identity data is reused.

# Appendix and references

- Parent strategy: docs/design/pine-one-platform-design-strategy.md.
- Personas, behaviours and research: docs/design/pine-one-user-personas-and-behaviours.md, especially P1, P3, P5, B01, B13, B14 and B18; R02 Store Cashier, R03 Issues Raised and R05 User Management and Store Operations. Its research register records the limits of authentication evidence.
- Unified Login and Identity for Omni Merchant Dashboard PRD, supplied 5 October 2026.
- Roles and Permissions on Omni, supplied 5 October 2026.
- Omni Channel Experience Product Strategy and Execution Plan, supplied 5 October 2026.
