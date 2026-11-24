export const newMerchantRequestTypes = ['Partnership enquiry', 'Onboarding or KYC', 'Integration', 'Payment mode or product enablement', 'Commercials', 'Other'] as const;
export type NewMerchantRequestType = typeof newMerchantRequestTypes[number];
export type NewMerchantRequest = { type: NewMerchantRequestType; contactName: string; businessName: string; email: string; phone: string; description: string; attachment?: File };
export const newMerchantDestinations: Record<NewMerchantRequestType, string> = {
  'Partnership enquiry': 'Business team', Commercials: 'Business team',
  'Payment mode or product enablement': 'Business team', Other: 'Business team',
  'Onboarding or KYC': 'Onboarding Ops', Integration: 'Integration support',
};
export type NewMerchantReceipt = { request: NewMerchantRequest; destination: string; reference?: string; delivery: 'session' | 'service' };
export type NewMerchantSubmissionAdapter = (request: NewMerchantRequest) => Promise<NewMerchantReceipt>;
export function validateSupportImage(file: Pick<File, 'name'|'type'|'size'>): void {
  if (!['image/png','image/jpeg'].includes(file.type) || !/\.(png|jpe?g)$/i.test(file.name)) throw new Error('Choose a PNG or JPEG image.');
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) throw new Error('Choose an image larger than 0 bytes and up to 5 MB.');
}
export function validateNewMerchantRequest(request: NewMerchantRequest): void {
  if (request.attachment) validateSupportImage(request.attachment);
  if (!newMerchantRequestTypes.includes(request.type)) throw new Error('Choose a valid request type.');
  if ([request.contactName, request.businessName].some(v => !v.trim())) throw new Error('Complete all required fields.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) throw new Error('Enter a valid work email.');
  if (!/^\+?[\d\s().-]+$/.test(request.phone) || request.phone.replace(/\D/g, '').length < 7 || request.phone.replace(/\D/g, '').length > 15) throw new Error('Enter a valid phone number with 7 to 15 digits.');
}
// Replace this adapter with the lead/ticket service when its contract is available.
// It accepts a request for the current session only: no storage, transmission,
// external ticket reference, or promise that a team has received it.
export const submitNewMerchantRequest: NewMerchantSubmissionAdapter = async request => {
  validateNewMerchantRequest(request);
  return { request: {...request}, destination: newMerchantDestinations[request.type], delivery: 'session' };
};
