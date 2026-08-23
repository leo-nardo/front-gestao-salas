"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Edit from "lucide-react/dist/esm/icons/edit";
import Plus from "lucide-react/dist/esm/icons/plus";
import Package from "lucide-react/dist/esm/icons/package";
import Search from "lucide-react/dist/esm/icons/search";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEquipamentosService } from "@/services/api/services/equipamentos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const [search, setSearch] = useState("");
  const getEquipamentos = useGetEquipamentosService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => getEquipamentos(),
  });
  const equipamentos = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  const filtered = useMemo(() => {
    if (!search.trim()) return equipamentos;
    const needle = search.trim().toLowerCase();
    return equipamentos.filter(
      (eq) =>
        eq.nome.toLowerCase().includes(needle) ||
        eq.tipo.toLowerCase().includes(needle) ||
        eq.unidade?.nome.toLowerCase().includes(needle)
    );
  }, [equipamentos, search]);

  return (
    <>
      <AdminHeader
        title="Equipamentos"
        subtitle="Gerencie o acervo de equipamentos emprestáveis"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {equipamentos.length > 0 && (
            <div className="relative max-w-sm flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, tipo ou unidade..."
                className="pl-9"
              />
            </div>
          )}
          <Link href="/admin/equipamentos/novo" className="ml-auto">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo equipamento
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : equipamentos.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/30">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum equipamento cadastrado
            </h3>
            <Link href="/admin/equipamentos/novo">
              <Button>Cadastrar primeiro equipamento</Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            Nenhum resultado para &ldquo;{search}&rdquo;.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((eq) => (
              <Card
                key={eq.id}
                className="p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-accent p-2 rounded-lg text-accent-foreground">
                      <Package className="w-5 h-5" />
                    </div>
                    <Badge variant="outline">{eq.tipo}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {eq.nome}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {eq.unidade?.nome}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between pt-4 border-t mb-4">
                    <span className="text-sm text-muted-foreground">
                      Disponível
                    </span>
                    <span className="font-ibm-plex-mono font-semibold text-foreground">
                      {eq.quantidadeDisponivel} / {eq.quantidadeTotal}
                    </span>
                  </div>
                  <Link href={`/admin/equipamentos/${eq.id}/editar`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
