import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Turma = {
  id: string;
  codigo: string;
  periodo: string;
  curso: { id: string; nome: string };
};

export type CreateTurmaRequest = {
  curso: { id: string };
  codigo: string;
  periodo: string;
};

export function useCreateTurmaService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: CreateTurmaRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/turmas`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Turma>);
    },
    [fetchBase]
  );
}

export function useGetTurmasService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      const url = `${API_URL}/v1/turmas`;
      return fetchBase(url, {
        method: "GET",
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{ data: Turma[]; hasNextPage: boolean }>
      );
    },
    [fetchBase]
  );
}

export function useGetTurmaService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      const url = `${API_URL}/v1/turmas/${id}`;
      return fetchBase(url, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Turma>);
    },
    [fetchBase]
  );
}

export function useUpdateTurmaService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      id: string,
      data: Partial<CreateTurmaRequest>,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/turmas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Turma>);
    },
    [fetchBase]
  );
}
