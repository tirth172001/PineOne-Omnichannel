import {
  Activity,
  Bell,
  ClipboardList,
  FileBarChart2,
  FileClock,
  Home,
  ListChecks,
  Settings,
  ShieldAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Screen } from "../types";
import { cn } from "./ui";

const navigation: Array<{ label: string; screen: Screen; icon: typeof Home }> = [
  { label: "RAAS Home", screen: "home", icon: Home },
  { label: "Programs", screen: "workspace", icon: ClipboardList },
  { label: "Recon Runs", screen: "results", icon: Activity },
  { label: "Exceptions", screen: "exceptions", icon: ShieldAlert },
  { label: "Reports", screen: "workspace", icon: FileBarChart2 },
  { label: "Audit Logs", screen: "audit", icon: FileClock },
  { label: "Settings", screen: "states", icon: Settings },
];

const titles: Partial<Record<Screen, { eyebrow: string; title: string; detail: string }>> = {
  home: {
    eyebrow: "First-time setup",
    title: "Welcome to RAAS",
    detail: "Reconciliation as a Service for finance operations.",
  },
  create: {
    eyebrow: "Program setup",
    title: "Create reconciliation program",
    detail: "Program = A reusable workspace for one reconciliation process.",
  },
  sources: {
    eyebrow: "Program setup",
    title: "Configure data sources",
    detail: "Connect every file family RAAS should compare.",
  },
  upload: {
    eyebrow: "Program setup",
    title: "Upload sample files",
    detail: "Validate representative files before mapping and matching.",
  },
  preview: {
    eyebrow: "Program setup",
    title: "Preview standardized rows",
    detail: "Review row quality before defining canonical fields.",
  },
  mapping: {
    eyebrow: "Canonical Mapping",
    title: "Tell RAAS what each column means.",
    detail: "Map your file columns to standard RAAS fields.",
  },
  rules: {
    eyebrow: "Match Rules",
    title: "Tell RAAS how to compare records.",
    detail: "Custom Rules = Optional business-specific conditions such as date or amount tolerance.",
  },
  review: {
    eyebrow: "Review",
    title: "Review setup",
    detail: "Confirm sources, mappings, and match rules before the first run.",
  },
  ready: {
    eyebrow: "Program ready",
    title: "Your reconciliation program is ready",
    detail: "Run the first reconciliation using today's files.",
  },
  workspace: {
    eyebrow: "Workspace",
    title: "Reconciliation dashboard",
    detail: "Track match quality, exceptions, duplicate risk, and settlement value.",
  },
  newRun: {
    eyebrow: "Recon run",
    title: "New reconciliation run",
    detail: "Upload today's files and run the active program.",
  },
  processing: {
    eyebrow: "Recon run",
    title: "Processing reconciliation",
    detail: "RAAS is validating, standardizing, matching, and generating results.",
  },
  results: {
    eyebrow: "Results",
    title: "Reconciliation results",
    detail: "Investigate matches, duplicates, missing settlements, and exceptions.",
  },
  exceptions: {
    eyebrow: "Exception management",
    title: "Resolve reconciliation exceptions",
    detail: "Compare records, add notes, and save manual actions.",
  },
  audit: {
    eyebrow: "Audit logs",
    title: "Activity timeline",
    detail: "Review user actions and system changes for reconciliation governance.",
  },
  states: {
    eyebrow: "Reusable states",
    title: "Global UI states",
    detail: "Common operational states used across the RAAS prototype.",
  },
  permission: {
    eyebrow: "Access",
    title: "Permission denied",
    detail: "This state appears when a user cannot access a restricted workspace.",
  },
  session: {
    eyebrow: "Session",
    title: "Session expired",
    detail: "This state appears when secure access needs to be refreshed.",
  },
};

const wizardScreens: Screen[] = ["create", "sources", "upload", "preview", "mapping", "rules", "review", "ready"];

const wizardSteps = [
  { label: "Program details", screen: "create" as Screen },
  { label: "Data sources", screen: "sources" as Screen },
  { label: "Upload sample files", screen: "upload" as Screen },
  { label: "Canonical mapping", screen: "mapping" as Screen },
  { label: "Match rules", screen: "rules" as Screen },
  { label: "Review & finish", screen: "review" as Screen },
];

function getWizardIndex(screen: Screen) {
  if (screen === "preview") return 2;
  if (screen === "ready") return 5;
  return wizardSteps.findIndex((step) => step.screen === screen);
}

function Stepper({ screen, onNavigate }: { screen: Screen; onNavigate: (screen: Screen) => void }) {
  const activeIndex = getWizardIndex(screen);

  return (
    <div className="border-b border-slate-200 bg-white px-8 py-4">
      <div className="grid grid-cols-6 gap-3">
        {wizardSteps.map((step, index) => {
          const active = index === activeIndex;
          const complete = index < activeIndex || screen === "ready";
          return (
            <button
              key={step.label}
              onClick={() => complete || active ? onNavigate(step.screen) : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition",
                active ? "border-teal-700 bg-teal-50 text-teal-950" : complete ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-500",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  active ? "bg-teal-700 text-white" : complete ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600",
                )}
              >
                {index + 1}
              </span>
              <span className="leading-5">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Layout({
  screen,
  onNavigate,
  children,
}: {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  children: ReactNode;
}) {
  const title = titles[screen] ?? titles.home!;
  const showStepper = wizardScreens.includes(screen) && screen !== "ready";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-5">
        <button onClick={() => onNavigate("home")} className="mb-8 flex items-center gap-3 text-left">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-teal-700 text-sm font-bold text-white">R</div>
          <div>
            <div className="text-sm font-semibold">RAAS</div>
            <div className="text-xs text-slate-500">Reconciliation as a Service</div>
          </div>
        </button>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.screen === screen ||
              (item.screen === "home" && wizardScreens.includes(screen)) ||
              (item.screen === "results" && ["newRun", "processing"].includes(screen));
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.screen)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition",
                  active ? "bg-teal-50 text-teal-950" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Active workspace</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">Apparel stores daily card settlement</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">3-way POS, Pine, and Bank reconciliation</p>
        </div>
      </aside>

      <div className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-8 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase text-teal-700">{title.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">{title.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{title.detail}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-600" aria-label="Notifications" title="Notifications">
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-slate-800 text-xs font-semibold text-white">AR</div>
                <div>
                  <p className="text-sm font-semibold">Ananya Rao</p>
                  <p className="text-xs text-slate-500">Finance Executive</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {showStepper ? <Stepper screen={screen} onNavigate={onNavigate} /> : null}
        <main className="px-8 py-7">{children}</main>
      </div>
    </div>
  );
}
