import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type SolicitacaoTrocaSala = {
  id: string;
  aula: {
    id: string;
    diaSemana: string;
    horarioInicio: string;
    horarioFim: string;
    disciplina: { id: string; nome: string };
    turma: { id: string; codigo: string };
  };
  ambienteAtual: { id: string; nome: string };
  ambienteSugerido?: { id: string; nome: string } | null;
  solicitante: { id: string; firstName: string; lastName: string };
  respondidoPor?: { id: string; firstName: string; lastName: string } | null;
  justificativa: string;
  status: "pendente" | "aprovada" | "rejeitada";
  motivoResposta?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSolicitacaoTrocaSalaRequest = {
  aula: { id: string };
  ambienteSugerido?: { id: string };
  justificativa: string;
};

export function useGetSolicitacaoTrocaSalasService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/solicitacao-troca-salas`, {
        method: "GET",
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{
          data: SolicitacaoTrocaSala[];
          hasNextPage: boolean;
        }>
      );
    },
    [fetchBase]
  );
}

export function useGetMinhasSolicitacoesService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/solicitacao-troca-salas/minhas`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<SolicitacaoTrocaSala[]>);
    },
    [fetchBase]
  );
}

export function useCreateSolicitacaoTrocaSalaService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      data: CreateSolicitacaoTrocaSalaRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/solicitacao-troca-salas`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<SolicitacaoTrocaSala>);
    },
    [fetchBase]
  );
}

export function useResponderSolicitacaoService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      data: {
        id: string;
        status: "aprovada" | "rejeitada";
        motivoResposta?: string;
      },
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(
        `${API_URL}/v1/solicitacao-troca-salas/${data.id}/responder`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            motivoResposta: data.motivoResposta,
          }),
          ...requestConfig,
        }
      ).then(wrapperFetchJsonResponse<SolicitacaoTrocaSala>);
    },
    [fetchBase]
  );
}
