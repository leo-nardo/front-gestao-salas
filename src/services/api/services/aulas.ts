import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import HTTP_CODES_ENUM from "../types/http-codes";
import { RequestConfigType } from "./types/request-config";

export type DiaSemana =
  | "Segunda"
  | "Terça"
  | "Quarta"
  | "Quinta"
  | "Sexta"
  | "Sábado";

export type Aula = {
  id: string;
  disciplina: {
    id: string;
    nome: string;
    curso: { id: string; nome: string };
  };
  professor: { id: string; firstName: string; lastName: string };
  turma: { id: string; codigo: string };
  ambiente: { id: string; nome: string; bloco?: string; andar?: string };
  diaSemana: DiaSemana;
  horarioInicio: string;
  horarioFim: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAulaRequest = {
  disciplina: { id: string };
  professor: { id: string };
  turma: { id: string };
  ambiente: { id: string };
  diaSemana: DiaSemana;
  horarioInicio: string;
  horarioFim: string;
};

export type CreateAulaResponse =
  | { status: typeof HTTP_CODES_ENUM.CREATED; data: Aula }
  | {
      status: typeof HTTP_CODES_ENUM.CONFLICT;
      data: { message: string; errors?: Record<string, string> };
    }
  | {
      status: typeof HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY;
      data: { errors: Record<string, string> };
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

export function useGetMinhaGradeService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/aulas/minha-grade`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Aula[]>);
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
      }).then(
        (response) =>
          wrapperFetchJsonResponse(response) as Promise<CreateAulaResponse>
      );
    },
    [fetchBase]
  );
}
