import type { LucideIcon } from "lucide-react";

export type Screen =
  | "home"
  | "create"
  | "sources"
  | "upload"
  | "preview"
  | "mapping"
  | "rules"
  | "review"
  | "ready"
  | "workspace"
  | "newRun"
  | "processing"
  | "results"
  | "exceptions"
  | "audit"
  | "states"
  | "permission"
  | "session";

export type ReconciliationType = "2-way" | "3-way" | "N-way";

export type DataSourceId =
  | "pos"
  | "pine"
  | "bank"
  | "razorpay"
  | "swiggy"
  | "zomato";

export type UploadStatus = "queued" | "uploading" | "validated" | "warning" | "error";

export type ResultStatus =
  | "Exact Match"
  | "Amount Tolerance Match"
  | "Date Tolerance Match"
  | "Duplicate"
  | "Missing in Bank"
  | "Exception";

export type Priority = "High" | "Medium" | "Low";

export interface DataSource {
  id: DataSourceId;
  name: string;
  shortName: string;
  description: string;
  owner: string;
  cadence: string;
  fields: string[];
  icon: LucideIcon;
}

export interface UploadSample {
  sourceId: DataSourceId;
  fileName: string;
  rows: number;
  columns: number;
  progress: number;
  status: UploadStatus;
  message: string;
}

export interface PreviewRow {
  transactionId: string;
  source: string;
  rrn: string;
  utr: string;
  amount: string;
  date: string;
  settlementStatus: string;
  warning?: string;
}

export interface MappingRow {
  sourceColumn: string;
  sampleValue: string;
  canonicalField: string;
  required: boolean;
  confidence: "High" | "Medium" | "Low" | "Unmapped";
}

export interface MatchRule {
  name: string;
  description: string;
  priority: number;
  conditions: string[];
  confidence: string;
}

export interface Kpi {
  label: string;
  value: string;
  detail: string;
  tone: "good" | "warning" | "danger" | "neutral";
}

export interface ReconRun {
  id: string;
  program: string;
  date: string;
  status: string;
  matchRate: string;
  exceptions: number;
  settlementValue: string;
}

export interface ResultRow {
  id: string;
  transactionId: string;
  source: string;
  amount: string;
  date: string;
  status: ResultStatus;
  reason: string;
  rrn: string;
  utr: string;
  merchant: string;
  gateway: string;
}

export interface ExceptionItem {
  id: string;
  transactionId: string;
  reason: string;
  priority: Priority;
  age: string;
  amount: string;
  source: string;
  owner: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  objectChanged: string;
  oldValue: string;
  newValue: string;
}

export interface TimelineItem {
  time: string;
  title: string;
  detail: string;
}
