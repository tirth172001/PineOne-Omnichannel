import { PhoneFrame } from "@/components/embeds/phone-frame";
import meta from "./metadata.json";

export default function PineOneAppFloatingNavBasicPage() {
  return <PhoneFrame src={meta.external.url} title={meta.title} />;
}
