import { getServerTranslation } from "@/services/i18n";
import PageContent from "./page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const { t } = await getServerTranslation(language, "common");
  return {
    title: t("title"),
  };
}

export default function Page() {
  return <PageContent />;
}
