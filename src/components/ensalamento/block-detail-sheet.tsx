"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "@/components/link";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Ambiente,
  useGetAmbientesService,
} from "@/services/api/services/ambientes";
import {
  useUpdateAulaService,
  useDeleteAulaService,
  DiaSemana,
} from "@/services/api/services/aulas";
import {
  useUpdateReservaService,
  useDeleteReservaService,
} from "@/services/api/services/reservas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { DIAS_SEMANA, EnsalamentoBlock } from "./types";

const TIME_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const hours = Math.floor(i / 2) + 7;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

type BlockDetailSheetProps = {
  block: EnsalamentoBlock | null;
  onClose: () => void;
  onSaved: () => void;
};

export function BlockDetailSheet({
  block,
  onClose,
  onSaved,
}: BlockDetailSheetProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [ambienteId, setAmbienteId] = useState("");
  const [diaSemana, setDiaSemana] = useState<DiaSemana>("Segunda");
  const [data, setData] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  const getAmbientes = useGetAmbientesService();
  const { data: ambientesRes } = useQuery({
    queryKey: ["ambientes", { limit: "500" }],
    queryFn: () => getAmbientes({ limit: "500" }),
  });
  const ambientes: Ambiente[] =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];

  const updateAula = useUpdateAulaService();
  const deleteAula = useDeleteAulaService();
  const updateReserva = useUpdateReservaService();
  const deleteReserva = useDeleteReservaService();

  useEffect(() => {
    if (!block) return;
    setEditing(false);
    setConflictMsg(null);
    setAmbienteId(block.ambienteId);
    setHorarioInicio(block.horarioInicio);
    setHorarioFim(block.horarioFim);
    if (block.kind === "aula") {
      setDiaSemana(block.diaSemana);
    } else {
      const reserva =
        block.raw as import("@/services/api/services/reservas").Reserva;
      setData(reserva.data);
      setTitulo(reserva.titulo);
      setDescricao(reserva.descricao || "");
    }
  }, [block]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!block) return;
      if (block.kind === "aula") {
        return updateAula(block.id, {
          ambiente: { id: ambienteId },
          diaSemana,
          horarioInicio,
          horarioFim,
        });
      }
      return updateReserva(block.id, {
        ambiente: { id: ambienteId },
        horarioInicio,
        horarioFim,
        titulo,
        descricao: descricao || undefined,
      });
    },
    onSuccess: (res) => {
      if (!res) return;
      if (res.status === HTTP_CODES_ENUM.CONFLICT) {
        setConflictMsg(res.data.message);
        return;
      }
      if (res.status !== HTTP_CODES_ENUM.OK) {
        toast.error("Erro ao salvar alterações.");
        return;
      }
      toast.success("Alterações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      setEditing(false);
      onSaved();
    },
    onError: () => toast.error("Erro ao salvar alterações. Tente novamente."),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!block) return;
      if (block.kind === "aula") return deleteAula(block.id);
      return deleteReserva(block.id);
    },
    onSuccess: () => {
      toast.success(
        block?.kind === "aula" ? "Aula removida." : "Reserva cancelada."
      );
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      onSaved();
    },
    onError: () => toast.error("Erro ao remover. Tente novamente."),
  });

  const handleDelete = () => {
    const msg =
      block?.kind === "aula"
        ? "Remover esta aula da grade fixa?"
        : "Cancelar esta reserva?";
    // eslint-disable-next-line no-alert
    if (window.confirm(msg)) {
      deleteMutation.mutate();
    }
  };

  if (!block) return null;

  const reserva =
    block.kind === "reserva"
      ? (block.raw as import("@/services/api/services/reservas").Reserva)
      : null;
  const aula =
    block.kind === "aula"
      ? (block.raw as import("@/services/api/services/aulas").Aula)
      : null;

  return (
    <Sheet open={!!block} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[420px] sm:max-w-[420px] p-0 gap-0"
      >
        <SheetHeader className="p-5 border-b border-[#f0efea]">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                block.kind === "aula"
                  ? "bg-[#eceef8] text-[#3a4a99]"
                  : "bg-[#ecebf7] text-[#5b53a6]"
              }`}
            >
              {block.kind === "aula" ? "Aula fixa" : "Reserva avulsa"}
            </span>
          </div>
          <SheetTitle className="text-lg">{block.titulo}</SheetTitle>
          <SheetDescription>{block.subtitulo}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[11px] font-semibold text-[#8a9095] uppercase tracking-wide mb-1">
                    Ambiente
                  </div>
                  <div className="font-medium">
                    {ambientes.find((a) => a.id === block.ambienteId)?.nome ||
                      "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#8a9095] uppercase tracking-wide mb-1">
                    {block.kind === "aula" ? "Dia da semana" : "Data"}
                  </div>
                  <div className="font-medium">
                    {block.kind === "aula" ? block.diaSemana : reserva?.data}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#8a9095] uppercase tracking-wide mb-1">
                    Horário
                  </div>
                  <div className="font-medium font-ibm-plex-mono">
                    {block.horarioInicio} – {block.horarioFim}
                  </div>
                </div>
                {aula && (
                  <div>
                    <div className="text-[11px] font-semibold text-[#8a9095] uppercase tracking-wide mb-1">
                      Turma
                    </div>
                    <div className="font-medium">{aula.turma.codigo}</div>
                  </div>
                )}
              </div>

              {reserva?.descricao && (
                <div>
                  <div className="text-[11px] font-semibold text-[#8a9095] uppercase tracking-wide mb-1">
                    Descrição
                  </div>
                  <p className="text-sm text-[#565b5e]">{reserva.descricao}</p>
                </div>
              )}

              {aula && (
                <Link
                  href={`/admin/aulas/${aula.id}/editar`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1a4f8a] hover:underline"
                >
                  Editar disciplina, turma e professor
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {block.kind === "reserva" && (
                <div className="space-y-2">
                  <Label htmlFor="sheet-titulo">Título</Label>
                  <Input
                    id="sheet-titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="bg-[#fbfaf7] border-[#dddbd3]"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Ambiente</Label>
                <Select value={ambienteId} onValueChange={setAmbienteId}>
                  <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                    <SelectValue placeholder="Selecione o ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ambientes.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {block.kind === "aula" ? (
                <div className="space-y-2">
                  <Label>Dia da semana</Label>
                  <Select
                    value={diaSemana}
                    onValueChange={(v) => setDiaSemana(v as DiaSemana)}
                  >
                    <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_SEMANA.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="sheet-data">Data</Label>
                  <Input
                    id="sheet-data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="bg-[#fbfaf7] border-[#dddbd3]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Select
                    value={horarioInicio}
                    onValueChange={setHorarioInicio}
                  >
                    <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3] font-ibm-plex-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(horarioInicio && !TIME_OPTIONS.includes(horarioInicio)
                        ? [horarioInicio, ...TIME_OPTIONS]
                        : TIME_OPTIONS
                      ).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Select value={horarioFim} onValueChange={setHorarioFim}>
                    <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3] font-ibm-plex-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(horarioFim && !TIME_OPTIONS.includes(horarioFim)
                        ? [horarioFim, ...TIME_OPTIONS]
                        : TIME_OPTIONS
                      ).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {block.kind === "reserva" && (
                <div className="space-y-2">
                  <Label htmlFor="sheet-desc">Descrição</Label>
                  <Input
                    id="sheet-desc"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="bg-[#fbfaf7] border-[#dddbd3]"
                  />
                </div>
              )}

              {conflictMsg && (
                <div className="p-3 rounded-lg bg-[#f7e7e2] border border-[#ecc9bf] text-sm text-[#8a3020]">
                  {conflictMsg}
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="p-4 border-t border-[#f0efea] bg-[#faf9f5] flex-row gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                className="flex-1 border-[#dddbd3]"
                onClick={() => {
                  setEditing(false);
                  setConflictMsg(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="border-[#dddbd3] text-[#a8442f] hover:text-[#a8442f]"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                {block.kind === "aula" ? "Remover" : "Cancelar"}
              </Button>
              <Button
                className="flex-1 bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
                onClick={() => setEditing(true)}
              >
                <Pencil className="w-4 h-4 mr-1.5" />
                Editar horário / sala
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
