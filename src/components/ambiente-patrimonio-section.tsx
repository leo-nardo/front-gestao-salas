"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFormState, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetItemPatrimonialsService,
  useCreateItemPatrimonialService,
  useUpdateItemPatrimonialService,
  useDeleteItemPatrimonialService,
  ItemPatrimonial,
} from "@/services/api/services/item-patrimonials";
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

const schema = yup.object().shape({
  nome: yup.string().required("Nome é obrigatório"),
  tipo: yup.string().required("Tipo é obrigatório"),
  numeroPatrimonio: yup.string().optional(),
  estado: yup.string().required("Estado é obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

export function AmbientePatrimonioSection({
  ambienteId,
}: {
  ambienteId: string;
}) {
  const queryClient = useQueryClient();
  const getItens = useGetItemPatrimonialsService();
  const createItem = useCreateItemPatrimonialService();
  const updateItem = useUpdateItemPatrimonialService();
  const deleteItem = useDeleteItemPatrimonialService();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, control, reset } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      estado: "funcionando",
    },
  });

  const { errors } = useFormState({ control });

  const { data: itensRes, isLoading } = useQuery({
    queryKey: ["item-patrimoniais", "ambiente", ambienteId],
    queryFn: () => getItens(),
  });

  const itens =
    itensRes?.status === HTTP_CODES_ENUM.OK ? itensRes.data.data : [];
  const filteredItens = itens.filter(
    (item: ItemPatrimonial) => item.ambiente.id === ambienteId
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["item-patrimoniais", "ambiente", ambienteId],
      });
      toast.success("Item patrimonial excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir item patrimonial.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        numeroPatrimonio: data.numeroPatrimonio || undefined,
        ambiente: { id: ambienteId },
      };
      if (editingId) {
        return updateItem({ id: editingId, ...payload });
      }
      return createItem(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["item-patrimoniais", "ambiente", ambienteId],
      });
      toast.success(
        `Item patrimonial ${editingId ? "atualizado" : "criado"} com sucesso!`
      );
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(
        `Erro ao ${editingId ? "atualizar" : "criar"} item patrimonial.`
      );
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

  const openCreateDialog = () => {
    setEditingId(null);
    reset({
      nome: "",
      tipo: "",
      numeroPatrimonio: "",
      estado: "funcionando",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: ItemPatrimonial) => {
    setEditingId(item.id);
    reset({
      nome: item.nome,
      tipo: item.tipo,
      numeroPatrimonio: item.numeroPatrimonio || "",
      estado: item.estado || "funcionando",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden mt-8 max-w-[800px] mx-auto w-full">
      <div className="p-6 border-b border-[#f0efea] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#1c1f21] mb-1">
            Itens patrimoniais
          </h2>
          <p className="text-sm text-[#6f767b]">
            Gerencie os equipamentos e patrimônios deste ambiente.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateDialog}
          className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo item
        </Button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : filteredItens.length === 0 ? (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhum item patrimonial cadastrado para este ambiente.
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e6e5e0] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#faf9f5]">
                <TableRow className="border-b-[#f0efea]">
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Nome
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Tipo
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Nº Patr.
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Estado
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItens.map((item: ItemPatrimonial) => {
                  const badge =
                    estadoBadge[item.estado] || estadoBadge.funcionando;
                  return (
                    <TableRow key={item.id} className="border-b-[#f0efea]">
                      <TableCell className="font-medium text-[#1c1f21]">
                        {item.nome}
                      </TableCell>
                      <TableCell className="text-[#6f767b]">
                        {item.tipo}
                      </TableCell>
                      <TableCell className="text-[#6f767b]">
                        {item.numeroPatrimonio || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${badge.className} border-transparent`}
                        >
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                            className="h-8 text-[#1a4f8a] hover:text-[#123c6e] px-2"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                            className="h-8 text-[#a8442f] hover:bg-[#f7e7e2] px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar item patrimonial" : "Novo item patrimonial"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Mesa de professor"
                  {...register("nome")}
                />
                {errors.nome && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.nome.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Input
                  id="tipo"
                  placeholder="Ex: Mobília"
                  {...register("tipo")}
                />
                {errors.tipo && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.tipo.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroPatrimonio">Número de patrimônio</Label>
                <Input
                  id="numeroPatrimonio"
                  placeholder="Ex: 123456"
                  {...register("numeroPatrimonio")}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="funcionando">Funcionando</SelectItem>
                        <SelectItem value="com_defeito">Com defeito</SelectItem>
                        <SelectItem value="em_manutencao">
                          Em manutenção
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.estado && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.estado.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
