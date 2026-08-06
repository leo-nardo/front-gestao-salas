import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Equipamento = {
  id: string;
  nome: string;
  tipo: string;
  unidade: { id: string; nome: string };
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  descricao?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateEquipamentoRequest = {
  nome: string;
  tipo: string;
  unidade: { id: string };
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  descricao?: string;
};

export function useGetEquipamentosService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/equipamentos`, {
        method: "GET",
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{
          data: Equipamento[];
          hasNextPage: boolean;
        }>
      );
    },
    [fetchBase]
  );
}

export function useCreateEquipamentoService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: CreateEquipamentoRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/equipamentos`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Equipamento>);
    },
    [fetchBase]
  );
}

export function useGetEquipamentoService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/equipamentos/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Equipamento>);
    },
    [fetchBase]
  );
}

export function useUpdateEquipamentoService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      id: string,
      data: Partial<CreateEquipamentoRequest>,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/equipamentos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Equipamento>);
    },
    [fetchBase]
  );
}
