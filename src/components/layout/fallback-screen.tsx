import type { ReactNode } from "react";

type FallbackScreenProps = {
  /** Código curto exibido em destaque (ex.: "404"). */
  code?: string;
  title: string;
  description: string;
  children?: ReactNode;
  testId?: string;
};

/** Tela cheia usada nos estados de erro, não encontrado e sem acesso. */
export function FallbackScreen({
  code,
  title,
  description,
  children,
  testId,
}: FallbackScreenProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-4"
      data-testid={testId}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        {code && (
          <span className="font-mono text-sm font-medium text-muted-foreground">
            {code}
          </span>
        )}
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {children && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {children}
          </div>
        )}
      </div>
    </main>
  );
}
