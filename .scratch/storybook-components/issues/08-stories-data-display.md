Type: task
Status: resolved

## Question

Write stories for the data-display components in `components/ui/`, following [Story authoring conventions](02-story-authoring-conventions.md):

`table.tsx`, `data-table.tsx`, `card.tsx`, `item.tsx`, `chart.tsx`, `highcharts.tsx`, `carousel.tsx`, `calendar.tsx`, `progress.tsx`, `aspect-ratio.tsx`, `separator.tsx`, `animated-number-text.tsx`, `avatar.tsx`, `badge.tsx`.

`data-table.tsx` and `table.tsx` need small inline mock row data per convention #6. Note in the Answer whether writing `data-table.tsx`'s story surfaces anything relevant to the still-open "does `data-table.tsx` vs `transaction-style-table.tsx` need to converge" question from the map's Not yet specified — don't resolve that question here, just flag if something's learned. `chart.tsx`/`highcharts.tsx` need representative mock series data.

## Answer

All 14 stories written: `table`, `data-table`, `card`, `item`, `chart`, `highcharts`, `carousel`, `calendar`, `progress`, `aspect-ratio`, `separator`, `animated-number-text`, `avatar`, `badge`.

**`data-table.tsx` vs `transaction-style-table.tsx` convergence signal** (per this ticket's instruction to flag, not resolve): writing `DataTable`'s story made the capability gap concrete — `DataTable` has built-in search, column filters, sort, a "Customize" column-visibility/reorder/pin menu, and a responsive mobile card layout (confirmed live: at narrow viewport it renders as stacked cards, not a table). `TransactionStyleTable` has none of that — just columns + rows + pagination. This is evidence toward "deliberately different tools" (heavy vs. light) rather than true duplication, but leaving the actual call to whoever resolves that Not-yet-specified item with fuller context.

**Verified live in the browser**: `DataTable` renders as responsive cards at narrow width and a full sortable/filterable table at desktop width (1440px) — both correct. `Chart` (Recharts `BarChart` via `ChartContainer`) initially rendered with near-zero-height bars on first paint — confirmed via DOM inspection this was a transient `ResizeObserver` timing artifact in the iframe (bars settled to correct proportions ~1s later, not a real bug). `HighchartsPanelChart` renders a proper spline chart. `Calendar` renders with the selected date highlighted. `Carousel` renders with working slide + next arrow. No console/server errors beyond expected React Testing act() warnings not specific to this batch. `tsc --noEmit` stayed at the pre-existing 34-error baseline; one TS fix needed — `chart.stories.tsx`'s `ChartContainer` has a required `children` prop that Storybook's args-typing wants explicit (not just supplied via `render`), fixed by moving the chart JSX into `args.children`.
