---
title: Roles and Permissions design document
description: Merchant user access across Online and In-store products.
kind: Module design
date: 2026-10-05
topics: [in-store, online, roles, permissions, users]
source: docs/exports/omni-design-suite/Pine One Roles and Permissions Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Merchant user access across Online and In-store products

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Pine One needs one access model that can preserve legacy permissions while supporting future custom roles across Online and In-store products.
- The proposed model separates the person, their business membership, channel entitlement, role permissions and store scope.
- This prevents a configured product from being mistaken for a permission and allows one person to hold different access in different businesses.

- This module supports business clarity (G1), reliable self-service (G2) and platform consistency (G5).
- Its local goal is to help an owner grant appropriate access without unintentionally exposing financial or administrative capabilities.

# User and behaviour references

- P5 Access administrator is the primary responsibility and may be held by P1 or P4; its operator model is not yet directly validated.
- P2, P3 and P4 experience assigned access as T5 Delegate, while an internal migration reviewer remains an operational stakeholder rather than a merchant persona.

- The design refers to B08 Delegate work through recognisable roles, B09 Seek consequences before a high-impact action and B14 Expect access to shape the workspace.
- This module adds migration traceability because the shared behaviour catalogue does not describe internal review work.

## Research implications

- Use P5/B08/B14 with R04 Issues Reported and R05 User Management and Store Operations in the canonical persona reference.
- These support distinct refund capabilities and efficient staff replacement.
- R02 Store Cashier supports centre-limited access; R01 Prototype Task 7 and B18 support testing the discovery of user management.
- The reports establish reported needs rather than validating the role editor or proving that the owner performs every access change.

- Bulk administration is a research-backed need at Lifestyle, not an approved release commitment.
- T4 applies here to user changes without establishing bulk refund practice.
- Staff removal must distinguish ending a business membership from deleting an identity used in other businesses.

# Problem and motivation

- The legacy systems use different models.
- In-store provides fixed default roles and coarse permissions.
- Online has default and custom roles with more granular permissions.
- Some legacy code depends on role names.
- A direct merge can either remove access people need or grant a union that is broader than intended.

- The design must preserve migrated access while giving new administrators a comprehensible model.
- Flexibility is useful only if the user can predict what a role allows and which business, channel and store it affects.

# Goals and success measures

| **Local goal** | **Proposed measurement** | **Parent goal** |
| --- | --- | --- |
| Grant intended access | Correct role and scope assignment in scenario testing | G1, G2 |
| Avoid excessive access | Permission review errors and access-control incidents | G5 |
| Preserve migrated work | Users retaining required task access after migration | G2, G5 |
| Make access changes understandable | Administrator comprehension and successful staff verification | G1 |
| Replace staff without a central support dependency | Unassisted membership-change completion and contacts per completed change | G2 |

- Measure migration outcomes separately from newly created roles.
- A lower support volume is useful only if users retain necessary access and inappropriate access does not increase.

# Requirements

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| A1 I need to see who has access to this business | List identities, roles, channels and relevant scope | P0 |
| A2 I need a safe default role | Provide account-agnostic default roles with explained permissions | P0 |
| A3 I need a role that matches our work | Allow an authorised owner to create a custom role | P0 |
| A4 I need to distinguish product from access | Show configured channels separately from user channel entitlement | P0 |
| A5 I need store-limited In-store access | Apply store scope only to In-store permissions | P0 |
| A6 I need migrated users to keep legitimate access | Preserve or explicitly map the union of legacy permissions | P0 |
| A7 I need to know the effect before saving | Summarise people, channels and capabilities affected by a change | P0 |
| A8 I need sensitive access changes protected | Apply approved step-up authentication and audit logging | P1 |
| A9 I need refund duties separated | Support view, initiate, bulk initiate, approve and settings permissions | P0 |
| A10 I need to replace staff while preserving other users' work | Show affected membership and scope; retain required admin capabilities | P0 proposed |
| A11 I need to manage many staff changes efficiently | Review feasibility and release scope for bulk add/remove with per-user results | P1 proposed |

## Out of scope

