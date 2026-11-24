import type { ButtonHTMLAttributes, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import type { Kpi, Priority, ResultStatus, UploadStatus } from "../types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-teal-700 text-white hover:bg-teal-800 border-teal-700",
  secondary: "bg-white text-slate-800 hover:bg-slate-50 border-slate-300",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border-transparent",
  danger: "bg-rose-700 text-white hover:bg-rose-800 border-rose-700",
};

export function Button({ variant = "primary", icon, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        buttonStyles[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, children, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>{children}</div>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase text-teal-700">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const uploadTone: Record<UploadStatus, string> = {
  queued: "bg-slate-100 text-slate-700 border-slate-200",
  uploading: "bg-blue-50 text-blue-700 border-blue-200",
  validated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusTone: Record<ResultStatus, string> = {
  "Exact Match": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Amount Tolerance Match": "bg-blue-50 text-blue-700 border-blue-200",
  "Date Tolerance Match": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Duplicate: "bg-amber-50 text-amber-800 border-amber-200",
  "Missing in Bank": "bg-orange-50 text-orange-800 border-orange-200",
  Exception: "bg-rose-50 text-rose-700 border-rose-200",
};

const priorityTone: Record<Priority, string> = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200",
};

export function Chip({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "rose" | "blue" | "teal";
}) {
  const toneClass = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
  }[tone];

  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", toneClass)}>{children}</span>;
}

export function StatusChip({ status }: { status: ResultStatus }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusTone[status])}>{status}</span>;
}

export function UploadChip({ status }: { status: UploadStatus }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize", uploadTone[status])}>{status.replace("_", " ")}</span>;
}

export function PriorityChip({ priority }: { priority: Priority }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", priorityTone[priority])}>{priority}</span>;
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = {
    good: "border-l-emerald-500",
    warning: "border-l-amber-500",
    danger: "border-l-rose-500",
    neutral: "border-l-slate-500",
  }[kpi.tone];

  return (
    <div className={cn("rounded-lg border border-slate-200 border-l-4 bg-white p-4 shadow-sm", tone)}>
      <p className="text-xs font-semibold uppercase text-slate-500">{kpi.label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{kpi.value}</p>
      <p className="mt-1 text-xs text-slate-500">{kpi.detail}</p>
    </div>
  );
}

export function ProgressBar({ value, tone = "teal" }: { value: number; tone?: "teal" | "amber" | "rose" | "blue" }) {
  const color = {
    teal: "bg-teal-700",
    amber: "bg-amber-500",
    rose: "bg-rose-600",
    blue: "bg-blue-600",
  }[tone];

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function Banner({
  tone,
  title,
  children,
}: {
  tone: "info" | "warning" | "error" | "success";
  title: string;
  children: ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    error: "border-rose-200 bg-rose-50 text-rose-950",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  }[tone];
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={cn("flex gap-3 rounded-lg border p-4", styles)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <div className="mt-1 text-sm leading-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-8 py-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500">{icon}</div>
      <p className="mt-4 text-sm font-semibold text-slate-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Toast({
  title,
  message,
  tone,
  onDismiss,
}: {
  title: string;
  message: string;
  tone: "success" | "error" | "info";
  onDismiss: () => void;
}) {
  const styles = tone === "success" ? "border-emerald-200" : tone === "error" ? "border-rose-200" : "border-blue-200";
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Loader2;

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 w-[360px] rounded-lg border bg-white p-4 shadow-lg", styles)}>
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5", tone === "success" ? "text-emerald-600" : tone === "error" ? "text-rose-600" : "text-blue-600")} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">{message}</p>
        </div>
        <IconButton label="Dismiss toast" onClick={onDismiss} className="border-0">
          <X className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}

export function Modal({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/30 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
