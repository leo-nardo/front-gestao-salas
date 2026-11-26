"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { cn } from "@/lib/utils";

type EditDrawerProps<T> = {
  /** Id do registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
  title: string;
  description?: string;
  /** Chave da query de detalhe, ex.: `(id) => ["cursos", id]`. */
  queryKey: (id: string) => readonly unknown[];
  /** Busca o registro (normalmente o `useGetXService`). */
  load: (id: string) => Promise<{ status: number; data?: unknown }>;
  /** Largura do drawer. */
  className?: string;
  /** Recebe o registro carregado e uma função para fechar o drawer. */
  children: (entity: T, helpers: { close: () => void }) => ReactNode;
};

/**
 * Edição em um drawer à direita: a rota não muda e a lista continua visível
 * atrás. Cuida de abrir/fechar, de carregar o registro e dos estados de
 * carregamento e de erro; o formulário em si vem do `children`.
 */
export function EditDrawer<T>({
  id,
  onClose,
  title,
  description = "Os campos com asterisco (*) são obrigatórios.",
  queryKey,
  load,
  className,
  children,
}: EditDrawerProps<T>) {
  // Mantém o último registro montado enquanto o drawer desliza para fora;
  // sem isso o corpo some antes de a animação de saída terminar.
  const [contentId, setContentId] = useState(id);
  if (id && id !== contentId) setContentId(id);

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className={cn("w-full gap-0 sm:max-w-lg", className)}>
        <SheetHeader className="border-b">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        {contentId && (
          <EditDrawerBody<T>
            key={contentId}
            id={contentId}
            queryKey={queryKey}
            load={load}
            onClose={onClose}
          >
            {children}
          </EditDrawerBody>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EditDrawerBody<T>({
  id,
  queryKey,
  load,
  onClose,
  children,
}: Pick<EditDrawerProps<T>, "queryKey" | "load" | "onClose" | "children"> & {
  id: string;
}) {
  const { data: res, isLoading } = useQuery({
    queryKey: queryKey(id),
    queryFn: () => load(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-5 p-4 pt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (res?.status !== HTTP_CODES_ENUM.OK || !res.data) {
    return (
      <div className="flex flex-col items-start gap-4 p-4 pt-6">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar este registro. Ele pode ter sido removido.
        </p>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {children(res.data as T, { close: onClose })}
    </div>
  );
}
