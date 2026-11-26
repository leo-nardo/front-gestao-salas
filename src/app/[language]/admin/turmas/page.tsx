import { pageMetadata } from "@/lib/page-metadata";
import PageContent from "./page-content";

export const metadata = pageMetadata("Turmas");

export default function Page() {
  return <PageContent />;
}
