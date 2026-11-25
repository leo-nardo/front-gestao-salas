import { pageMetadata } from "@/lib/page-metadata";
import PageContent from "./page-content";

export const metadata = pageMetadata("Ambientes");

export default async function AmbientesPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  return <PageContent language={language} />;
}
