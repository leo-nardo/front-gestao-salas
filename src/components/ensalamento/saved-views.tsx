"use client";

import { useEffect, useState } from "react";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroupBy } from "./mapa-view";
import { Turno } from "./types";

export type SavedViewFilters = {
  unidadeFilter: string;
  cursoFilter: string;
  professorFilter: string;
  groupBy: GroupBy;
  periodo: "Todos" | Turno;
  blocosSel: string[];
  andaresSel: string[];
  tipoSel: string[];
  searchText: string;
};

export type SavedView = {
  id: string;
  name: string;
  role: "auxiliar" | "limpeza" | "tecnico" | "coordenacao";
  filters: SavedViewFilters;
};

const STORAGE_KEY = "ambienta:ensalamento:savedViews:v2";

export function useSavedViews() {
  const [views, setViews] = useState<SavedView[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setViews(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persist = (next: SavedView[]) => {
    setViews(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const save = (
    name: string,
    role: SavedView["role"],
    filters: SavedViewFilters
  ) => {
    const view: SavedView = { id: crypto.randomUUID(), name, role, filters };
    persist([...views, view]);
  };

  const remove = (id: string) => {
    persist(views.filter((v) => v.id !== id));
  };

  return { views, save, remove };
}

const ROLE_LABEL: Record<
  SavedView["role"],
  { label: string; fg: string; bg: string }
> = {
  coordenacao: { label: "Coordenação", fg: "#1a4f8a", bg: "#e7edf8" },
  auxiliar: { label: "Auxiliar de sala", fg: "#8a5a1a", bg: "#f6eede" },
  limpeza: { label: "Limpeza", fg: "#0e6b62", bg: "#e2f0ee" },
  tecnico: { label: "Técnico de lab.", fg: "#a8442f", bg: "#f7e7e2" },
};

function summarize(
  f: SavedViewFilters,
  tipoAmbientes: { id: string; nome: string }[],
  blocos: { id: string; nome: string }[],
  andares: { id: string; nome: string }[]
) {
  const parts: string[] = [];
  if (f.groupBy) parts.push(`Agrupado por ${f.groupBy}`);
  if (f.periodo !== "Todos") parts.push(f.periodo);

  if (f.blocosSel && f.blocosSel.length) {
    const nomes = f.blocosSel.map(
      (id) => blocos.find((b) => b.id === id)?.nome || id
    );
    parts.push(`Bloco ${nomes.join("/")}`);
  }
  if (f.andaresSel && f.andaresSel.length) {
    const nomes = f.andaresSel.map(
      (id) => andares.find((a) => a.id === id)?.nome || id
    );
    parts.push(`Andar ${nomes.join("/")}`);
  }
  if (f.tipoSel && f.tipoSel.length) {
    const nomes = f.tipoSel.map(
      (id) => tipoAmbientes.find((t) => t.id === id)?.nome || id
    );
    parts.push(nomes.join("/"));
  }
  if (f.searchText) parts.push(`Busca: "${f.searchText}"`);

  return parts.length ? parts.join(" · ") : "Sem filtros adicionais";
}

type SavedViewsBarProps = {
  views: SavedView[];
  currentFilters: SavedViewFilters;
  tipoAmbientes: { id: string; nome: string }[];
  blocos: { id: string; nome: string }[];
  andares: { id: string; nome: string }[];
  onApply: (filters: SavedViewFilters) => void;
  onSave: (name: string, role: SavedView["role"]) => void;
  onRemove: (id: string) => void;
};

export function SavedViewsBar({
  views,
  currentFilters,
  tipoAmbientes,
  blocos,
  andares,
  onApply,
  onSave,
  onRemove,
}: SavedViewsBarProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<SavedView["role"]>("auxiliar");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), role);
    setName("");
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-secondary">
      <div className="flex items-center gap-2 shrink-0">
        <Bookmark className="w-4 h-4 text-muted-foreground/70" />
        <div>
          <div className="text-[12.5px] font-bold">Visões salvas</div>
          <div className="text-[11px] text-muted-foreground/70 max-w-[220px]">
            Filtros salvos localmente neste navegador.
          </div>
        </div>
      </div>

      {views.map((v) => {
        const roleMeta = ROLE_LABEL[v.role];
        return (
          <div key={v.id} className="relative group">
            <button
              onClick={() => onApply(v.filters)}
              className="flex flex-col items-start gap-0.5 px-3 py-1.5 border rounded-lg bg-surface-4 hover:border-info/40 hover:bg-info-bg/40 transition-colors min-w-[160px] text-left"
            >
              <span className="text-[12.5px] font-bold">{v.name}</span>
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-1.5 rounded"
                style={{ color: roleMeta.fg, background: roleMeta.bg }}
              >
                {roleMeta.label}
              </span>
              <span className="text-[11px] text-muted-foreground/70">
                {summarize(v.filters, tipoAmbientes, blocos, andares)}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(v.id);
              }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remover visão salva"
            >
              ×
            </button>
          </div>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-info/30 bg-info-bg text-info hover:bg-info-bg/70 font-bold"
          >
            + Salvar visão atual
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px]" align="end">
          <div className="text-[12.5px] font-bold mb-1">
            Salvar visão pessoal
          </div>
          <div className="text-[11px] text-muted-foreground/70 mb-2.5">
            {summarize(currentFilters, tipoAmbientes, blocos, andares)}
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome (ex.: Auxiliar Noite · Bloco C)"
            className="mb-2.5 text-[12.5px]"
          />
          <div className="flex bg-muted rounded-lg p-0.5 mb-3">
            {(
              [
                ["auxiliar", "Auxiliar"],
                ["limpeza", "Limpeza"],
                ["tecnico", "Técnico"],
              ] as [SavedView["role"], string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setRole(v)}
                className={`flex-1 py-1.5 rounded-md text-[11.5px] font-semibold transition-colors ${
                  role === v
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button size="sm" className="flex-[1.3]" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
