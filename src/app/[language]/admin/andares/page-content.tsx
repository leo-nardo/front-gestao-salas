"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Tags from "lucide-react/dist/esm/icons/tags";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  useGetAndaresService,
  useDeleteAndarService,
} from "@/services/api/services/andares";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const queryClient = useQueryClient();
  const getTipos = useGetAndaresService();
  const deleteTipo = useDeleteAndarService();

  const { data: tiposRes, isLoading } = useQuery({
    queryKey: ["andares", { limit: 500 }],
    queryFn: () => getTipos({ limit: "500" }),
  });

  const tipos =
    tiposRes?.status === HTTP_CODES_ENUM.OK ? tiposRes.data.data : [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTipo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["andares"] });
      toast.success("Andar excluído com sucesso!");
    },
    onError: () => {
      // General error fallback, covering FK constraints from backend
      toast.error(
        "Não é possível excluir: existem ambientes usando este tipo."
      );
    },
  });

  const handleDelete = (id: string) => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm("Tem certeza que deseja excluir este Andar?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <AdminHeader
        title="Andares"
        subtitle="Gerencie as categorias dinâmicas de ambientes"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full">
        <div className="flex justify-end mb-6">
          <Link href="/admin/andares/novo">
            <Button className="h-10 bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo tipo
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : tipos.length > 0 ? (
          <div className="bg-white rounded-xl border border-[#e6e5e0] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#faf9f5]">
                <TableRow className="border-b-[#f0efea]">
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Nome
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Descrição
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipos.map((tipo) => (
                  <TableRow key={tipo.id} className="border-b-[#f0efea]">
                    <TableCell className="font-medium text-[#1c1f21]">
                      {tipo.nome}
                    </TableCell>
                    <TableCell className="text-[#6f767b]">
                      {tipo.descricao || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/andares/${tipo.id}/editar`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[#1a4f8a] hover:text-[#123c6e] px-2"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tipo.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 text-[#a8442f] hover:bg-[#f7e7e2] px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50 mt-8">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <Tags className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhum Andar encontrado
            </h3>
            <Link href="/admin/andares/novo">
              <Button className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
                Cadastrar tipo
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