1. Designing every legacy permission and product-specific policy in this document.
2. Partner and acquirer role administration.
3. Rewriting hard-coded legacy role dependencies as a design solution.
4. Defining employee or Pine Labs internal access.

# Mental models and design principles

- **A role describes work.**
  - Start with a recognisable job outcome and disclose the included permissions.
  - Do not make the administrator assemble a common role from an unexplained permission inventory.

- **Scope answers where the role applies.**
  - Role permissions, channel entitlement and store scope are separate choices.
  - Online has no store construct.

- **A hidden area means no access.**
  - Users see only permitted modules and actions.
  - A module hidden by permission must not appear as a zero balance or an unconfigured product.

- **Migration should preserve access, not legacy complexity.**
  - Record how each legacy role maps, but do not require future administrators to learn two old systems.

- **Changes need consequences.**
  - Before saving, explain who gains or loses access.
  - After saving, show completion, pending invitations and any action that could not be applied.

# Proposed solution and design

## Access model

- One identity can hold several account memberships.
- Each membership points to a business and includes channel entitlement, role and applicable store scope.
- A role contains functional permissions.
- Effective access is the intersection of these layers rather than the role name alone.

- Adding Online capability to a business does not grant Online access to every existing user.
- The owner deliberately adds that channel entitlement and appropriate permissions.
- This follows the login PRD's default-deny safeguard.

## Default and custom roles

- Provide default roles that are account agnostic, with clear summaries of the work each permits.
- Existing In-store roles include Owner, Admin, Store Manager, User Admin, Store Cashier, Accountant and EMI World User.
- Existing Online roles include Owner, Operations, Finance and Support.
- The final Omni default set and permission mapping require product approval.

- Authorised owners can create custom roles that combine Online and In-store permissions.
- The role editor groups permissions by merchant task, such as payments, settlements, refunds, reports, users, credentials and product settings.
- Search and grouping help navigation but do not replace a consequence summary.

## User and role journey

**Journey**

1. Open Users and Roles
2. Confirm business
3. Inspect current users and scope
4. Invite or select a user
5. Choose channel entitlement
6. Choose a default or custom role
7. Apply store scope where relevant
8. Review effective access
9. Complete approved authentication
10. Save
11. Show result and audit entry

- If an invited email already belongs to a central identity, add membership.
- Otherwise, begin the verification and password-setting journey.
- The invitation flow must not reveal unrelated businesses attached to that identity.

## Migration

- For an unmapped single-channel business, migrate the existing users and their current channel access.
- For a mapped omnichannel business, match personal identities using approved evidence and preserve the union of legitimate legacy permissions.
- When two roles differ, generate or assign a role that expresses that union rather than choosing one silently.

- Owners from both systems may become separate Omni owners.
- A person present in only one channel keeps only that channel's access.
- Migration records should retain the source role, resulting role, permissions and review outcome.

## Refund permission example

- Refunds require distinct permissions for viewing refunds, viewing bulk refunds, initiating a single refund, initiating a bulk request, approving refunds and managing refund settings.
- This example demonstrates why one broad Refunds permission would not support the supplied approval and bulk workflows.

- Use the Connplex case as a validation scenario: a manager retains transaction visibility but cannot initiate refunds, while an admin can initiate them.
- A change to one role must not disable the capability for every user (B08, B14; R04 Issues Reported).
- Verify the resulting access through actual protected actions and inspectable summaries, not only saved role labels.

## Staff replacement and bulk administration

- **Proposal:** an authorised administrator can find the departing user, inspect memberships and end or change access for the current business before inviting a replacement.
  - Show exactly which business, channels and stores are affected.
  - Preserve an audit trail and explain active-session effects.
  - Prevent removal of the only required administrator where the approved business rule requires one.
  - Identity-wide deletion must not be implied by a membership action.

- For A11, evaluate bulk invitation and removal with the users responsible for enterprise turnover (R05).
- If approved, provide a preview of each affected person and scope, validation before execution and per-user outcomes with safe recovery from partial failure.
- Exact batch limits, confirmation and mobile availability remain open product decisions.

## App behaviour

