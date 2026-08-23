import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Curso = {
  id: string;
  nome: string;
};

export function useGetCursosService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/cursos?limit=500`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Curso[]>);
    },
    [fetchBase]
  );
}

export function useGetCursoService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/cursos/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Curso>);
    },
    [fetchBase]
  );
}

export function useCreateCursoService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: { nome: string }, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/cursos`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Curso>);
    },
    [fetchBase]
  );
}

export function useUpdateCursoService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, data: { nome: string }, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/cursos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Curso>);
    },
    [fetchBase]
  );
}

export function useDeleteCursoService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/cursos/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetchBase]
  );
}
