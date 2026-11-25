"use client";

import { routes } from "@/routes";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGetMinhasSolicitacoesService } from "@/services/api/services/solicitacao-troca-salas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const statusBadge: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning-bg text-warning" },
  aprovada: { label: "Aprovada", className: "bg-success-bg text-success" },
  rejeitada: {
    label: "Rejeitada",
    className: "bg-destructive-bg text-destructive",
  },
};

export default function PageContent() {
  const getMinhas = useGetMinhasSolicitacoesService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["minhas-solicitacoes"],
    queryFn: () => getMinhas(),
  });
  const solicitacoes = res?.status === HTTP_CODES_ENUM.OK ? res.data : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Minhas solicitações de troca
        </h1>
        <Link href={routes.solicitacoes.auxiliar.create()}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova solicitação
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : solicitacoes.length === 0 ? (
        <Card className="p-12 text-center">
          <ArrowLeftRight className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Você ainda não fez nenhuma solicitação de troca de sala.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {solicitacoes.map((s) => {
            const badge = statusBadge[s.status];
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {s.aula.disciplina.nome} · {s.aula.turma.codigo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {s.aula.diaSemana} {s.aula.horarioInicio}-
                      {s.aula.horarioFim}
                    </p>
                  </div>
                  <Badge className={`${badge.className} border-transparent`}>
                    {badge.label}
                  </Badge>
                </div>
                <p className="text-sm text-foreground mb-1">
                  De: {s.ambienteAtual.nome}
                  {s.ambienteSugerido &&
                    ` → Sugestão: ${s.ambienteSugerido.nome}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  &ldquo;{s.justificativa}&rdquo;
                </p>
                {s.motivoResposta && (
                  <p className="text-sm text-muted-foreground pt-2 mt-2 border-t">
                    Resposta: {s.motivoResposta}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
