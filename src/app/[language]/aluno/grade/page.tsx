import { pageMetadata } from "@/lib/page-metadata";
import PageContent from "./page-content";

export const metadata = pageMetadata("Minha Grade");

export default function GradePage() {
  return <PageContent />;
}
