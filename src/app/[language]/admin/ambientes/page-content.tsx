"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "@/components/link";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import Upload from "lucide-react/dist/esm/icons/upload";
import Inbox from "lucide-react/dist/esm/icons/inbox";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { AdminHeader } from "@/components/admin-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AmbienteCard } from "@/components/ambiente-card";
import {
  useGetAmbientesService,
  Ambiente,
} from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetUnidadesService,
  Unidade,
} from "@/services/api/services/unidades";

export default function PageContent({ language }: { language: string }) {
  const getAmbientes = useGetAmbientesService();
  const getUnidades = useGetUnidadesService();

  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [unidadeFilter, setUnidadeFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ambientesRes, unidadesRes] = await Promise.all([
        getAmbientes(),
        getUnidades(),
      ]);
      setAmbientes(
        ambientesRes.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : []
      );
      setUnidades(
        unidadesRes.status === HTTP_CODES_ENUM.OK ? unidadesRes.data.data : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getAmbientes, getUnidades]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAmbientes = ambientes.filter((amb) => {
    const matchesSearch = amb.nome.toLowerCase().includes(search.toLowerCase());
    const matchesUnidade =
      unidadeFilter === "all" || amb.unidade?.id === unidadeFilter;
    const matchesTipo = tipoFilter === "all" || amb.categoria === tipoFilter;
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f767b]" />
            <Input
              placeholder="Buscar sala, laboratório ou bloco…"
              className="pl-9 h-10 bg-[#fbfaf7] border-[#dddbd3]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select value={unidadeFilter} onValueChange={setUnidadeFilter}>
              <SelectTrigger className="w-[180px] h-10 bg-[#fbfaf7] border-[#dddbd3]">
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
              <SelectTrigger className="w-[160px] h-10 bg-[#fbfaf7] border-[#dddbd3]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="Sala">Sala comum</SelectItem>
                <SelectItem value="Laboratório">Laboratório</SelectItem>
              </SelectContent>
            </Select>

            <Link href="/admin/ambientes/novo">
              <Button className="h-10 bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Novo ambiente
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : filteredAmbientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmbientes.map((ambiente) => (
              <AmbienteCard
                key={ambiente.id}
                ambiente={ambiente}
                language={language}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50 mt-8">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhum ambiente encontrado
            </h3>
            <p className="text-[#6f767b] max-w-md mb-8">
              Você ainda não tem ambientes cadastrados com esses filtros. Tente
              mudar a busca ou adicione um novo ambiente.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/admin/ambientes/novo">
                <Button className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
                  Cadastrar primeiro ambiente
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-[#dddbd3] text-[#1c1f21]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar planilha
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
