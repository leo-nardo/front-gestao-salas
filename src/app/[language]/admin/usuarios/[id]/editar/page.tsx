import PageContent from "./page-content";

export default function Page({
  params,
}: {
  params: { id: string; language: string };
}) {
  return <PageContent id={params.id} />;
}
