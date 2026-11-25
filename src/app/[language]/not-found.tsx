import { FallbackScreen } from "@/components/layout/fallback-screen";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/routes";

export default function NotFound() {
  return (
    <FallbackScreen
      testId="not-found"
      code="404"
      title="Página não encontrada"
      description="O endereço que você tentou acessar não existe ou foi movido."
    >
      <Button asChild>
        <Link href={routes.public.home()} data-testid="not-found-home">
          Ir para o início
        </Link>
      </Button>
    </FallbackScreen>
  );
}
