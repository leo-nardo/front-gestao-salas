import PageContent from "./page-content";

export default async function NovoAmbientePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  return <PageContent language={language} />;
}
