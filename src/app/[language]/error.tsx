"use client";

import { useEffect } from "react";
import { FallbackScreen } from "@/components/layout/fallback-screen";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/routes";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <FallbackScreen
      testId="error-screen"
      title="Algo deu errado"
      description="Ocorreu um erro inesperado ao carregar esta tela. Tente novamente ou volte ao início."
    >
      <Button onClick={reset} data-testid="error-retry">
        Tentar novamente
      </Button>
      <Button asChild variant="outline">
        <Link href={routes.public.home()} data-testid="error-home">
          Ir para o início
        </Link>
      </Button>
    </FallbackScreen>
  );
}
