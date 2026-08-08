"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetItemPatrimonialsService,
  useDeleteItemPatrimonialService,
} from "@/services/api/services/item-patrimonials";
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const estadoBadge: Record<string, { label: string; className: string }> = {
  funcionando: {
    label: "Funcionando",
    className: "bg-[#e6f2ea] text-[#2f7d4f]",
  },
  com_defeito: {
    label: "Com defeito",
    className: "bg-[#f7e7e2] text-[#a8442f]",
  },
  em_manutencao: {
    label: "Em manutenção",
    className: "bg-[#f6eede] text-[#b26a12]",
  },
};

export default function PageContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const defaultAmbiente = searchParams.get("ambiente");

  const [ambienteFiltro, setAmbienteFiltro] = useState<string>(
    defaultAmbiente || "todos"
  );

  const getItens = useGetItemPatrimonialsService();
  const getAmbientes = useGetAmbientesService();
  const deleteItem = useDeleteItemPatrimonialService();

  const { data: itensRes, isLoading: isLoadingItens } = useQuery({
    queryKey: ["item-patrimoniais"],
    queryFn: () => getItens(),
  });

  const { data: ambientesRes } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => getAmbientes(),
  });

  const itens =
    itensRes?.status === HTTP_CODES_ENUM.OK ? itensRes.data.data : [];
  const ambientes =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];

  const filteredItens = itens.filter((item) =>
    ambienteFiltro === "todos" ? true : item.ambiente.id === ambienteFiltro
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-patrimoniais"] });
      toast.success("Item patrimonial excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir item patrimonial.");
    },
  });

  const handleDelete = (id: string) => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm("Tem certeza que deseja excluir este item patrimonial?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <AdminHeader
        title="Patrimônio"
        subtitle="Gerencie os itens patrimoniais e equipamentos das salas"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="w-full md:w-[300px]">
            <Select value={ambienteFiltro} onValueChange={setAmbienteFiltro}>
              <SelectTrigger className="bg-white border-[#dddbd3]">
                <SelectValue placeholder="Filtrar por ambiente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os ambientes</SelectItem>
                {ambientes.map((amb) => (
                  <SelectItem key={amb.id} value={amb.id}>
                    {amb.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link
            href={`/admin/patrimonio/novo${ambienteFiltro !== "todos" ? `?ambiente=${ambienteFiltro}` : ""}`}
          >
            <Button className="h-10 bg-[#1a4f8a] hover:bg-[#123c6e] text-white w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo item
            </Button>
          </Link>
        </div>

        {isLoadingItens ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : filteredItens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItens.map((item) => {
              const badge = estadoBadge[item.estado] || estadoBadge.funcionando;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#e6e5e0] p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-[#e7edf8] p-2 rounded-lg text-[#3a4a99]">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <Badge
                        className={`${badge.className} border-transparent`}
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1c1f21] mb-1">
                      {item.nome}
                    </h3>
                    <p className="text-sm text-[#1c1f21] font-medium mb-1">
                      {item.tipo}
                    </p>
                    <p className="text-sm text-[#6f767b] mb-4">
                      {item.ambiente.nome}
                      {item.numeroPatrimonio && ` · ${item.numeroPatrimonio}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-[#f0efea] mt-4">
                    <Link
                      href={`/admin/patrimonio/${item.id}/editar`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 border-[#dddbd3] text-[#1c1f21]"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 border-[#dddbd3] text-[#a8442f] hover:bg-[#f7e7e2]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50 mt-8">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhum item patrimonial encontrado
            </h3>
            <Link href="/admin/patrimonio/novo">
              <Button className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
                Cadastrar item
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
