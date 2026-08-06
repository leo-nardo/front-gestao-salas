import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";

export type Unidade = {
  id: string;
  nome: string;
  codigo: string;
  createdAt: string;
  updatedAt: string;
};

export function useGetUnidadesService() {
  const fetch = useFetch();

  return useCallback(
    (params?: Record<string, string>) => {
      const url = new URL(`${API_URL}/v1/unidades`);
      if (params) {
        Object.keys(params).forEach((key) => {
          url.searchParams.append(key, params[key]);
        });
      }
      return fetch(url.toString(), {
        method: "GET",
      }).then(
        wrapperFetchJsonResponse<{ data: Unidade[]; hasNextPage: boolean }>
      );
    },
    [fetch]
  );
}
