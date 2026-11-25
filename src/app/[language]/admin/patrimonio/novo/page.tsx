import { pageMetadata } from "@/lib/page-metadata";
import PageContent from "./page-content";

export const metadata = pageMetadata("Novo Item Patrimonial");

export default function Page() {
  return <PageContent />;
}
