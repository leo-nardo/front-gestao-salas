"use client";

import { useState, type Ref } from "react";
import Check from "lucide-react/dist/esm/icons/check";
import ChevronsUpDown from "lucide-react/dist/esm/icons/chevrons-up-down";
import CircleAlert from "lucide-react/dist/esm/icons/circle-alert";
import LoaderCircle from "lucide-react/dist/esm/icons/loader-circle";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Termos extras considerados pela busca. */
  keywords?: string[];
};

type ComboboxCommonProps = {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  clearLabel?: string;
  /** Permite limpar a seleção por um item "Limpar seleção" no topo da lista. */
  clearable?: boolean;
  disabled?: boolean;
  /** Exibe o estado de carregamento no lugar das opções. */
  isLoading?: boolean;
  /** Mensagem exibida quando as opções falharam ao carregar. */
  loadError?: string;
  onRetry?: () => void;
  invalid?: boolean;
  id?: string;
  className?: string;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
  "aria-label"?: string;
  "data-testid"?: string;
};

type ComboboxShellProps = ComboboxCommonProps & {
  multiple: boolean;
  selected: Set<string>;
  triggerText: string;
  onPick: (option: ComboboxOption) => void;
  onClear: () => void;
};

function ComboboxShell({
  options,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado.",
  loadingText = "Carregando...",
  clearLabel = "Limpar seleção",
  clearable = false,
  disabled,
  isLoading,
  loadError,
  onRetry,
  invalid,
  id,
  className,
  onBlur,
  ref,
  multiple,
  selected,
  triggerText,
  onPick,
  onClear,
  ...rest
}: ComboboxShellProps) {
  const [open, setOpen] = useState(false);
  const hasValue = selected.size > 0;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          ref={ref}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          aria-label={rest["aria-label"]}
          data-testid={rest["data-testid"]}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !hasValue && "text-muted-foreground",
            invalid && "border-destructive",
            className
          )}
        >
          <span className="truncate">{triggerText || placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-48 p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {isLoading ? (
              <div
                role="status"
                className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
              >
                <LoaderCircle className="size-4 animate-spin" />
                {loadingText}
              </div>
            ) : loadError ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-2 px-3 py-6 text-center text-sm text-destructive"
              >
                <span className="flex items-center gap-2">
                  <CircleAlert className="size-4 shrink-0" />
                  {loadError}
                </span>
                {onRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                  >
                    Tentar novamente
                  </Button>
                )}
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {clearable && hasValue && (
                  <>
                    <CommandGroup>
                      <CommandItem
                        value="__clear__"
                        keywords={[clearLabel]}
                        onSelect={() => {
                          onClear();
                          if (!multiple) setOpen(false);
                        }}
                      >
                        {clearLabel}
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selected.has(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        keywords={[
                          option.label,
                          ...(option.keywords ?? []),
                          ...(option.description ? [option.description] : []),
                        ]}
                        disabled={option.disabled}
                        onSelect={() => {
                          onPick(option);
                          if (!multiple) setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "size-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{option.label}</span>
                          {option.description && (
                            <span className="truncate text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type ComboboxProps = ComboboxCommonProps & {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
};

/** Seleção única com busca. O valor é o `value` da opção (ex.: um id). */
export function Combobox({ value, onChange, ...props }: ComboboxProps) {
  const current = props.options.find((option) => option.value === value);
  return (
    <ComboboxShell
      {...props}
      multiple={false}
      selected={new Set(value ? [value] : [])}
      triggerText={current?.label ?? ""}
      onPick={(option) => onChange(option.value)}
      onClear={() => onChange(null)}
    />
  );
}

export type MultiComboboxProps = ComboboxCommonProps & {
  value: string[];
  onChange: (value: string[]) => void;
  /** Quantos rótulos mostrar no botão antes de resumir em "N selecionados". */
  maxDisplay?: number;
};

/** Seleção múltipla com busca. A lista permanece aberta ao marcar itens. */
export function MultiCombobox({
  value,
  onChange,
  maxDisplay = 2,
  ...props
}: MultiComboboxProps) {
  const labels = value.map(
    (v) => props.options.find((option) => option.value === v)?.label ?? v
  );
  const triggerText =
    labels.length === 0
      ? ""
      : labels.length <= maxDisplay
        ? labels.join(", ")
        : `${labels.length} selecionados`;

  return (
    <ComboboxShell
      {...props}
      multiple
      selected={new Set(value)}
      triggerText={triggerText}
      onPick={(option) =>
        onChange(
          value.includes(option.value)
            ? value.filter((v) => v !== option.value)
            : [...value, option.value]
        )
      }
      onClear={() => onChange([])}
    />
  );
}
