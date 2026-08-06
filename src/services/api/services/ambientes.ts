import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Unidade } from "./unidades";

export type Ambiente = {
  id: string;
  nome: string;
  tipo: string;
  categoria: string;
  capacidade: number;
  bloco?: string | null;
  andar?: string | null;
  descricao?: string | null;
  unidade?: Unidade;
  createdAt: string;
  updatedAt: string;
};

export type CreateAmbienteRequest = {
  nome: string;
  tipo: string;
  categoria: string;
  capacidade: number;
  unidade: { id: string };
  bloco?: string;
  andar?: string;
  descricao?: string;
};

export function useGetAmbientesService() {
  const fetch = useFetch();

  return useCallback(
    (params?: Record<string, string>) => {
      const url = new URL(`${API_URL}/v1/ambientes`);
      if (params) {
        Object.keys(params).forEach((key) => {
          if (params[key]) {
            url.searchParams.append(key, params[key]);
          }
        });
      }
      return fetch(url.toString(), {
        method: "GET",
      }).then(
        wrapperFetchJsonResponse<{ data: Ambiente[]; hasNextPage: boolean }>
      );
    },
    [fetch]
  );
}

export function useCreateAmbienteService() {
  const fetch = useFetch();

  return useCallback(
    (data: CreateAmbienteRequest) => {
      return fetch(`${API_URL}/v1/ambientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<Ambiente>);
    },
    [fetch]
  );
}

export function useUpdateAmbienteService() {
  const fetch = useFetch();

  return useCallback(
    (id: string, data: Partial<CreateAmbienteRequest>) => {
      return fetch(`${API_URL}/v1/ambientes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<Ambiente>);
    },
    [fetch]
  );
}

export function useDeleteAmbienteService() {
  const fetch = useFetch();

  return useCallback(
    (id: string) => {
      return fetch(`${API_URL}/v1/ambientes/${id}`, {
        method: "DELETE",
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetch]
  );
}
