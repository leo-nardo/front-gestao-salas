import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Larguras máximas do conteúdo das telas. Centraliza o que antes era um
 * `max-w-[...]` solto em cada página, para que todas as listas se comportem
 * do mesmo jeito.
 */
const SIZES = {
  /**
   * Listas e tabelas: ocupam toda a largura disponível ao lado da barra
   * lateral e só param de crescer em telas muito grandes.
   */
  list: "max-w-[1600px]",
  /** Formulários e telas de leitura curta. */
  form: "max-w-[720px]",
} as const;

type PageContainerProps = {
  size?: keyof typeof SIZES;
  /**
   * Aplica o respiro padrão (`p-6`). Use `false` em áreas cujo layout já
   * adiciona padding à área principal.
   */
  padded?: boolean;
  className?: string;
  children: ReactNode;
};

/** Contêiner de conteúdo das telas autenticadas. */
export function PageContainer({
  size = "list",
  padded = true,
  className,
  children,
}: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full", padded && "p-6", SIZES[size], className)}
    >
      {children}
    </div>
  );
}
