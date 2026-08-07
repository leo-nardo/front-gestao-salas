import { getServerTranslation } from "@/services/i18n";
import PageContent from "./page-content";

export async function generateMetadata({
  params,
}: {
  params: { language: string };
}) {
  const { t } = await getServerTranslation(params.language, "common");
  return {
    title: t("title"),
  };
}

export default function Page() {
  return <PageContent />;
}
