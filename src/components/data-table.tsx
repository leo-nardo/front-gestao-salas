"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Columns3 from "lucide-react/dist/esm/icons/columns-3";
import Search from "lucide-react/dist/esm/icons/search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Identificador estável da coluna. Por padrão usa o `header`. */
  id?: string;
  /** Se informado, a coluna passa a poder ser ordenada por este valor. */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Se `false`, a coluna não aparece no menu de colunas. Padrão: `true`. */
  hideable?: boolean;
  /** Se `true`, a coluna começa oculta (precisa ser `hideable`). */
  defaultHidden?: boolean;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  getRowKey: (row: T) => string;
  /** Text to match against when the user types in the search box. */
  searchValue?: (row: T) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  /** Mostra o menu "Colunas" para ocultar/exibir colunas. */
  enableColumnToggle?: boolean;
  /** Adiciona uma coluna de checkboxes para selecionar linhas. */
  selectable?: boolean;
  /** Chamado com as linhas selecionadas (apenas as que estão nos dados atuais). */
  onSelectionChange?: (rows: T[]) => void;
  emptyState: {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
  };
};

const SELECT_COLUMN_ID = "__select";

function compareValues(a: unknown, b: unknown): number {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Generic list table: client-side search, optional sorting, column
 * visibility and row selection, pagination, skeleton while loading and a
 * consistent empty state. Built for the volumes this app actually has
 * (dozens to a few hundred rows) — no virtualization needed.
 *
 * Row spacing follows the global density preference (`--density-row-y`).
 */
export function DataTable<T>({
  columns,
  data,
  isLoading,
  getRowKey,
  searchValue,
  searchPlaceholder = "Buscar...",
  pageSize = 20,
  enableColumnToggle = false,
  selectable = false,
  onSelectionChange,
  emptyState,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () =>
      Object.fromEntries(
        columns
          .filter((col) => col.defaultHidden && col.hideable !== false)
          .map((col) => [col.id ?? col.header, false])
      )
  );

  const filtered = useMemo(() => {
    if (!searchValue || !search.trim()) return data;
    const needle = search.trim().toLowerCase();
    return data.filter((row) =>
      searchValue(row).toLowerCase().includes(needle)
    );
  }, [data, search, searchValue]);

  const columnMeta = useMemo(
    () =>
      new Map(
        columns.map((col) => [
          col.id ?? col.header,
          { className: col.className, hideable: col.hideable !== false },
        ])
      ),
    [columns]
  );

  const columnDefs = useMemo(() => {
    const defs: ColumnDef<T>[] = [];

    if (selectable) {
      defs.push({
        id: SELECT_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Selecionar todas as linhas da página"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(value === true)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Selecionar linha"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
          />
        ),
      });
    }

    for (const col of columns) {
      const id = col.id ?? col.header;
      const sortValue = col.sortValue;
      defs.push({
        id,
        header: col.header,
        enableHiding: col.hideable !== false,
        enableSorting: !!sortValue,
        accessorFn: sortValue ? (row) => sortValue(row) : undefined,
        sortingFn: (a, b, columnId) =>
          compareValues(a.getValue(columnId), b.getValue(columnId)),
        cell: ({ row }) => col.cell(row.original),
      });
    }

    return defs;
  }, [columns, selectable]);

  // O projeto não usa o React Compiler, então o aviso de memoização é só ruído.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns: columnDefs,
    getRowId: (row) => getRowKey(row),
    state: { sorting, columnVisibility, rowSelection, pagination },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    enableRowSelection: selectable,
    // A página só volta ao início quando a busca muda (ver abaixo), não a
    // cada nova referência de `data` vinda do componente pai.
    autoResetPageIndex: false,
    // Primeiro clique sempre em ordem crescente (o padrão do TanStack é
    // decrescente para colunas numéricas).
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageCount = table.getPageCount();
  const pageIndex = pagination.pageIndex;

  // Se os dados diminuírem (ex.: exclusão), não deixa a página fora do limite.
  useEffect(() => {
    const last = Math.max(0, pageCount - 1);
    if (pageIndex > last) table.setPageIndex(last);
  }, [pageCount, pageIndex, table]);

  // `filtered`, `searchValue` e `getRowKey` costumam ganhar nova referência a
  // cada render do pai. Por isso o aviso de seleção depende de uma chave
  // textual (comparada por valor) e lê as linhas por ref: assim só dispara
  // quando a seleção realmente muda, sem entrar em laço com o setState do pai.
  const selectedRows = selectable
    ? filtered.filter((row) => rowSelection[getRowKey(row)])
    : [];
  const selectedKeys = selectedRows.map(getRowKey).join("\u0001");
  const latestSelection = useRef({ selectedRows, onSelectionChange });
  useEffect(() => {
    latestSelection.current = { selectedRows, onSelectionChange };
  });
  useEffect(() => {
    latestSelection.current.onSelectionChange?.(
      latestSelection.current.selectedRows
    );
  }, [selectedKeys]);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/30">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          {emptyState.icon}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-1">
          {emptyState.title}
        </h3>
        {emptyState.description && (
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {emptyState.description}
          </p>
        )}
        {emptyState.action}
      </div>
    );
  }

  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());
  const showToolbar =
    !!searchValue || (enableColumnToggle && hideableColumns.length > 0);
  const selectedCount = Object.keys(rowSelection).length;
  const showFooter = pageCount > 1 || (selectable && selectedCount > 0);
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-3">
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {searchValue ? (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  table.setPageIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : (
            <span />
          )}

          {enableColumnToggle && hideableColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="size-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideableColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(value === true)
                    }
                    onSelect={(event) => event.preventDefault()}
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const className = columnMeta.get(header.column.id)?.className;
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className={cn("font-semibold text-foreground", className)}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 text-muted-foreground" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={Math.max(1, visibleColumnCount)}
                  className="text-center text-muted-foreground py-10"
                >
                  Nenhum resultado para &ldquo;{search}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-[var(--density-row-y)]",
                        columnMeta.get(cell.column.id)?.className
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showFooter && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {selectable && selectedCount > 0 && (
              <>
                {selectedCount} selecionado{selectedCount === 1 ? "" : "s"}{" "}
                ·{" "}
              </>
            )}
            Página {Math.min(pageIndex + 1, Math.max(1, pageCount))} de{" "}
            {Math.max(1, pageCount)} · {filtered.length} registro
            {filtered.length === 1 ? "" : "s"}
          </span>
          {pageCount > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                Próxima
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
