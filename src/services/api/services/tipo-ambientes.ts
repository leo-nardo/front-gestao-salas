import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type TipoAmbiente = {
  id: string;
  nome: string;
  descricao?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useGetTipoAmbientesService() {
  const fetch = useFetch();

  return useCallback(
    (params?: Record<string, string>) => {
      const url = new URL(`${API_URL}/v1/tipo-ambientes`);
      if (params) {
        Object.keys(params).forEach((key) => {
          url.searchParams.append(key, params[key]);
        });
      }
      return fetch(url.toString(), {
        method: "GET",
      }).then(
        wrapperFetchJsonResponse<{ data: TipoAmbiente[]; hasNextPage: boolean }>
      );
    },
    [fetch]
  );
}

export function useGetTipoAmbienteService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/tipo-ambientes/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<TipoAmbiente>);
    },
    [fetchBase]
  );
}

export function useCreateTipoAmbienteService() {
  const fetch = useFetch();

  return useCallback(
    (data: { nome: string; descricao?: string }) => {
      return fetch(`${API_URL}/v1/tipo-ambientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<TipoAmbiente>);
    },
    [fetch]
  );
}

export function useUpdateTipoAmbienteService() {
  const fetch = useFetch();

  return useCallback(
    (id: string, data: Partial<{ nome: string; descricao?: string }>) => {
      return fetch(`${API_URL}/v1/tipo-ambientes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<TipoAmbiente>);
    },
    [fetch]
  );
}

export function useDeleteTipoAmbienteService() {
  const fetch = useFetch();

  return useCallback(
    (id: string) => {
      return fetch(`${API_URL}/v1/tipo-ambientes/${id}`, {
        method: "DELETE",
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetch]
  );
}
