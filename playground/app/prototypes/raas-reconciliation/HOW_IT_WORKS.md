# RaaS Reconciliation

## What It Does

Opens the separately deployed RaaS dashboard at the start of a new reconciliation.

## Architecture

```text
Playground card → RaaS Reconciliation deployment on Vercel
Prototype detail → ExternalApp → same destination
```

## Frontend / API

- The card opens the new reconciliation flow in a separate tab.
- The Playground reads the deployment URL from the metadata. The deployed app handles the reconciliation workflow.

## Key Dependencies

- Shared `ExternalApp` component.
- RaaS Reconciliation Vercel deployment maintained by `ruthvik-deploys`.

## Component Tree

`RaasReconciliationPage` → `ExternalApp`

## Error Handling

The external tab displays any error returned by the deployment. Update the URL in `metadata.json` if the deployment moves.

## File Structure

- `page.tsx` renders the detail page.
- `metadata.json` sets the gallery folder, description, and destination URL.
