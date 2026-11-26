import { pageMetadata } from "@/lib/page-metadata";
import PageContent from "./page-content";

export const metadata = pageMetadata("Agenda");

export default function Page() {
  return <PageContent />;
}
