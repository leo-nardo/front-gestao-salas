import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routes, withLanguage } from "@/routes";
import { AUTH_TOKEN_KEY } from "@/services/auth/config";
import HomeRedirect from "./home-redirect";

type Props = {
  params: Promise<{ language: string }>;
};

/**
 * Raiz do app: sem sessão vai direto ao login (redirect no servidor, sem
 * piscar tela); com sessão, o cliente resolve a página inicial do perfil.
 */
export default async function Home({ params }: Props) {
  const { language } = await params;
  const hasSession = (await cookies()).has(AUTH_TOKEN_KEY);

  if (!hasSession) {
    redirect(withLanguage(language, routes.auth.login()));
  }

  return <HomeRedirect />;
}
