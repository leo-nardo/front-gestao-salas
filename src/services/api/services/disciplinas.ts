import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Disciplina = {
  id: string;
  nome: string;
  codigo: string;
  cursoId: string;
};

export function useGetDisciplinasService() {
  const fetchBase = useFetch();

  return useCallback(
    (cursoId?: string, requestConfig?: RequestConfigType) => {
      const url = cursoId
        ? `${API_URL}/v1/disciplinas?cursoId=${cursoId}`
        : `${API_URL}/v1/disciplinas`;
      return fetchBase(url, {
        method: "GET",
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{ data: Disciplina[]; hasNextPage: boolean }>
      );
    },
    [fetchBase]
  );
}
