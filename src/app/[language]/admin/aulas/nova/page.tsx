import { pageMetadata } from "@/lib/page-metadata";
import PageContent from "./page-content";

export const metadata = pageMetadata("Nova aula");

export default function NovaAulaPage() {
  return <PageContent />;
}
