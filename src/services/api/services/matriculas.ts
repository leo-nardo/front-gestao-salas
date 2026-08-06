import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";
import { Aula } from "./aulas";

export function useGetMinhaGradeService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/matriculas/minha-grade`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Aula[]>);
    },
    [fetchBase]
  );
}
