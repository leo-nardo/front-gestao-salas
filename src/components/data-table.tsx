"use client";

import { useMemo, useState, type ReactNode } from "react";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
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
  emptyState: {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
  };
};

/**
 * Generic list table: client-side search + pagination, skeleton while
 * loading, consistent empty state. Built for the volumes this app actually
 * has (dezens to a few hundred rows) — no virtualization needed.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading,
  getRowKey,
  searchValue,
  searchPlaceholder = "Buscar...",
  pageSize = 20,
  emptyState,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchValue || !search.trim()) return data;
    const needle = search.trim().toLowerCase();
    return data.filter((row) =>
      searchValue(row).toLowerCase().includes(needle)
    );
  }, [data, search, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  return (
    <div className="space-y-3">
      {searchValue && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.header}
                  className={cn("font-semibold text-foreground", col.className)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-10"
                >
                  Nenhum resultado para &ldquo;{search}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow key={getRowKey(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.header} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {currentPage} de {totalPages} · {filtered.length} registro
            {filtered.length === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
