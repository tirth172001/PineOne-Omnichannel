import { PhoneFrame } from "@/components/embeds/phone-frame";
import meta from "./metadata.json";

export default function PineOneAppAgentWalletPage() {
  return <PhoneFrame src={meta.external.url} title={meta.title} />;
}
