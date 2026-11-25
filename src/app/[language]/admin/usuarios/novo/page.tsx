import { pageMetadata } from "@/lib/page-metadata";
import PageContent from "./page-content";

export const metadata = pageMetadata("Novo usuário");

export default function Page() {
  return <PageContent />;
}
