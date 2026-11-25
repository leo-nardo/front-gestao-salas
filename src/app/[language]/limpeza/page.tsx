import { redirect } from "next/navigation";
import { routes, withLanguage } from "@/routes";

type Props = {
  params: Promise<{ language: string }>;
};

export default async function LimpezaIndexPage({ params }: Props) {
  const { language } = await params;
  redirect(withLanguage(language, routes.home.limpeza()));
}
