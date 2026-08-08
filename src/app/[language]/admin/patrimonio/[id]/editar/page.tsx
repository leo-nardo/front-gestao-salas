import PageContent from "./page-content";

type Props = {
  params: Promise<{ language: string; id: string }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  return <PageContent id={params.id} />;
}
