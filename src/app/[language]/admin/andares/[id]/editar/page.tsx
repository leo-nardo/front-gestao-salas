export default async function Page(props: {
  params: Promise<{ id: string; language: string }>;
}) {
  const params = await props.params;
  return <PageContent id={params.id} language={params.language} />;
}

import PageContent from "./page-content";
