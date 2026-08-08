import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type ItemPatrimonial = {
  id: string;
  nome: string;
  tipo: string;
  ambiente: { id: string; nome: string };
  numeroPatrimonio?: string | null;
  estado: "funcionando" | "com_defeito" | "em_manutencao";
  descricaoDefeito?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateItemPatrimonialRequest = {
  nome: string;
  tipo: string;
  ambiente: { id: string };
  numeroPatrimonio?: string;
  estado?: string;
  descricaoDefeito?: string;
};

export function useGetItemPatrimonialsService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/item-patrimoniais`, {
        method: "GET",
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{
          data: ItemPatrimonial[];
          hasNextPage: boolean;
        }>
      );
    },
    [fetchBase]
  );
}

export function useCreateItemPatrimonialService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: CreateItemPatrimonialRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/item-patrimoniais`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ItemPatrimonial>);
    },
    [fetchBase]
  );
}

export function useReportarDefeitoService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      data: { id: string; descricaoDefeito: string },
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(
        `${API_URL}/v1/item-patrimoniais/${data.id}/reportar-defeito`,
        {
          method: "PATCH",
          body: JSON.stringify({ descricaoDefeito: data.descricaoDefeito }),
          ...requestConfig,
        }
      ).then(wrapperFetchJsonResponse<ItemPatrimonial>);
    },
    [fetchBase]
  );
}

export function useUpdateItemPatrimonialService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      data: {
        id: string;
        nome?: string;
        tipo?: string;
        ambiente?: { id: string };
        numeroPatrimonio?: string | null;
        estado?: string;
        descricaoDefeito?: string | null;
      },
      requestConfig?: RequestConfigType
    ) => {
      const { id, ...payload } = data;

      return fetchBase(`${API_URL}/v1/item-patrimoniais/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ItemPatrimonial>);
    },
    [fetchBase]
  );
}

export function useGetItemPatrimonialService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: { id: string }, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/item-patrimoniais/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ItemPatrimonial>);
    },
    [fetchBase]
  );
}

export function useDeleteItemPatrimonialService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: { id: string }, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/item-patrimoniais/${data.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<undefined>);
    },
    [fetchBase]
  );
}
