"use client";

import { useEffect, useRef, useState } from "react";
import FilterX from "lucide-react/dist/esm/icons/filter-x";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  MultiCombobox,
  type ComboboxOption,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Valores dos filtros. Chaves sem valor simplesmente não existem no objeto. */
export type FilterValues = Record<string, string | string[]>;

type OptionsProps = {
  options: ComboboxOption[];
  placeholder?: string;
  isLoading?: boolean;
  loadError?: string;
  onRetry?: () => void;
};

type FieldBase = { label: string; className?: string };

export type FilterField =
  | (FieldBase & { type: "text"; key: string; placeholder?: string })
  | (FieldBase & { type: "select"; key: string } & OptionsProps)
  | (FieldBase & { type: "multiselect"; key: string } & OptionsProps)
  | (FieldBase & { type: "date"; key: string })
  /** Período: grava duas chaves (início e fim) no formato AAAA-MM-DD. */
  | (FieldBase & { type: "dateRange"; fromKey: string; toKey: string });

type FilterBarProps = {
  fields: FilterField[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  /** Atraso, em ms, para aplicar o texto digitado. Padrão: 300. */
  textDebounceMs?: number;
  className?: string;
};

function isFilled(value: string | string[] | undefined): boolean {
  return Array.isArray(value) ? value.length > 0 : !!value;
}

function fieldKeys(field: FilterField): string[] {
  return field.type === "dateRange"
    ? [field.fromKey, field.toKey]
    : [field.key];
}

function TextFilter({
  id,
  value,
  placeholder,
  debounceMs,
  onCommit,
}: {
  id: string;
  value: string;
  placeholder?: string;
  debounceMs: number;
  onCommit: (value: string) => void;
}) {
  const [local, setLocal] = useState(value);
  const commitRef = useRef(onCommit);
  useEffect(() => {
    commitRef.current = onCommit;
  });

  // Mudanças externas (ex.: "Limpar filtros") atualizam o campo.
  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const timer = setTimeout(() => commitRef.current(local), debounceMs);
    return () => clearTimeout(timer);
  }, [local, value, debounceMs]);

  return (
    <Input
      id={id}
      value={local}
      placeholder={placeholder}
      onChange={(event) => setLocal(event.target.value)}
    />
  );
}

/**
 * Barra de filtros declarativa para telas de lista. É controlada: o pai guarda
 * `values` (por exemplo, para montar os parâmetros da consulta à API).
 */
export function FilterBar({
  fields,
  values,
  onChange,
  textDebounceMs = 300,
  className,
}: FilterBarProps) {
  const setValue = (key: string, next: string | string[] | null) => {
    const copy = { ...values };
    if (next === null || !isFilled(next)) delete copy[key];
    else copy[key] = next;
    onChange(copy);
  };

  const activeCount = fields.filter((field) =>
    fieldKeys(field).some((key) => isFilled(values[key]))
  ).length;

  const asString = (key: string) => {
    const value = values[key];
    return typeof value === "string" ? value : "";
  };
  const asArray = (key: string) => {
    const value = values[key];
    return Array.isArray(value) ? value : [];
  };

  return (
    <div
      role="search"
      className={cn("flex flex-wrap items-end gap-3", className)}
    >
      {fields.map((field) => {
        const baseId = `filter-${fieldKeys(field).join("-")}`;
        const width = cn(
          "flex w-full flex-col gap-1.5 sm:w-56",
          field.className
        );

        if (field.type === "dateRange") {
          return (
            <div key={baseId} className={cn(width, "sm:w-auto")}>
              <Label>{field.label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  aria-label={`${field.label}: início`}
                  value={asString(field.fromKey)}
                  max={asString(field.toKey) || undefined}
                  onChange={(event) =>
                    setValue(field.fromKey, event.target.value)
                  }
                />
                <span className="text-sm text-muted-foreground">até</span>
                <Input
                  type="date"
                  aria-label={`${field.label}: fim`}
                  value={asString(field.toKey)}
                  min={asString(field.fromKey) || undefined}
                  onChange={(event) =>
                    setValue(field.toKey, event.target.value)
                  }
                />
              </div>
            </div>
          );
        }

        return (
          <div key={baseId} className={width}>
            <Label htmlFor={baseId}>{field.label}</Label>
            {field.type === "text" && (
              <TextFilter
                id={baseId}
                value={asString(field.key)}
                placeholder={field.placeholder}
                debounceMs={textDebounceMs}
                onCommit={(value) => setValue(field.key, value)}
              />
            )}
            {field.type === "date" && (
              <Input
                id={baseId}
                type="date"
                value={asString(field.key)}
                onChange={(event) => setValue(field.key, event.target.value)}
              />
            )}
            {field.type === "select" && (
              <Combobox
                id={baseId}
                clearable
                options={field.options}
                placeholder={field.placeholder ?? "Todos"}
                isLoading={field.isLoading}
                loadError={field.loadError}
                onRetry={field.onRetry}
                value={asString(field.key) || null}
                onChange={(value) => setValue(field.key, value)}
              />
            )}
            {field.type === "multiselect" && (
              <MultiCombobox
                id={baseId}
                clearable
                options={field.options}
                placeholder={field.placeholder ?? "Todos"}
                isLoading={field.isLoading}
                loadError={field.loadError}
                onRetry={field.onRetry}
                value={asArray(field.key)}
                onChange={(value) => setValue(field.key, value)}
              />
            )}
          </div>
        );
      })}

      {activeCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
        >
          <FilterX className="size-4" />
          Limpar filtros ({activeCount})
        </Button>
      )}
    </div>
  );
}
