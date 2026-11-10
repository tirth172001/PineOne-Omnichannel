export const ONLINE_MACROS = ["About business", "Business verification", "KYC", "Review and sign agreement"]

export const ONLINE_STEPS = [
  { id: "pan", label: "PAN verification", macro: 0, group: "pan", title: "Enter your PAN details", description: "We'll use this for KYC verification and auto-fetch your GST details from your PAN.", node: "501:15200" },
  { id: "gst", label: "GST & registered address", macro: 0, group: "gst", title: "Select GST", description: "Select from retrieved GSTINs linked to your business, or enter manually", node: "501:23159" },
  { id: "website", label: "Basic details", macro: 0, group: "website", title: "Enter website details", description: "We need these details due to compliance", node: "552:27894" },
  { id: "documents", label: "Business documents", macro: 0, group: "documents", title: "Upload documents", description: "We need these details due to compliance", node: "551:25380" },
  { id: "bank", label: "Banking details", macro: 1, group: "bank", title: "Provide your bank details", description: "Specify the bank account where you want to receive your settlements", node: "610:9599" },
  { id: "owners", label: "Beneficial owner declaration", macro: 1, group: "owners", title: "Declare business owners", description: "Self-declare the names of all business owners that have more than 10% ownership.", node: "501:15397" },
  { id: "signatory", label: "Authorised Signatory", macro: 2, group: "signatory", title: "Select Authorised Signatory", description: "An authorised signatory is someone authorised by a company to sign contracts and legal documents on behalf of the company.", node: "501:16330" },
  { id: "political-exposure", label: "Authorised Signatory", macro: 2, group: "signatory", title: "Political exposure of Authorised Signatory", description: "An authorised signatory is someone authorised by a company to sign contracts and legal documents on behalf of the company.", node: "501:16372" },
  { id: "identity", label: "Authorised Signatory", macro: 2, group: "signatory", title: "Verify identity of Authorised Signatory", description: "An authorised signatory is someone authorised by a company to sign contracts and legal documents on behalf of the company.", node: "501:16392" },
  { id: "video-kyc", label: "Video KYC", macro: 2, group: "video-kyc", title: "Verify your identity with a short Video KYC.", description: "It only takes a few minutes. Before you begin, make sure you have:", node: "501:15437" },
  { id: "review", label: "Review", macro: 3, group: "review", title: "Review all the details you have filled", description: "", node: "501:16018" },
  { id: "agreement", label: "Sign agreement", macro: 3, group: "agreement", title: "Sign agreement", description: "Finish up by signing the agreement", node: "501:16044" },
]
