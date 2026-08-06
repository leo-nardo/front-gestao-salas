import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type Aula = {
  id: string;
  disciplina: {
    id: string;
    nome: string;
    codigo: string;
    curso: { id: string; nome: string };
  };
  professor: { id: string; firstName: string; lastName: string };
  turma: { id: string; codigo: string };
  ambiente: { id: string; nome: string; bloco?: string; andar?: string };
  diaSemana: number;
  horarioInicio: string;
  horarioFim: string;
  status: "confirmada" | "pendente" | "conflito";
  createdAt: string;
  updatedAt: string;
};

export type CreateAulaRequest = {
  disciplinaId: string;
  professorId: string;
  turmaId: string;
  ambienteId: string;
  diaSemana: number;
  horarioInicio: string;
  horarioFim: string;
};

export function useGetAulasService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/aulas`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<{ data: Aula[]; hasNextPage: boolean }>);
    },
    [fetchBase]
  );
}

export function useCreateAulaService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: CreateAulaRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/aulas`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Aula>);
    },
    [fetchBase]
  );
}

export function useCheckConflictService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: CreateAulaRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/aulas/check-conflict`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{ conflict: boolean; message?: string }>
      );
    },
    [fetchBase]
  );
}
