import { validateSupportImage } from './newMerchantRequests';
export const existingMerchantIssues = ['Transaction failure or confirmation', 'Success-rate issue', 'Refund', 'Settlement', 'Reports', 'Account/dashboard', 'Other'] as const;
export type MerchantIssue = typeof existingMerchantIssues[number];
export type MerchantSupportRequest = { issue: MerchantIssue; details: Record<string,string>; attachment?: File };
export type MerchantSupportReceipt = { request: MerchantSupportRequest; destination: 'PG Support'; delivery: 'session' | 'service'; reference?: string };
// Replace with dashboard authentication when a verified provider is connected.
// This iteration explicitly assumes successful sign-in; no credentials are collected.
export async function continueMerchantSignIn(): Promise<void> { return; }
export function validateMerchantSupportRequest(request: MerchantSupportRequest) {
  if(request.attachment) validateSupportImage(request.attachment);
  if(!existingMerchantIssues.includes(request.issue)) throw new Error('Choose an issue category.');
  const required = ['description', ...(({
    'Transaction failure or confirmation':['payment'], Refund:['payment'],
    'Success-rate issue':['mode','period'], Reports:['report','from','to'],
  } as Record<string,string[]>)[request.issue] || [])];
  for(const key of required) if(!request.details[key]?.trim()) throw new Error('Complete the required details before continuing.');
  if(request.issue==='Reports') {
    const {from,to}=request.details;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||!Number.isFinite(Date.parse(from))||!Number.isFinite(Date.parse(to))||from>to) throw new Error('Choose a valid date range with the end date on or after the start date.');
  }
}
// Accepts a request in the current session only. Connect the ticket service here
// to deliver to PG Support and return its real reference. No external ID is generated.
export async function submitMerchantSupportRequest(request: MerchantSupportRequest): Promise<MerchantSupportReceipt> {
  validateMerchantSupportRequest(request);
  return {request:{issue:request.issue,details:{...request.details},...(request.attachment?{attachment:request.attachment}:{})},destination:'PG Support',delivery:'session'};
}
