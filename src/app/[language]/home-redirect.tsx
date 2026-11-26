"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FallbackScreen } from "@/components/layout/fallback-screen";
import { Button } from "@/components/ui/button";
import { getRoleHome, routes, withLanguage } from "@/routes";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useLanguage from "@/services/i18n/use-language";

/**
 * Decide para onde a raiz do app leva: login (sem sessão) ou a página inicial
 * do perfil. Perfis sem área própria veem uma tela explicando e podem sair.
 */
export default function HomeRedirect() {
  const { user, isLoaded } = useAuth();
  const { logOut } = useAuthActions();
  const router = useRouter();
  const language = useLanguage();

  const roleHome = user ? getRoleHome(Number(user.role?.id)) : null;
  const target =
    roleHome && roleHome !== routes.public.home() ? roleHome : null;

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace(withLanguage(language, routes.auth.login()));
    } else if (target) {
      router.replace(withLanguage(language, target));
    }
  }, [isLoaded, user, target, router, language]);

  if (isLoaded && user && !target) {
    return (
      <FallbackScreen
        testId="no-area"
        title="Seu perfil ainda não tem uma área"
        description="Sua conta está ativa, mas nenhuma área do sistema foi liberada para o seu perfil. Fale com a administração."
      >
        <Button onClick={() => logOut()} data-testid="no-area-logout">
          Sair
        </Button>
      </FallbackScreen>
    );
  }

  return (
    <div className="h-1 w-full overflow-hidden bg-primary/20">
      <div className="animate-progress-bar h-full w-full origin-left bg-primary" />
    </div>
  );
}
