import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ language: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { language } = await params;
  redirect(`/${language}/admin/ambientes`);
}
