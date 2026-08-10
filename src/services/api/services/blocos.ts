import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Bloco = {
  id: string;
  nome: string;
  descricao?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useGetBlocosService() {
  const fetch = useFetch();

  return useCallback(
    (params?: Record<string, string>) => {
      const url = new URL(`${API_URL}/v1/blocos`);
      if (params) {
        Object.keys(params).forEach((key) => {
          url.searchParams.append(key, params[key]);
        });
      }
      return fetch(url.toString(), {
        method: "GET",
      }).then(
        wrapperFetchJsonResponse<{ data: Bloco[]; hasNextPage: boolean }>
      );
    },
    [fetch]
  );
}

export function useGetBlocoService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/blocos/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Bloco>);
    },
    [fetchBase]
  );
}

export function useCreateBlocoService() {
  const fetch = useFetch();

  return useCallback(
    (data: { nome: string; descricao?: string }) => {
      return fetch(`${API_URL}/v1/blocos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<Bloco>);
    },
    [fetch]
  );
}

export function useUpdateBlocoService() {
  const fetch = useFetch();

  return useCallback(
    (id: string, data: Partial<{ nome: string; descricao?: string }>) => {
      return fetch(`${API_URL}/v1/blocos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<Bloco>);
    },
    [fetch]
  );
}

export function useDeleteBlocoService() {
  const fetch = useFetch();

  return useCallback(
    (id: string) => {
      return fetch(`${API_URL}/v1/blocos/${id}`, {
        method: "DELETE",
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetch]
  );
}
