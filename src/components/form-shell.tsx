"use client";

import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type FormShellProps<T extends FieldValues> = {
  /**
   * `page`: tela própria, com Card e link de volta para a lista.
   * `drawer`: só os campos e o rodapé, para uso dentro de um `Sheet`
   * (ver `EditDrawer`).
   */
  variant?: "page" | "drawer";
  title: string;
  description?: string;
  form: UseFormReturn<T>;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  /** Destino do "Voltar" e do "Cancelar" na variante `page`. */
  backHref: string;
  backLabel: string;
  /** Cancelar na variante `drawer` (normalmente fecha o drawer). */
  onCancel?: () => void;
  /** Largura máxima da variante `page`, ex.: "max-w-[600px]". */
  width?: string;
  children: ReactNode;
};

/**
 * Esqueleto compartilhado dos formulários de cadastro/edição. Cada formulário
 * informa só os campos; aqui ficam o cabeçalho, o rodapé e o modo (página ou
 * drawer).
 */
export function FormShell<T extends FieldValues>({
  variant = "page",
  title,
  description,
  form,
  onSubmit,
  submitting,
  submitLabel,
  submittingLabel,
  backHref,
  backLabel,
  onCancel,
  width = "max-w-[600px]",
  children,
}: FormShellProps<T>) {
  const submitText = submitting ? submittingLabel : submitLabel;

  if (variant === "drawer") {
    return (
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* O drawer é estreito: grades de 2 colunas viram 1 coluna. */}
          <div className="flex-1 space-y-6 overflow-y-auto px-4 pt-6 pb-4 [&_.grid]:!grid-cols-1">
            {children}
          </div>
          <SheetFooter className="flex-row justify-end gap-3 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitText}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    );
  }

  return (
    <div className={cn("p-6 mx-auto w-full", width)}>
      <Link
        href={backHref}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {backLabel}
      </Link>

      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>

        <Form {...form}>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-6 pt-6">{children}</CardContent>

            <CardFooter className="border-t bg-surface-3 py-6 flex justify-end gap-3 rounded-b-xl">
              <Link href={backHref}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitText}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
