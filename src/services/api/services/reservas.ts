import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import HTTP_CODES_ENUM from "../types/http-codes";
import { RequestConfigType } from "./types/request-config";

export type Reserva = {
  id: string;
  ambiente: { id: string; nome: string };
  solicitante: { id: string; firstName: string; lastName: string };
  data: string;
  horarioInicio: string;
  horarioFim: string;
  titulo: string;
  descricao?: string | null;
  eventoAberto: boolean;
  status: "confirmada" | "cancelada";
  createdAt: string;
  updatedAt: string;
};

export type CreateReservaRequest = {
  ambiente: { id: string };
  solicitante: { id: string };
  data: string;
  horarioInicio: string;
  horarioFim: string;
  titulo: string;
  descricao?: string;
  eventoAberto?: boolean;
};

export type CreateReservaResponse =
  | { status: typeof HTTP_CODES_ENUM.CREATED; data: Reserva }
  | {
      status: typeof HTTP_CODES_ENUM.CONFLICT;
      data: { message: string; errors?: Record<string, string> };
    }
  | {
      status: typeof HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY;
      data: { errors: Record<string, string> };
    };

export type ReservasRequest = {
  page?: number;
  limit?: number;
  dataInicio?: string;
  dataFim?: string;
};

export function useGetReservasService() {
  const fetchBase = useFetch();

  return useCallback(
    (params?: ReservasRequest, requestConfig?: RequestConfigType) => {
      const url = new URL(`${API_URL}/v1/reservas`);
      if (params?.page !== undefined) {
        url.searchParams.append("page", params.page.toString());
      }
      if (params?.limit !== undefined) {
        url.searchParams.append("limit", params.limit.toString());
      }
      if (params?.dataInicio !== undefined) {
        url.searchParams.append("dataInicio", params.dataInicio);
      }
      if (params?.dataFim !== undefined) {
        url.searchParams.append("dataFim", params.dataFim);
      }
      return fetchBase(url.toString(), {
        method: "GET",
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{ data: Reserva[]; hasNextPage: boolean }>
      );
    },
    [fetchBase]
  );
}

export function useGetEventosAbertosService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/reservas/eventos-abertos`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Reserva[]>);
    },
    [fetchBase]
  );
}

export function useCreateReservaService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: CreateReservaRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/reservas`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(
        (response) =>
          wrapperFetchJsonResponse(response) as Promise<CreateReservaResponse>
      );
    },
    [fetchBase]
  );
}

export type UpdateReservaRequest = Partial<CreateReservaRequest>;

export type UpdateReservaResponse =
  | { status: typeof HTTP_CODES_ENUM.OK; data: Reserva }
  | {
      status: typeof HTTP_CODES_ENUM.CONFLICT;
      data: { message: string; errors?: Record<string, string> };
    }
  | {
      status: typeof HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY;
      data: { errors: Record<string, string> };
    };

export function useUpdateReservaService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      id: string,
      data: UpdateReservaRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/reservas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(
        (response) =>
          wrapperFetchJsonResponse(response) as Promise<UpdateReservaResponse>
      );
    },
    [fetchBase]
  );
}

export function useDeleteReservaService() {
  const fetchBase = useFetch();

  return useCallback(
    (id: string, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/reservas/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<undefined>);
    },
    [fetchBase]
  );
}
