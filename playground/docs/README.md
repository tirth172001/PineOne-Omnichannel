# Docs: research and reference

This folder holds what we know about our merchants and products: merchant research, visit notes, interviews, user journeys, personas and other reference documents. Each document is one Markdown file. The playground shows them in the **Docs** folder, at `/docs/<file-name>`, and the home search looks through their full text.

## For agents: read before you judge

Before you make a design or product judgement, check this folder for research that covers it. Examples of such judgements: what a merchant needs, which flow or step to keep, what to call something, or what to show first. This applies to a prototype here, the web portal (repo root) or the mobile app (`mobile/`).

1. Scan the **Index** below. You can also search the front matter: `grep -l "topics:.*settlement" playground/docs/*.md`.
2. Read the documents that match the product, module or merchant type you're working on.
3. Let them shape the decision, and cite them in your reply or `HOW_IT_WORKS.md`, in the form "<document title>, <date>: <the finding>".
4. If the research contradicts the request, say so and quote it. Don't silently override the owner.
5. If nothing here covers it, say so plainly. Don't invent research findings.

Never edit a document's findings to fit a design. Fixing a conversion error is fine.

## Adding a document

> **The GitHub repo is public.** The design documents here were already in the repo (`docs/exports/`). Raw customer research (visit notes, interview transcripts, merchant contact details) must not be pushed until the owner has decided where it lives (private repo, or kept out of git). Ask before committing that kind of document.

The owner gives you a file (Word, PDF, Google Doc export, notes). Then:

1. Convert it to Markdown in `playground/docs/<kebab-case-name>.md`.
   - Keep the content and structure: headings, lists, tables and quotes.
   - Don't summarise or reword findings.
   - Drop images unless they carry information. If one does, describe it in a line.
   - Leave out personal data such as merchant phone numbers or emails. Business names and cities are fine unless the owner says otherwise.
2. Start it with front matter:
   ```
   ---
   title: <Document title>
   description: <One line on what it covers and who it's about>
   kind: Merchant research
   date: <YYYY-MM-DD>
   topics: [<product>, <module>, <merchant type>]
   source: <original file name>
   ---
   ```
   - **Required:** `title`, `description`, `kind` and `date`.
   - **`date`** is when the research happened, in YYYY-MM-DD.
   - **`topics`** are lowercase and drive search and agent lookup. Start with the channel it covers, `in-store` and/or `online`; these become the In-store / Online tags in the Docs folder. Then add modules (`settlements`, `refunds`, `onboarding`, …) and merchant types.
   - Persona tags (Business owner, Store manager, …) are worked out automatically from P1–P5 mentions.
   - **`kind`** should reuse an existing one where it fits: `Merchant research`, `User journey`, `Interview notes`, `Persona`, `Research plan`, `Survey`.
3. Add a row to the **Index** below.
4. Run `npm run check`. The build fails if the front matter is missing or the file name isn't kebab-case.

Don't commit the original file unless the owner asks for it.

## Cross-references

The documents cite shared IDs:
- **P1–P5** personas, **T1–T5** task lenses, **B01–B18** behaviours and **R01–R05** merchant visits: defined in the personas reference.
- **G1–G5** goals, **R1–R15** platform requirements and **D1–D11** decisions: defined in the strategy.

They also name each other in full ("Pine One Refunds Design Document"). The doc pages link every mention: hovering shows the definition, and clicking goes to it (`lib/references.ts`). When you add a document that defines new IDs, use a heading (`## X01 Name`), a table row starting with the ID, or a paragraph starting `**D12 Name — status.**`, and add the ID pattern to `ID` in `lib/references.ts`.

## Index

Start with the **Omni platform design strategy** (goals G1–G5, principles, decisions) and the **User personas and behaviour reference** (P personas, T task lenses, B behaviours, R research sources). The module documents cite those IDs.

| Document | Kind | Date | Topics |
|---|---|---|---|
| [Omni platform design strategy](pine-one-omni-platform-design-strategy.md) | Design strategy | 2026-10-05 | in-store, online, strategy, principles, login, platform |
| [User personas and behaviour reference](pine-one-user-personas-and-behaviour.md) | Persona reference | 2026-10-05 | in-store, online, personas, behaviour, merchant research |
| [Cross-platform experience discovery findings](pine-one-cross-platform-discovery-findings.md) | Discovery findings | 2026-10-01 | in-store, online, discovery, information architecture, cross-platform |
| [Account Settings design document](pine-one-account-settings-design.md) | Module design | 2026-10-05 | in-store, online, account settings, profile, preferences |
| [Checkout design document](pine-one-checkout-design.md) | Module design | 2026-10-05 | online, checkout |
| [Devices design document](pine-one-devices-design.md) | Module design | 2026-10-05 | in-store, devices, pos |
| [Disputes design document](pine-one-disputes-design.md) | Module design | 2026-10-05 | in-store, online, disputes, chargebacks |
| [Help and Support design document](pine-one-help-and-support-design.md) | Module design | 2026-10-05 | in-store, online, support, tickets |
| [Login and Identity design document](pine-one-login-and-identity-design.md) | Module design | 2026-10-05 | in-store, online, login, identity, business selection |
| [Online Payment Configuration design document](pine-one-online-payment-configuration-design.md) | Module design | 2026-10-05 | online, payment methods, configuration |
| [Overview design document](pine-one-overview-design.md) | Module design | 2026-10-05 | in-store, online, overview, home |
| [Payment Links design document](pine-one-payment-links-design.md) | Module design | 2026-10-05 | online, payment links |
| [Refunds design document](pine-one-refunds-design.md) | Module design | 2026-10-05 | in-store, online, refunds |
| [Reports design document](pine-one-reports-design.md) | Module design | 2026-10-05 | in-store, online, reports |
| [Roles and Permissions design document](pine-one-roles-and-permissions-design.md) | Module design | 2026-10-05 | in-store, online, roles, permissions, users |
| [Settlements design document](pine-one-settlements-design.md) | Module design | 2026-10-05 | in-store, online, settlements, reconciliation |
| [Stores design document](pine-one-stores-design.md) | Module design | 2026-10-05 | in-store, stores |
| [Transactions design document](pine-one-transactions-design.md) | Module design | 2026-10-05 | in-store, online, transactions, payments |
| [Recon Field Mapping Decisions](recon-field-mapping-decisions.md) | Module design | 2026-11-24 | in-store, online, reconciliation, field mapping, settlements |
| [Recon Upload Validation Decisions](recon-upload-validation-decisions.md) | Module design | 2026-11-24 | in-store, online, reconciliation, upload validation, settlements |
| [Recon Run Limits Decisions](recon-run-limits-decisions.md) | Module design | 2026-11-24 | in-store, online, reconciliation, run limits, upload validation |
