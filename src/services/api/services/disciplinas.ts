import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Disciplina = {
  id: string;
  nome: string;
  curso: { id: string; nome: string };
};

export function useGetDisciplinasService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      const url = `${API_URL}/disciplinas`;
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
