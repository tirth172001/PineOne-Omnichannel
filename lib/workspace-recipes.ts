export type ContextPolicy = "none" | "on-trigger" | "required"

export interface ContextTrigger {
  id: string
  sourceRegion: string
  actionType: "select" | "filter" | "drilldown" | "anomaly" | "cta"
  payload?: string
}

export interface PageLayoutRecipe {
  showSecondaryNav: boolean
  leftContextPolicy: ContextPolicy
  rightContextPolicy: ContextPolicy
  defaultOpenState: {
    left: boolean
    right: boolean
  }
  triggerMap: Record<string, string>
  section:
    | "overview"
    | "payments"
    | "products"
    | "operations"
    | "onboarding"
    | "other"
}

const FALLBACK_RECIPE: PageLayoutRecipe = {
  showSecondaryNav: false,
  leftContextPolicy: "none",
  rightContextPolicy: "none",
  defaultOpenState: { left: false, right: false },
  triggerMap: {},
  section: "other",
}

const SHARED_TRIGGER = {
  selection_open: "Open contextual inspector with what happened, why it matters, and next action",
  clear_selection: "Close contextual inspector and return to center workspace",
}

const ROUTE_RECIPES: Record<string, PageLayoutRecipe> = {
  "/": {
    showSecondaryNav: true,
    leftContextPolicy: "none",
    rightContextPolicy: "on-trigger",
    defaultOpenState: { left: false, right: false },
    triggerMap: {
      ...SHARED_TRIGGER,
      anomaly_click: "Open recommendation panel with root cause and corrective action",
      trend_click: "Open KPI explainability inspector",
    },
    section: "overview",
  },
  "/online-payments": {
    showSecondaryNav: true,
    leftContextPolicy: "none",
    rightContextPolicy: "on-trigger",
    defaultOpenState: { left: false, right: false },
    triggerMap: {
      ...SHARED_TRIGGER,
      chart_drilldown: "Open method/app/failure segment inspector",
      row_click: "Open transaction detail and remediation actions",
    },
    section: "payments",
  },
  "/offline-payments": {
    showSecondaryNav: true,
    leftContextPolicy: "none",
    rightContextPolicy: "on-trigger",
    defaultOpenState: { left: false, right: false },
    triggerMap: {
      ...SHARED_TRIGGER,
      device_click: "Open device configuration and health context",
      segment_click: "Open channel drilldown context",
    },
    section: "payments",
  },
  "/payment-links": {
    showSecondaryNav: true,
    leftContextPolicy: "none",
    rightContextPolicy: "on-trigger",
    defaultOpenState: { left: false, right: false },
    triggerMap: {
      ...SHARED_TRIGGER,
      link_click: "Open lifecycle detail, share controls, and QR actions",
      create_click: "Open create-link flow inspector",
    },
    section: "payments",
  },
  "/products": {
    showSecondaryNav: true,
    leftContextPolicy: "none",
    rightContextPolicy: "on-trigger",
    defaultOpenState: { left: false, right: false },
    triggerMap: {
      ...SHARED_TRIGGER,
      category_click: "Open activation prerequisites and impact preview",
    },
    section: "products",
  },
  "/support": {
    showSecondaryNav: true,
    leftContextPolicy: "none",
    rightContextPolicy: "on-trigger",
    defaultOpenState: { left: false, right: false },
    triggerMap: {
      ...SHARED_TRIGGER,
      ticket_click: "Open owner, SLA, metadata, and action controls",
    },
    section: "operations",
  },
  "/settings": {
    showSecondaryNav: true,
    leftContextPolicy: "none",
    rightContextPolicy: "on-trigger",
    defaultOpenState: { left: false, right: false },
    triggerMap: {
      ...SHARED_TRIGGER,
      section_click: "Open risks, dependency hints, and contextual controls",
    },
    section: "operations",
  },
  "/onboarding/pos": {
    showSecondaryNav: false,
    leftContextPolicy: "none",
    rightContextPolicy: "none",
    defaultOpenState: { left: false, right: false },
    triggerMap: {},
    section: "onboarding",
  },
  "/onboarding/lending": {
    showSecondaryNav: false,
    leftContextPolicy: "none",
    rightContextPolicy: "none",
    defaultOpenState: { left: false, right: false },
    triggerMap: {},
    section: "onboarding",
  },
}

export function getPageLayoutRecipe(pathname: string): PageLayoutRecipe {
  if (pathname in ROUTE_RECIPES) {
    return ROUTE_RECIPES[pathname]
  }

  return FALLBACK_RECIPE
}
