import { pageMetadata } from "@/lib/page-metadata";
import PageContent from "./page-content";

type Props = {
  params: Promise<{ language: string; id: string }>;
};

export const metadata = pageMetadata("Editar Disciplina");

export default async function Page(props: Props) {
  const params = await props.params;
  return <PageContent id={params.id} />;
}
