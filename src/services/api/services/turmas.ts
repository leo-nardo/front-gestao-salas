import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Turma = {
  id: string;
  codigo: string;
  disciplinaId: string;
};

export function useGetTurmasService() {
  const fetchBase = useFetch();

  return useCallback(
    (disciplinaId?: string, requestConfig?: RequestConfigType) => {
      const url = disciplinaId
        ? `${API_URL}/v1/turmas?disciplinaId=${disciplinaId}`
        : `${API_URL}/v1/turmas`;
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
