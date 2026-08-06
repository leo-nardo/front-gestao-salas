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
