import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Andar = {
  id: string;
  nome: string;
  descricao?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useGetAndaresService() {
  const fetch = useFetch();

  return useCallback(
    (params?: Record<string, string>) => {
      const url = new URL(`${API_URL}/v1/andares`);
      if (params) {
        Object.keys(params).forEach((key) => {
          url.searchParams.append(key, params[key]);
        });
      }
      return fetch(url.toString(), {
        method: "GET",
      }).then(
        wrapperFetchJsonResponse<{ data: Andar[]; hasNextPage: boolean }>
      );
    },
    [fetch]
  );
}

export function useGetAndarService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/andares/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Andar>);
    },
    [fetchBase]
  );
}

export function useCreateAndarService() {
  const fetch = useFetch();

  return useCallback(
    (data: { nome: string; descricao?: string }) => {
      return fetch(`${API_URL}/v1/andares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<Andar>);
    },
    [fetch]
  );
}

export function useUpdateAndarService() {
  const fetch = useFetch();

  return useCallback(
    (id: string, data: Partial<{ nome: string; descricao?: string }>) => {
      return fetch(`${API_URL}/v1/andares/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<Andar>);
    },
    [fetch]
  );
}

export function useDeleteAndarService() {
  const fetch = useFetch();

  return useCallback(
    (id: string) => {
      return fetch(`${API_URL}/v1/andares/${id}`, {
        method: "DELETE",
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetch]
  );
}
