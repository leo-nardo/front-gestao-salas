"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import Upload from "lucide-react/dist/esm/icons/upload";
import Inbox from "lucide-react/dist/esm/icons/inbox";
import { AdminHeader } from "@/components/admin-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AmbienteCard } from "@/components/ambiente-card";
import { AmbienteEditDrawer } from "./ambiente-edit-drawer";
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import { useGetTipoAmbientesService } from "@/services/api/services/tipo-ambientes";
import { useGetUnidadesService } from "@/services/api/services/unidades";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PageContent({ language }: { language: string }) {
  const getAmbientes = useGetAmbientesService();
  const getUnidades = useGetUnidadesService();
  const getTipoAmbientes = useGetTipoAmbientesService();

  const [search, setSearch] = useState("");
  const [unidadeFilter, setUnidadeFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: ambientesRes, isLoading: isLoadingAmbientes } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => getAmbientes(),
  });
  const { data: unidadesRes } = useQuery({
    queryKey: ["unidades"],
    queryFn: () => getUnidades(),
  });
  const { data: tiposRes } = useQuery({
    queryKey: ["tipos-ambiente", { limit: 500 }],
    queryFn: () => getTipoAmbientes({ limit: "500" }),
  });

  const ambientes =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];
  const unidades =
    unidadesRes?.status === HTTP_CODES_ENUM.OK ? unidadesRes.data.data : [];
  const tipoAmbientes =
    tiposRes?.status === HTTP_CODES_ENUM.OK ? tiposRes.data.data : [];

  const filteredAmbientes = ambientes.filter((amb) => {
    const matchesSearch = amb.nome.toLowerCase().includes(search.toLowerCase());
    const matchesUnidade =
      unidadeFilter === "all" || amb.unidade?.id === unidadeFilter;
    const matchesTipo =
      tipoFilter === "all" || amb.tipoAmbiente.id === tipoFilter;
    return matchesSearch && matchesUnidade && matchesTipo;
  });

  return (
    <>
      <AdminHeader
        title="Ambientes"
        subtitle="Gerencie as salas e laboratórios da instituição"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sala, laboratório ou bloco…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select value={unidadeFilter} onValueChange={setUnidadeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas as unidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                {unidades.map((un) => (
                  <SelectItem key={un.id} value={un.id}>
                    {un.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {tipoAmbientes.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Link href="/admin/ambientes/novo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo ambiente
              </Button>
            </Link>
          </div>
        </div>

        {isLoadingAmbientes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredAmbientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmbientes.map((ambiente) => (
              <AmbienteCard
                key={ambiente.id}
                ambiente={ambiente}
                language={language}
                onEdit={setEditingId}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/30 mt-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum ambiente encontrado
            </h3>
            <p className="text-muted-foreground max-w-md mb-8">
              Você ainda não tem ambientes cadastrados com esses filtros. Tente
              mudar a busca ou adicione um novo ambiente.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/admin/ambientes/novo">
                <Button>Cadastrar primeiro ambiente</Button>
              </Link>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Importar planilha
              </Button>
            </div>
          </div>
        )}
      </div>

      <AmbienteEditDrawer
        ambienteId={editingId}
        onClose={() => setEditingId(null)}
      />
    </>
  );
}
