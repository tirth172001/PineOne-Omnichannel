import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Database,
  Edit3,
  FileCheck2,
  FileSpreadsheet,
  GitBranch,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { canonicalFieldOptions, dataSources, mappingRows, previewRows, uploadSamples } from "../data/mockData";
import type { DataSourceId, ReconciliationType, Screen } from "../types";
import { Banner, Button, Chip, cn, EmptyState, Panel, ProgressBar, SectionHeader, UploadChip } from "./ui";

interface ProgramStateProps {
  programName: string;
  setProgramName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  reconciliationType: ReconciliationType;
  setReconciliationType: (value: ReconciliationType) => void;
  businessUnit: string;
  setBusinessUnit: (value: string) => void;
}

interface NavProps {
  onNavigate: (screen: Screen) => void;
  showToast: (title: string, message: string, tone?: "success" | "error" | "info") => void;
}

export function HomeScreen({ onNavigate }: Pick<NavProps, "onNavigate">) {
  const setupSteps = [
    { label: "Create program", detail: "Define the reusable reconciliation workspace", icon: ClipboardCheck, active: true },
    { label: "Add sources", detail: "POS, Pine, Bank, PG, and partners", icon: Database, active: false },
    { label: "Map fields", detail: "Standardize columns into RAAS fields", icon: GitBranch, active: false },
    { label: "Run reconciliation", detail: "Generate matches and exceptions", icon: RefreshCw, active: false },
  ];

  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      <div className="space-y-6">
        <Panel className="p-7">
          <SectionHeader
            eyebrow="RAAS onboarding"
            title="Start with one reconciliation program."
            description="RAAS helps merchants compare financial transactions across POS, Pine reports, bank settlements, payment gateways, delivery partners, and marketplace reports."
            action={
              <Button onClick={() => onNavigate("create")} icon={<ArrowRight className="h-4 w-4" />}>
                Create reconciliation program
              </Button>
            }
          />

          <div className="mt-8 grid grid-cols-4 gap-4">
            {setupSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className={cn("rounded-lg border p-4", step.active ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-slate-50")}>
                  <Icon className={cn("h-5 w-5", step.active ? "text-teal-700" : "text-slate-500")} />
                  <p className="mt-3 text-sm font-semibold text-slate-950">{step.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">Setup progress preview</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Required setup</p>
              <p className="mt-2 text-2xl font-semibold">0 / 6</p>
              <ProgressBar value={4} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Suggested sources</p>
              <p className="mt-2 text-2xl font-semibold">POS + Pine + Bank</p>
              <p className="mt-2 text-sm text-slate-500">Best for card settlement reconciliation.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Expected outcome</p>
              <p className="mt-2 text-2xl font-semibold">94%+</p>
              <p className="mt-2 text-sm text-slate-500">Typical match rate after mappings are approved.</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="p-6">
        <div className="flex items-center gap-3">
          <FileCheck2 className="h-5 w-5 text-teal-700" />
          <h2 className="text-lg font-semibold text-slate-950">Recent runs</h2>
        </div>
        <div className="mt-8">
          <EmptyState
            icon={<FileSpreadsheet className="h-5 w-5" />}
            title="No reconciliation runs yet"
            description="Create a program and run your first reconciliation to see match results here."
          />
        </div>
      </Panel>
    </div>
  );
}

export function CreateProgramScreen({
  programName,
  setProgramName,
  description,
  setDescription,
  reconciliationType,
  setReconciliationType,
  businessUnit,
  setBusinessUnit,
  onNavigate,
}: ProgramStateProps & Pick<NavProps, "onNavigate">) {
  const typeOptions: Array<{ label: ReconciliationType; detail: string }> = [
    { label: "2-way", detail: "Compare two systems such as POS and Bank." },
    { label: "3-way", detail: "Compare POS, Pine or PG, and Bank settlement." },
    { label: "N-way", detail: "Compare multiple partners, marketplaces, and banks." },
  ];

  return (
    <div className="grid grid-cols-[1fr_340px] gap-6">
      <Panel className="p-6">
        <div className="grid gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Program name</span>
            <input
              value={programName}
              onChange={(event) => setProgramName(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              placeholder="Apparel stores daily card settlement"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-3 text-sm leading-6 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              placeholder="Reconcile POS transactions against Pine reports and bank settlements."
            />
          </label>

          <div>
            <span className="text-sm font-semibold text-slate-800">Reconciliation type</span>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setReconciliationType(option.label)}
                  className={cn(
                    "min-h-32 rounded-lg border p-4 text-left transition",
                    reconciliationType === option.label ? "border-teal-700 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <p className="text-base font-semibold text-slate-950">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{option.detail}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Business unit / store optional</span>
            <input
              value={businessUnit}
              onChange={(event) => setBusinessUnit(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              placeholder="Nava Apparel - South stores"
            />
          </label>

          <div className="flex justify-end">
            <Button onClick={() => onNavigate("sources")} icon={<ArrowRight className="h-4 w-4" />}>
              Continue
            </Button>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="text-sm font-semibold text-slate-950">Program summary</p>
        <div className="mt-5 space-y-4 text-sm">
          <div>
            <p className="text-slate-500">Name</p>
            <p className="mt-1 font-semibold text-slate-950">{programName || "Untitled program"}</p>
          </div>
          <div>
            <p className="text-slate-500">Type</p>
            <Chip tone="teal">{reconciliationType}</Chip>
          </div>
          <div>
            <p className="text-slate-500">Business unit</p>
            <p className="mt-1 font-semibold text-slate-950">{businessUnit || "All stores"}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function DataSourcesScreen({
  selectedSources,
  setSelectedSources,
  onNavigate,
  showToast,
}: {
  selectedSources: DataSourceId[];
  setSelectedSources: (value: DataSourceId[]) => void;
} & NavProps) {
  function toggleSource(sourceId: DataSourceId) {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter((id) => id !== sourceId));
      showToast("Data source removed", "The source was removed from this program.", "info");
      return;
    }

    setSelectedSources([...selectedSources, sourceId]);
    showToast("Data source added", "RAAS will request a sample file for this source.", "success");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Add the sources RAAS should reconcile."
        description="Choose file families for POS, Pine, Bank, PG, delivery partners, and marketplaces. Selected sources appear as editable cards."
      />

      <div className="grid grid-cols-3 gap-4">
        {dataSources.map((source) => {
          const Icon = source.icon;
          const selected = selectedSources.includes(source.id);
          return (
            <Panel key={source.id} className={cn("p-5 transition", selected ? "border-teal-300 bg-teal-50/60" : "hover:border-slate-300")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-teal-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{source.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{source.owner} - {source.cadence}</p>
                  </div>
                </div>
                <Chip tone={selected ? "green" : "slate"}>{selected ? "Selected" : "Available"}</Chip>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{source.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {source.fields.slice(0, 4).map((field) => (
                  <Chip key={field}>{field}</Chip>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant={selected ? "secondary" : "primary"} onClick={() => toggleSource(source.id)} icon={selected ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}>
                  {selected ? "Remove" : "Add source"}
                </Button>
                {selected ? (
                  <Button variant="ghost" onClick={() => showToast("Edit source", `${source.name} settings opened in preview mode.`, "info")} icon={<Edit3 className="h-4 w-4" />}>
                    Edit
                  </Button>
                ) : null}
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => onNavigate("create")} icon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button onClick={() => onNavigate("upload")} icon={<ArrowRight className="h-4 w-4" />} disabled={selectedSources.length < 2}>
          Continue
        </Button>
      </div>
    </div>
  );
}

export function UploadSamplesScreen({ selectedSources, onNavigate }: { selectedSources: DataSourceId[] } & Pick<NavProps, "onNavigate">) {
  const selectedUploads = uploadSamples.filter((sample) => selectedSources.includes(sample.sourceId));

  return (
    <div className="space-y-6">
      <Banner tone="warning" title="Sample validation found issues">
        Bank sample is missing one expected column and the Razorpay sample is not a valid CSV or XLSX. You can continue in this prototype to review how RAAS surfaces warnings.
      </Banner>

      <div className="grid grid-cols-2 gap-4">
        {selectedUploads.map((sample) => {
          const source = dataSources.find((item) => item.id === sample.sourceId)!;
          const Icon = source.icon;
          const barTone = sample.status === "error" ? "rose" : sample.status === "warning" ? "amber" : "teal";

          return (
            <Panel key={sample.sourceId} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-slate-50 text-teal-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{source.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{sample.fileName}</p>
                  </div>
                </div>
                <UploadChip status={sample.status} />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                  <span>Upload progress</span>
                  <span>{sample.progress}%</span>
                </div>
                <ProgressBar value={sample.progress} tone={barTone} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Rows</p>
                  <p className="mt-1 font-semibold">{sample.rows.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Columns</p>
                  <p className="mt-1 font-semibold">{sample.columns}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">State</p>
                  <p className="mt-1 font-semibold capitalize">{sample.status}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">{sample.message}</p>
              <Button variant="secondary" className="mt-5" icon={<UploadCloud className="h-4 w-4" />}>
                Replace sample
              </Button>
            </Panel>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => onNavigate("sources")} icon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button onClick={() => onNavigate("preview")} icon={<ArrowRight className="h-4 w-4" />}>
          Continue to preview
        </Button>
      </div>
    </div>
  );
}

export function DataPreviewScreen({ onNavigate }: Pick<NavProps, "onNavigate">) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Panel className="p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Rows scanned</p>
          <p className="mt-2 text-2xl font-semibold">26,818</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Columns detected</p>
          <p className="mt-2 text-2xl font-semibold">48</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Invalid rows</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">31</p>
        </Panel>
      </div>

      <Panel>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Uploaded data preview</h2>
          <Chip tone="amber">Warnings highlighted</Chip>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["Transaction ID", "Source", "RRN", "UTR", "Amount", "Date", "Settlement status", "Warning"].map((heading) => (
                  <th key={heading} className="border-b border-slate-200 px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr key={`${row.transactionId}-${row.source}`} className={row.warning ? "bg-amber-50/60" : "bg-white"}>
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold text-slate-950">{row.transactionId}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.source}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.rrn}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.utr}</td>
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold">{row.amount}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.date}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.settlementStatus}</td>
                  <td className="border-b border-slate-100 px-4 py-4 text-amber-800">{row.warning ?? "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => onNavigate("upload")} icon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button onClick={() => onNavigate("mapping")} icon={<ArrowRight className="h-4 w-4" />}>
          Continue to mapping
        </Button>
      </div>
    </div>
  );
}

export function CanonicalMappingScreen({ onNavigate }: Pick<NavProps, "onNavigate">) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[1fr_280px] gap-6">
        <Banner tone="info" title="Canonical Mapping">
          Tell RAAS what each column means. Standard fields let RAAS compare POS, Pine, bank, gateway, and partner rows consistently.
        </Banner>
        <Panel className="p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Required progress</p>
          <p className="mt-2 text-2xl font-semibold">8 of 10</p>
          <p className="mt-1 text-sm text-slate-500">required fields mapped</p>
          <div className="mt-4">
            <ProgressBar value={80} />
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["Source column", "Sample value", "Canonical field", "Required", "Mapping confidence"].map((heading) => (
                  <th key={heading} className="border-b border-slate-200 px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mappingRows.map((row) => (
                <tr key={row.sourceColumn} className="bg-white">
                  <td className="border-b border-slate-100 px-4 py-4 font-mono text-xs text-slate-800">{row.sourceColumn}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.sampleValue}</td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" defaultValue={row.canonicalField}>
                      {canonicalFieldOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <Chip tone={row.required ? "rose" : "slate"}>{row.required ? "Required" : "Optional"}</Chip>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <Chip tone={row.confidence === "High" ? "green" : row.confidence === "Medium" ? "amber" : "rose"}>{row.confidence}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => onNavigate("preview")} icon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button onClick={() => onNavigate("rules")} icon={<ArrowRight className="h-4 w-4" />}>
          Continue to rules
        </Button>
      </div>
    </div>
  );
}

const matchingKeyOptions = [
  {
    label: "Transaction ID",
    description: "Unique payment reference generated for each transaction.",
    availableIn: ["Billing", "Pine", "Bank"],
  },
  {
    label: "Amount",
    description: "Transaction value recorded in the report.",
    availableIn: ["Billing", "Pine", "Bank"],
  },
  {
    label: "Transaction Date",
    description: "Date when the payment or settlement was recorded.",
    availableIn: ["Billing", "Pine", "Bank"],
  },
  {
    label: "RRN",
    description: "Retrieval reference number used to trace card payment records.",
    availableIn: ["Pine", "Bank"],
  },
  {
    label: "UTR",
    description: "Bank transfer reference used to identify settlement credits.",
    availableIn: ["Bank"],
  },
  {
    label: "Invoice Number",
    description: "Bill reference generated by the billing system.",
    availableIn: ["Billing"],
  },
  {
    label: "Order ID",
    description: "Order reference used to connect the bill with marketplace or delivery rows.",
    availableIn: ["Billing"],
  },
  {
    label: "Store ID",
    description: "Store identifier used to separate transactions by outlet.",
    availableIn: ["Billing", "Pine"],
  },
  {
    label: "Terminal ID",
    description: "Payment terminal identifier used for Pine device-level matching.",
    availableIn: ["Pine"],
  },
  {
    label: "Merchant ID",
    description: "Merchant account identifier used by the payment processor or bank.",
    availableIn: ["Pine", "Bank"],
  },
  {
    label: "Payment Mode",
    description: "Payment method such as card, UPI, cash, or wallet.",
    availableIn: ["Billing", "Pine", "Bank"],
  },
];

function AvailabilityList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Chip key={item} tone="green">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          {item}
        </Chip>
      ))}
    </div>
  );
}

export function MatchRulesScreen({ onNavigate }: NavProps) {
  const [editingStrategy, setEditingStrategy] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(["Transaction ID", "Amount", "Transaction Date"]);
  const [keyToAdd, setKeyToAdd] = useState("RRN");
  const [amountDifference, setAmountDifference] = useState("1");
  const [dateDifference, setDateDifference] = useState("1");
  const [allowPartialMatches, setAllowPartialMatches] = useState(false);
  const [ignoreBlankValues, setIgnoreBlankValues] = useState(false);
  const [advancedRows, setAdvancedRows] = useState([{ id: 1, joiner: "AND" }]);

  const availableToAdd = matchingKeyOptions.filter((key) => !selectedKeys.includes(key.label));
  const nextAddValue = availableToAdd[0]?.label ?? "";

  function addMatchingKey() {
    if (!keyToAdd || selectedKeys.includes(keyToAdd)) {
      return;
    }

    setSelectedKeys((current) => [...current, keyToAdd]);
    setKeyToAdd(availableToAdd.find((key) => key.label !== keyToAdd)?.label ?? "");
  }

  function removeMatchingKey(label: string) {
    setSelectedKeys((current) => current.filter((key) => key !== label));
    if (!keyToAdd) {
      setKeyToAdd(label);
    }
  }

  function moveMatchingKey(index: number, direction: -1 | 1) {
    setSelectedKeys((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function addAdvancedRow() {
    setAdvancedRows((current) => [...current, { id: Date.now(), joiner: "AND" }]);
  }

  function removeAdvancedRow(id: number) {
    setAdvancedRows((current) => current.filter((row) => row.id !== id));
  }

  function moveAdvancedRow(index: number, direction: -1 | 1) {
    setAdvancedRows((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Matching Strategy"
        description="We've analyzed your uploaded reports and prepared the best matching strategy for your reconciliation."
      />

      <Panel className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">🤖 AI Recommendation</h2>
            <p className="mt-4 text-xs font-semibold uppercase text-slate-500">Primary Match</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">Transaction ID</p>
          </div>
          <Button variant="secondary" icon={<Edit3 className="h-4 w-4" />} onClick={() => setEditingStrategy((current) => !current)}>
            Edit Strategy
          </Button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Reason</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Found across all uploaded reports and provides the highest matching accuracy.
            </p>
            <p className="mt-4 text-sm text-slate-500">This strategy is recommended based on your uploaded reports.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Availability</p>
            <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
              {["Billing Report", "Pine Payment Report", "Bank Settlement Report"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Matching Keys</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              These fields will be compared before transactions are marked as matched.
            </p>
          </div>
          {editingStrategy ? (
            <div className="flex items-center gap-2">
              <select
                value={keyToAdd || nextAddValue}
                onChange={(event) => setKeyToAdd(event.target.value)}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              >
                {availableToAdd.map((key) => (
                  <option key={key.label} value={key.label}>
                    {key.label}
                  </option>
                ))}
              </select>
              <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={addMatchingKey} disabled={availableToAdd.length === 0}>
                Add key
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {selectedKeys.map((key, index) => (
            <span key={key} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {key}
              {editingStrategy ? (
                <>
                  <button className="text-xs text-slate-500 hover:text-slate-900" onClick={() => moveMatchingKey(index, -1)} disabled={index === 0}>
                    Up
                  </button>
                  <button className="text-xs text-slate-500 hover:text-slate-900" onClick={() => moveMatchingKey(index, 1)} disabled={index === selectedKeys.length - 1}>
                    Down
                  </button>
                  <button className="text-xs text-rose-700 hover:text-rose-900" onClick={() => removeMatchingKey(key)}>
                    Remove
                  </button>
                </>
              ) : null}
            </span>
          ))}
        </div>

        {editingStrategy ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {matchingKeyOptions.map((key) => (
              <div key={key.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{key.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{key.description}</p>
                  </div>
                  <Chip tone={selectedKeys.includes(key.label) ? "green" : "slate"}>
                    {selectedKeys.includes(key.label) ? "Selected" : "Available"}
                  </Chip>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Available in</p>
                <div className="mt-2">
                  <AvailabilityList items={key.availableIn} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel className="p-5">
            <h2 className="text-base font-semibold text-slate-950">Matching Options</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Allow acceptable differences before transactions are marked as unmatched.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Amount Difference</span>
                <div className="mt-2 flex h-10 items-center rounded-md border border-slate-300 bg-white px-3">
                  <span className="mr-2 text-sm text-slate-500">₹</span>
                  <input
                    value={amountDifference}
                    onChange={(event) => setAmountDifference(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Date Difference</span>
                <div className="mt-2 flex h-10 items-center rounded-md border border-slate-300 bg-white px-3">
                  <input
                    value={dateDifference}
                    onChange={(event) => setDateDifference(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <span className="ml-2 text-sm text-slate-500">Days</span>
                </div>
              </label>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={allowPartialMatches}
                  onChange={(event) => setAllowPartialMatches(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
                Allow partial matches
              </label>
              <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={ignoreBlankValues}
                  onChange={(event) => setIgnoreBlankValues(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
                Ignore blank values
              </label>
            </div>
          </Panel>

          <Panel className="p-5">
            <button
              className="flex w-full items-start justify-between gap-4 text-left"
              onClick={() => setAdvancedOpen((current) => !current)}
            >
              <span>
                <span className="block text-base font-semibold text-slate-950">Advanced Matching</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Create a custom matching strategy only when your reports do not share a common transaction identifier.
                </span>
              </span>
              {advancedOpen ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
            </button>

            {advancedOpen ? (
              <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                {advancedRows.map((row, index) => (
                  <div key={row.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_120px_1fr_90px_150px]">
                    <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                      {matchingKeyOptions.map((key) => (
                        <option key={key.label}>{key.label}</option>
                      ))}
                    </select>
                    <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                      <option>Equals</option>
                      <option>Contains</option>
                      <option>Starts with</option>
                    </select>
                    <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                      {matchingKeyOptions.map((key) => (
                        <option key={key.label}>{key.label}</option>
                      ))}
                    </select>
                    <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm" defaultValue={row.joiner}>
                      <option>AND</option>
                      <option>OR</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <button className="text-xs font-semibold text-slate-500 hover:text-slate-900" onClick={() => moveAdvancedRow(index, -1)} disabled={index === 0}>
                        Up
                      </button>
                      <button className="text-xs font-semibold text-slate-500 hover:text-slate-900" onClick={() => moveAdvancedRow(index, 1)} disabled={index === advancedRows.length - 1}>
                        Down
                      </button>
                      <button className="text-xs font-semibold text-rose-700 hover:text-rose-900" onClick={() => removeAdvancedRow(row.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={addAdvancedRow}>
                  Add Matching Key
                </Button>
              </div>
            ) : null}
          </Panel>
        </div>

        <Panel className="p-5">
          <h2 className="text-base font-semibold text-slate-950">Current Matching Strategy</h2>
          <p className="mt-4 text-sm font-semibold text-slate-700">RAAS will mark transactions as matched when:</p>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            {selectedKeys.map((key) => (
              <div key={key} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{key} matches</span>
              </div>
            ))}
            <div className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Amount difference ≤ ₹{amountDifference || "0"}</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Date difference ≤ {dateDifference || "0"} day{dateDifference === "1" ? "" : "s"}</span>
            </div>
            {allowPartialMatches ? (
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Partial matches can be suggested for review</span>
              </div>
            ) : null}
            {ignoreBlankValues ? (
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Blank values will be ignored during comparison</span>
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-sm font-semibold text-slate-700">Why this strategy?</p>
            <div className="mt-3 space-y-3 text-sm text-slate-700">
              {["Common fields found across all uploaded reports", "No conflicting mappings detected", "Highest confidence match"].map((reason) => (
                <div key={reason} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => onNavigate("mapping")} icon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button onClick={() => onNavigate("review")} icon={<ArrowRight className="h-4 w-4" />}>
          Continue to review
        </Button>
      </div>
    </div>
  );
}

export function ReviewScreen({
  programName,
  reconciliationType,
  selectedSources,
  onNavigate,
}: {
  programName: string;
  reconciliationType: ReconciliationType;
  selectedSources: DataSourceId[];
} & Pick<NavProps, "onNavigate">) {
  const selected = dataSources.filter((source) => selectedSources.includes(source.id));

  return (
    <div className="space-y-6">
      <Banner tone="warning" title="Warnings before launch">
        Two required fields still need attention: value_date and fee_amt. Razorpay sample file format should be replaced before production use.
      </Banner>

      <div className="grid grid-cols-3 gap-4">
        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase text-slate-500">Program</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{programName}</p>
          <Chip tone="teal">{reconciliationType}</Chip>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase text-slate-500">Mappings</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">8 / 10 required</p>
          <p className="mt-1 text-sm text-slate-500">2 fields need review</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase text-slate-500">Rules</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">3 active rules</p>
          <p className="mt-1 text-sm text-slate-500">Bank settlement is source of truth</p>
        </Panel>
      </div>

      <Panel>
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Selected sources</h2>
        </div>
        <div className="grid grid-cols-4 gap-4 p-5">
          {selected.map((source) => {
            const Icon = source.icon;
            return (
              <div key={source.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Icon className="h-5 w-5 text-teal-700" />
                <p className="mt-3 text-sm font-semibold text-slate-950">{source.name}</p>
                <p className="mt-1 text-xs text-slate-500">{source.cadence}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => onNavigate("rules")} icon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button onClick={() => onNavigate("ready")} icon={<CheckCircle2 className="h-4 w-4" />}>
          Finish setup
        </Button>
      </div>
    </div>
  );
}

export function ProgramReadyScreen({ onNavigate }: Pick<NavProps, "onNavigate">) {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      <Panel className="p-8">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-slate-950">Program setup complete.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          RAAS has enough source configuration, sample validation, canonical mapping, and match rules to run the first reconciliation for the apparel program.
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={() => onNavigate("newRun")} icon={<RefreshCw className="h-4 w-4" />}>
            Run first reconciliation
          </Button>
          <Button variant="secondary" onClick={() => onNavigate("workspace")}>
            View dashboard
          </Button>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="text-sm font-semibold text-slate-950">Ready checklist</p>
        <div className="mt-5 space-y-4">
          {["4 sources configured", "Sample files validated", "8 required fields mapped", "3 match rules active", "Audit logging enabled"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span>2 launch warnings remain</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