- The app should show the user's effective role and permitted scope and may support routine invitation or role assignment if approved for mobile.
- The exact boundary for custom-role construction and bulk access administration is pending.
- If a task is web-only, the app should explain that boundary and preserve the selected business when handing off.

## Web behaviour

- Web supports the full user list, role comparison, permission grouping, custom-role creation, migration review and audit-oriented workflows.
- Tables should allow administrators to compare user, role, channel and status without exposing unrelated identity information.

## States and recovery

| **State** | **User-facing treatment** |
| --- | --- |
| No permission to manage access | Hide management actions; retain the person's own role and scope if appropriate |
| Existing identity invited | Add membership and explain that no password reset is required |
| New identity invited | Show pending verification and resend or revoke options |
| Role change removes current administrator capability | Warn before save and require an authorised confirmation path |
| Permission update partially fails | Identify the affected user and unchanged access; do not claim completion |
| Access changed for active user | Re-evaluate the next protected request and explain that access was updated |
| Legacy role cannot map cleanly | Create a review case rather than silently broadening or reducing access |

# Dependencies and tradeoffs

- The design depends on a canonical permission inventory, central memberships, legacy role mapping, store assignments, audit records and enforcement parity across web and app.
- Custom roles increase flexibility but also increase configuration risk.
- Hiding inaccessible areas reduces clutter but can make support harder if administrators cannot inspect another user's effective access; the user list should therefore explain scope to authorised administrators.

# Hypotheses and validation

- **H1:** separating channel entitlement from functional role will help administrators add a second product without rebuilding every role.

- **H2:** role summaries plus an effective-access review will reduce scope mistakes compared with selecting from raw permission names.

- **H3:** explicit migration records will help operations resolve access problems without recreating the legacy system mentally.

- **H4:** discoverable membership controls and clear staff-replacement outcomes will reduce reliance on an operations contact without removing needed admin access.
  - Test the Connplex refund-authority scenario and Lifestyle turnover scenario before committing bulk scope (B14, B18; R04, R05).

- Test default and custom role assignment with actual access administrators from single-channel and omnichannel businesses, including owner and finance operators where they hold that responsibility.
- Include a multi-store manager, cashier, accountant, Online support role and a person with different roles in each legacy system.
- Validate permission enforcement on both web and app.

# Open questions

1. What is the approved Omni default-role set, and how does each legacy role map to it?
2. When the same person has different Online and In-store roles, should migration generate a custom role or attach separate channel-specific roles?
3. Which legacy role names are technically immutable, and can the interface show a clearer label without changing the backend key?
4. How quickly must permission changes affect an active session, and which changes require forced re-authentication?
5. Which access-management tasks are in scope for app, and which are intentionally web-only?
6. Who reviews migration exceptions and signs off that access was preserved without becoming broader?
7. Who handles staff turnover at each merchant size, and which bulk invitation/removal operations are approved for the release?
8. Which membership changes affect active sessions, and how is a required administrator retained during staff replacement?

# Alternatives considered

- **Keep two permission systems behind one interface:** reduces initial migration work but leaves administrators with inconsistent rules and makes cross-channel roles difficult to explain.

- **Use only coarse default roles:** is easier to understand but cannot support the supplied refund approval, bulk work and product-configuration separation.

- **Union every matched user's permissions automatically:** preserves access but can create inappropriate combinations.
  - Use explicit mapping and exception review where the union is sensitive.

# Appendix and references

- Parent strategy: docs/design/pine-one-platform-design-strategy.md.
- Personas, behaviours and research: docs/design/pine-one-user-personas-and-behaviours.md, especially P1, P4, P5, T4, T5, B08, B09, B14 and B18; R01 Prototype Task 7, R02 Store Cashier, R04 Issues Reported and R05 User Management and Store Operations. Original source details are in its research register.
- Login and Identity module: docs/design/pine-one-login-identity-design-document.md.
- Roles and Permissions on Omni, supplied 5 October 2026.
- Unified Login and Identity for Omni Merchant Dashboard PRD, supplied 5 October 2026.
- Refunds on Pine One Unified Dashboard, supplied 5 October 2026.
