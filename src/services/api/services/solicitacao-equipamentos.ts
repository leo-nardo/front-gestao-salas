import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import HTTP_CODES_ENUM from "../types/http-codes";
import { RequestConfigType } from "./types/request-config";

export type SolicitacaoEquipamento = {
  id: string;
  equipamento: {
    id: string;
    nome: string;
    tipo: string;
    unidade: { id: string; nome: string };
    quantidadeTotal: number;
    quantidadeDisponivel: number;
    descricao?: string | null;
  };
  solicitante: { id: string; firstName: string; lastName: string };
  quantidade: number;
  dataInicio: string; // "YYYY-MM-DD"
  dataFim: string; // "YYYY-MM-DD"
  finalidade: string;
  status: "pendente" | "aprovada" | "rejeitada" | "devolvida";
  respondidoPor?: { id: string; firstName: string; lastName: string } | null;
  motivoResposta?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSolicitacaoEquipamentoRequest = {
  equipamento: { id: string };
  quantidade: number;
  dataInicio: string;
  dataFim: string;
  finalidade: string;
};

export type CreateSolicitacaoEquipamentoResponse =
  | { status: typeof HTTP_CODES_ENUM.CREATED; data: SolicitacaoEquipamento }
  | {
      status: typeof HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY;
      data: { message: string; errors?: Record<string, string> };
    };

export function useGetSolicitacaoEquipamentosService() {
  const fetchBase = useFetch();

  return useCallback(
    (params?: { limit?: number }, requestConfig?: RequestConfigType) => {
      const url = new URL(`${API_URL}/v1/solicitacao-equipamentos`);
      if (params?.limit !== undefined) {
        url.searchParams.append("limit", params.limit.toString());
      }
      return fetchBase(url.toString(), {
        method: "GET",
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{
          data: SolicitacaoEquipamento[];
          hasNextPage: boolean;
        }>
      );
    },
    [fetchBase]
  );
}

export function useGetMinhasSolicitacaoEquipamentosService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/solicitacao-equipamentos/minhas`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<SolicitacaoEquipamento[]>);
    },
    [fetchBase]
  );
}

export function useCreateSolicitacaoEquipamentoService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      data: CreateSolicitacaoEquipamentoRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/solicitacao-equipamentos`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(
        (response) =>
          wrapperFetchJsonResponse(
            response
          ) as Promise<CreateSolicitacaoEquipamentoResponse>
      );
    },
    [fetchBase]
  );
}

export function useResponderSolicitacaoEquipamentoService() {
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
        `${API_URL}/v1/solicitacao-equipamentos/${data.id}/responder`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            motivoResposta: data.motivoResposta,
          }),
          ...requestConfig,
        }
      ).then(wrapperFetchJsonResponse<SolicitacaoEquipamento>);
    },
    [fetchBase]
  );
}

export function useDevolverSolicitacaoEquipamentoService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      return fetchBase(
        `${API_URL}/v1/solicitacao-equipamentos/${id}/devolver`,
        {
          method: "PATCH",
          ...requestConfig,
        }
      ).then(wrapperFetchJsonResponse<SolicitacaoEquipamento>);
    },
    [fetchBase]
  );
}
