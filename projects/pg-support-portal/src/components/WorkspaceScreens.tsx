import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  FileClock,
  FileSearch,
  Filter,
  Loader2,
  LockKeyhole,
  LogIn,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  UploadCloud,
  X,
} from "lucide-react";
import { useState } from "react";
import { auditLogs, exceptionItems, recentRuns, resultRows, transactionTimeline, uploadSamples, workspaceKpis } from "../data/mockData";
import type { ExceptionItem, ResultRow, ResultStatus, Screen } from "../types";
import { Banner, Button, Chip, EmptyState, KpiCard, Panel, PriorityChip, ProgressBar, SectionHeader, StatusChip } from "./ui";

interface NavProps {
  onNavigate: (screen: Screen) => void;
  showToast: (title: string, message: string, tone?: "success" | "error" | "info") => void;
}

export function WorkspaceDashboard({ onNavigate }: Pick<NavProps, "onNavigate">) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        {workspaceKpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <Panel>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Recent reconciliation runs</h2>
          <Button onClick={() => onNavigate("newRun")} icon={<ArrowRight className="h-4 w-4" />}>
            New reconciliation run
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["Run ID", "Program", "Date", "Status", "Match %", "Exceptions", "Settlement value"].map((heading) => (
                  <th key={heading} className="border-b border-slate-200 px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRuns.map((run) => (
                <tr key={run.id} className="bg-white hover:bg-slate-50">
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold text-slate-950">{run.id}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{run.program}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{run.date}</td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <Chip tone={run.status.includes("warnings") ? "amber" : "green"}>{run.status}</Chip>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold">{run.matchRate}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{run.exceptions}</td>
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold">{run.settlementValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function NewRunScreen({ onNavigate }: Pick<NavProps, "onNavigate">) {
  const todayUploads = uploadSamples.slice(0, 4);

  return (
    <div className="grid grid-cols-[1fr_340px] gap-6">
      <Panel className="p-6">
        <div className="grid gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Select program</span>
            <select className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
              <option>Apparel stores daily card settlement</option>
              <option>QSR marketplace payouts</option>
              <option>Healthcare UPI gateway settlement</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            {todayUploads.map((upload) => (
              <div key={upload.sourceId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{upload.fileName.replace("06_jul", "07_jul")}</p>
                    <p className="mt-1 text-xs text-slate-500">{upload.rows.toLocaleString("en-IN")} rows detected</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="mt-4">
                  <ProgressBar value={upload.status === "error" ? 72 : 100} tone={upload.status === "error" ? "amber" : "teal"} />
                </div>
                <Button variant="secondary" className="mt-4" icon={<UploadCloud className="h-4 w-4" />}>
                  Upload today&apos;s file
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => onNavigate("workspace")} icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            <Button onClick={() => onNavigate("processing")} icon={<ArrowRight className="h-4 w-4" />}>
              Run reconciliation
            </Button>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="text-sm font-semibold text-slate-950">Run summary</p>
        <div className="mt-5 space-y-4 text-sm">
          <div>
            <p className="text-slate-500">Program</p>
            <p className="mt-1 font-semibold">Apparel stores daily card settlement</p>
          </div>
          <div>
            <p className="text-slate-500">Files</p>
            <p className="mt-1 font-semibold">4 uploaded, 1 warning</p>
          </div>
          <div>
            <p className="text-slate-500">Expected volume</p>
            <p className="mt-1 font-semibold">18,000 - 20,000 rows</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function ProcessingScreen({ onNavigate }: Pick<NavProps, "onNavigate">) {
  const stages = [
    { label: "Validating files", progress: 100, detail: "Schemas and required columns checked." },
    { label: "Standardizing data", progress: 100, detail: "Dates, amounts, RRN, UTR, TID, and MID normalized." },
    { label: "Applying rules", progress: 78, detail: "RRN + Amount rule is processing bank rows." },
    { label: "Generating results", progress: 44, detail: "KPI, exception, and audit outputs are being prepared." },
  ];

  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      <Panel className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
          <h2 className="text-lg font-semibold text-slate-950">Run RUN-2026-0707-01</h2>
        </div>
        <div className="mt-6 space-y-5">
          {stages.map((stage) => (
            <div key={stage.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-950">{stage.label}</span>
                <span className="text-slate-500">{stage.progress}%</span>
              </div>
              <ProgressBar value={stage.progress} tone={stage.progress === 100 ? "teal" : "blue"} />
              <p className="mt-2 text-sm text-slate-500">{stage.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={() => onNavigate("results")} icon={<ArrowRight className="h-4 w-4" />}>
            View results
          </Button>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="text-sm font-semibold text-slate-950">Processing guardrails</p>
        <div className="mt-5 space-y-4 text-sm">
          {["No backend required", "Mocked processing state", "Audit entries simulated", "Results generated locally"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ResultsDashboard({
  visibleResults,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  onOpenResult,
  showToast,
}: {
  visibleResults: ResultRow[];
  statusFilter: ResultStatus | "All";
  setStatusFilter: (value: ResultStatus | "All") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onOpenResult: (row: ResultRow) => void;
  showToast: NavProps["showToast"];
}) {
  const statuses: Array<ResultStatus | "All"> = [
    "All",
    "Exact Match",
    "Amount Tolerance Match",
    "Date Tolerance Match",
    "Duplicate",
    "Missing in Bank",
    "Exception",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        {workspaceKpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <Panel className="p-5">
        <div className="grid grid-cols-[1fr_180px_180px_150px] gap-3">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              placeholder="Search RRN / UTR / Transaction ID"
            />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ResultStatus | "All")} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4" />
            Date / amount
          </button>
          <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => showToast("Export started", "RAAS is preparing a CSV export for this result set.", "info")}>
            Export
          </Button>
        </div>
      </Panel>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["Transaction ID", "Source", "Amount", "Date", "Match status", "Reason", "Action"].map((heading) => (
                  <th key={heading} className="border-b border-slate-200 px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleResults.map((row) => (
                <tr key={row.id} className="bg-white hover:bg-slate-50">
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold text-slate-950">{row.transactionId}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.source}</td>
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold">{row.amount}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.date}</td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <StatusChip status={row.status} />
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 text-slate-600">{row.reason}</td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <button onClick={() => onOpenResult(row)} className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                      View detail
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function TransactionDetailsDrawer({
  result,
  onClose,
  onManualMatch,
  onMarkException,
}: {
  result: ResultRow | null;
  onClose: () => void;
  onManualMatch: () => void;
  onMarkException: () => void;
}) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-30 bg-slate-950/30">
      <aside className="fixed bottom-0 right-0 top-0 w-[620px] overflow-y-auto border-l border-slate-200 bg-white shadow-lg">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700">Transaction details</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{result.transactionId}</h2>
            <p className="mt-1 text-sm text-slate-500">{result.merchant}</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 text-slate-600" aria-label="Close drawer" title="Close drawer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <StatusChip status={result.status} />
            <p className="text-sm font-semibold text-slate-950">{result.amount}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              ["POS / gateway", result.gateway, result.rrn],
              ["Bank settlement", result.utr, result.date],
            ].map(([title, primary, secondary]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{primary}</p>
                <p className="mt-1 text-sm text-slate-600">{secondary}</p>
              </div>
            ))}
          </div>

          <Banner tone={result.status === "Exception" || result.status === "Missing in Bank" ? "warning" : "success"} title="Match explanation">
            {result.reason} RAAS used configured rules and preserved the rule decision in the audit timeline.
          </Banner>

          <Panel>
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-950">Audit timeline</h3>
            </div>
            <div className="space-y-4 p-5">
              {transactionTimeline.map((item) => (
                <div key={`${item.time}-${item.title}`} className="grid grid-cols-[80px_1fr] gap-4">
                  <p className="text-xs font-semibold text-slate-500">{item.time}</p>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex gap-3">
            <Button onClick={onManualMatch} icon={<CheckCircle2 className="h-4 w-4" />}>
              Manual match
            </Button>
            <Button variant="secondary" onClick={onMarkException} icon={<ShieldAlert className="h-4 w-4" />}>
              Mark as exception
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function ExceptionManagement({ showToast }: Pick<NavProps, "showToast">) {
  const [selected, setSelected] = useState<ExceptionItem>(exceptionItems[0]);
  const [note, setNote] = useState("");

  return (
    <div className="grid grid-cols-[420px_1fr] gap-6">
      <Panel>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Exception list</h2>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {exceptionItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelected(item);
                setNote("");
              }}
              className={`block w-full px-5 py-4 text-left transition ${selected.id === item.id ? "bg-teal-50" : "bg-white hover:bg-slate-50"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.transactionId}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
                </div>
                <PriorityChip priority={item.priority} />
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span>{item.source}</span>
                <span>{item.age}</span>
                <span>{item.amount}</span>
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="p-6">
        <SectionHeader
          title="Compare records"
          description={`${selected.transactionId} requires a manual reconciliation decision before it can be cleared.`}
        />

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Source record</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{selected.source}</p>
            <p className="mt-1 text-sm text-slate-600">{selected.amount}</p>
            <p className="mt-1 text-sm text-slate-600">{selected.reason}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Candidate match</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">Bank settlement</p>
            <p className="mt-1 text-sm text-slate-600">{selected.amount}</p>
            <p className="mt-1 text-sm text-slate-600">UTR candidate pending confirmation</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-slate-800">Mandatory note before saving</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-3 text-sm leading-6 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            placeholder="Explain the manual reconciliation action."
          />
        </label>

        <div className="mt-5 flex gap-3">
          <Button
            disabled={!note.trim()}
            onClick={() => {
              showToast("Exception resolved", `${selected.transactionId} was saved with your reconciliation note.`, "success");
              setNote("");
            }}
          >
            Save manual reconciliation
          </Button>
          <Button variant="secondary">Assign to owner</Button>
        </div>
      </Panel>
    </div>
  );
}

export function AuditLogs({ showToast }: Pick<NavProps, "showToast">) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => showToast("Audit export queued", "The audit log export is being prepared.", "info")}>
          Export audit log
        </Button>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["User", "Action", "Timestamp", "Object changed", "Old value", "New value"].map((heading) => (
                  <th key={heading} className="border-b border-slate-200 px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="bg-white hover:bg-slate-50">
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold text-slate-950">{log.user}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{log.action}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{log.timestamp}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{log.objectChanged}</td>
                  <td className="border-b border-slate-100 px-4 py-4 text-slate-500">{log.oldValue}</td>
                  <td className="border-b border-slate-100 px-4 py-4 text-slate-950">{log.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function GlobalStates({ onNavigate, showToast }: NavProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Panel className="p-5">
        <h2 className="text-base font-semibold text-slate-950">Empty state</h2>
        <div className="mt-4">
          <EmptyState icon={<FileSearch className="h-5 w-5" />} title="No exceptions match this filter" description="Clear filters or select another reason to view pending reconciliation items." />
        </div>
      </Panel>

      <Panel className="p-5">
        <h2 className="text-base font-semibold text-slate-950">Loading state</h2>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
          <div>
            <p className="text-sm font-semibold">Standardizing transaction fields</p>
            <p className="mt-1 text-sm text-slate-500">RRN, UTR, amount, and dates are being normalized.</p>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <h2 className="text-base font-semibold text-slate-950">Success toast</h2>
        <Button className="mt-4" onClick={() => showToast("Program saved", "Your reconciliation program was updated.", "success")}>
          Trigger success
        </Button>
      </Panel>

      <Panel className="p-5">
        <h2 className="text-base font-semibold text-slate-950">Error banner</h2>
        <div className="mt-4">
          <Banner tone="error" title="File validation failed">
            Razorpay file format is invalid. Upload a CSV or XLSX file before running production reconciliation.
          </Banner>
        </div>
      </Panel>

      <Panel className="p-5">
        <h2 className="text-base font-semibold text-slate-950">Access states</h2>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" onClick={() => onNavigate("permission")} icon={<LockKeyhole className="h-4 w-4" />}>
            Permission denied
          </Button>
          <Button variant="secondary" onClick={() => onNavigate("session")} icon={<LogIn className="h-4 w-4" />}>
            Session expired
          </Button>
        </div>
      </Panel>

      <Panel className="p-5">
        <h2 className="text-base font-semibold text-slate-950">Confirmation modal</h2>
        <p className="mt-2 text-sm text-slate-500">The transaction drawer and exception actions use the shared confirmation modal.</p>
      </Panel>
    </div>
  );
}

export function PermissionDenied({ onNavigate }: Pick<NavProps, "onNavigate">) {
  return (
    <Panel className="mx-auto max-w-2xl p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-rose-50 text-rose-700">
        <LockKeyhole className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-slate-950">You do not have access to this program.</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Ask a workspace admin to grant access to the reconciliation program or select a different workspace.</p>
      <Button className="mt-6" onClick={() => onNavigate("states")}>
        Back to states
      </Button>
    </Panel>
  );
}

export function SessionExpired({ onNavigate }: Pick<NavProps, "onNavigate">) {
  return (
    <Panel className="mx-auto max-w-2xl p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-amber-50 text-amber-700">
        <FileClock className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-slate-950">Your session has expired.</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Refresh access before viewing payment data, audit history, or settlement details.</p>
      <Button className="mt-6" onClick={() => onNavigate("home")}>
        Return to RAAS Home
      </Button>
    </Panel>
  );
}
