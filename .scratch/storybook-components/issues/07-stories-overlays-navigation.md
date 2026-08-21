Type: task
Status: resolved

## Question

Write stories for the overlay/menu/navigation components in `components/ui/`, following [Story authoring conventions](02-story-authoring-conventions.md):

`dialog.tsx`, `alert-dialog.tsx`, `drawer.tsx`, `sheet.tsx`, `popover.tsx`, `hover-card.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `menubar.tsx`, `tabs.tsx`, `accordion.tsx`, `collapsible.tsx`, `breadcrumb.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `command.tsx`, `sidebar.tsx`.

Every one of these is a compound/composed component (per convention #5) — one story per file showing one realistic assembled usage (e.g. a `Dialog` with trigger + content + footer open by default via `parameters`/`play`, not a story per `DialogTrigger`/`DialogContent` sub-part). `sidebar.tsx` may need a wrapping layout container in its story to render sensibly in isolation — use judgment, note any deviation in the Answer.

## Answer

All 18 stories written, each showing one realistic assembled usage per convention #5 (compound components), with `defaultOpen: true` used for click-to-open overlays so the interesting state is visible immediately in the canvas:

`dialog`, `alert-dialog`, `drawer`, `sheet`, `popover`, `hover-card`, `tooltip` (wrapped in `TooltipProvider`), `dropdown-menu`, `menubar`, `tabs`, `accordion`, `collapsible`, `breadcrumb`, `navigation-menu`, `pagination`, `command`, `sidebar` (wrapped in `SidebarProvider` + `SidebarInset`, `collapsible="none"` and a fixed-height container so the full-viewport-height component renders sensibly inside the Storybook canvas).

`context-menu.tsx` is the one exception to `defaultOpen`: Radix's `ContextMenu` positions its content at the actual right-click event coordinates, so forcing it open without a real event isn't meaningful — the story instead shows the trigger area with instructions ("Right-click here") and works correctly on a real right-click, verified live.

**Verified live in the browser**, sidebar shows all 18 new `UI/*` entries with no console/server errors. Spot-checked the riskiest ones: `Sidebar` (nav items, active state, trigger, and inset content all render correctly inside the constrained-height wrapper), `Command` (search input, grouped suggestions, shortcut, separator all correct), `Dialog` (opens by default, footer buttons, close button), `ContextMenu` (right-clicking the trigger area opens the menu at the cursor with the destructive "Void" item styled red). `tsc --noEmit` stayed at the pre-existing 34-error baseline — no new errors from any of the 18 story files.
