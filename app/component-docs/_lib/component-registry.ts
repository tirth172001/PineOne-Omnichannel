export type DocsCategory =
  | "Foundations"
  | "Layout"
  | "Forms"
  | "Data Display"
  | "Feedback"
  | "Navigation"
  | "Overlay"

export type ComponentDoc = {
  slug: string
  title: string
  description: string
  category: DocsCategory
}

export const componentRegistry: ComponentDoc[] = [
  {
    slug: "layout-shell-v2",
    title: "Layout Shell v2",
    description: "256px rail, 64px top header, 1184px content width, and 32/24 spacing rhythm.",
    category: "Layout",
  },
  {
    slug: "page-header-v2",
    title: "Page Header v2",
    description: "Figma-aligned title, tabs, and right-side action slot.",
    category: "Layout",
  },
  {
    slug: "status-search-bar-v2",
    title: "Status & Search Bar v2",
    description: "Compact 32px controls with search, date/status filters, and actions.",
    category: "Layout",
  },
  {
    slug: "summary-cards-v2",
    title: "Summary Cards v2",
    description: "Two-panel metrics row with 76px card rhythm.",
    category: "Data Display",
  },
  {
    slug: "table-v2",
    title: "Table v2",
    description: "40px header, 72px rows, mixed-cell composition, and pagination footer.",
    category: "Data Display",
  },
  {
    slug: "sidebar",
    title: "Sidebar",
    description: "Desktop and mobile navigation rail patterns.",
    category: "Layout",
  },
  {
    slug: "page-header",
    title: "Page Header",
    description: "Desktop top header and section header variants.",
    category: "Layout",
  },
  {
    slug: "button",
    title: "Button",
    description: "Primary and secondary click actions.",
    category: "Forms",
  },
  {
    slug: "input-fields",
    title: "Input Fields",
    description: "Complete matrix of supported form field variants.",
    category: "Forms",
  },
  {
    slug: "badge",
    title: "Badge",
    description: "Compact status and tag labels.",
    category: "Data Display",
  },
  {
    slug: "input",
    title: "Input",
    description: "Single-line text and number fields.",
    category: "Forms",
  },
  {
    slug: "textarea",
    title: "Textarea",
    description: "Multi-line text input.",
    category: "Forms",
  },
  {
    slug: "select",
    title: "Select",
    description: "Dropdown option selector.",
    category: "Forms",
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    description: "Binary or multi-select control.",
    category: "Forms",
  },
  {
    slug: "switch",
    title: "Switch",
    description: "On/off state toggle.",
    category: "Forms",
  },
  {
    slug: "radio-group",
    title: "Radio Group",
    description: "Single choice from a set.",
    category: "Forms",
  },
  {
    slug: "slider",
    title: "Slider",
    description: "Continuous numeric input.",
    category: "Forms",
  },
  {
    slug: "input-otp",
    title: "Input OTP",
    description: "One-time password segmented input.",
    category: "Forms",
  },
  {
    slug: "toggle",
    title: "Toggle",
    description: "Pressable active/inactive action.",
    category: "Forms",
  },
  {
    slug: "toggle-group",
    title: "Toggle Group",
    description: "Grouped toggle controls.",
    category: "Forms",
  },
  {
    slug: "card",
    title: "Card",
    description: "Container surface for grouped content.",
    category: "Data Display",
  },
  {
    slug: "table",
    title: "Table",
    description: "Structured rows and columns.",
    category: "Data Display",
  },
  {
    slug: "avatar",
    title: "Avatar",
    description: "Profile image and fallback initials.",
    category: "Data Display",
  },
  {
    slug: "progress",
    title: "Progress",
    description: "Task completion indicator.",
    category: "Feedback",
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    description: "Loading placeholder blocks.",
    category: "Feedback",
  },
  {
    slug: "spinner",
    title: "Spinner",
    description: "Inline loading activity indicator.",
    category: "Feedback",
  },
  {
    slug: "alert",
    title: "Alert",
    description: "Inline message with intent.",
    category: "Feedback",
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    description: "Contextual hover/focus hints.",
    category: "Feedback",
  },
  {
    slug: "tabs",
    title: "Tabs",
    description: "Segmented page content navigation.",
    category: "Navigation",
  },
  {
    slug: "accordion",
    title: "Accordion",
    description: "Expandable vertical content sections.",
    category: "Navigation",
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    description: "Hierarchical navigation path.",
    category: "Navigation",
  },
  {
    slug: "pagination",
    title: "Pagination",
    description: "Page controls for large datasets.",
    category: "Navigation",
  },
  {
    slug: "navigation-menu",
    title: "Navigation Menu",
    description: "Top-level navigational flyout menu.",
    category: "Navigation",
  },
  {
    slug: "dialog",
    title: "Dialog",
    description: "Modal confirmation or form container.",
    category: "Overlay",
  },
  {
    slug: "sheet",
    title: "Sheet",
    description: "Side panel modal experience.",
    category: "Overlay",
  },
  {
    slug: "custom-sheet",
    title: "Custom Sheet",
    description: "Project-specific right context sheet with multi-section content.",
    category: "Overlay",
  },
  {
    slug: "drawer",
    title: "Drawer",
    description: "Mobile-friendly bottom/side panel.",
    category: "Overlay",
  },
  {
    slug: "popover",
    title: "Popover",
    description: "Anchored floating content block.",
    category: "Overlay",
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown Menu",
    description: "Action list attached to a trigger.",
    category: "Overlay",
  },
  {
    slug: "menubar",
    title: "Menubar",
    description: "Application command menu.",
    category: "Overlay",
  },
  {
    slug: "calendar",
    title: "Calendar",
    description: "Date and date-range selection UI.",
    category: "Overlay",
  },
] as const

export const docsCategories: DocsCategory[] = [
  "Foundations",
  "Layout",
  "Forms",
  "Data Display",
  "Feedback",
  "Navigation",
  "Overlay",
]

export const componentRegistryBySlug = Object.fromEntries(
  componentRegistry.map((component) => [component.slug, component])
) as Record<string, ComponentDoc>
