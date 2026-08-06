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
      return fetchBase(`${API_URL}/v1/cursos`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Curso[]>);
    },
    [fetchBase]
  );
}
