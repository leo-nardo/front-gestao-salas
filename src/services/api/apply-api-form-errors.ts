import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import HTTP_CODES_ENUM from "./types/http-codes";

type ApiErrorResponse = {
  status: number;
  data?: { errors?: Record<string, string>; message?: string };
};

/**
 * Maps a 422 response's `{ errors: { field: reasonKey } }` onto the matching
 * react-hook-form field, so the user sees the error under the actual input
 * instead of only a generic toast. Falls back to a toast for anything that
 * isn't a field-level 422 (network error, 500, a field name the form
 * doesn't have, etc.) so nothing fails silently.
 */
export function applyApiFormErrors<T extends FieldValues>(
  response: ApiErrorResponse,
  setError: UseFormSetError<T>,
  fallbackMessage = "Não foi possível salvar. Tente novamente."
) {
  if (response.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
    const errors = response.data?.errors;
    if (errors && Object.keys(errors).length > 0) {
      let mappedAny = false;
      Object.entries(errors).forEach(([field, reason]) => {
        mappedAny = true;
        setError(field as Path<T>, { type: "server", message: reason });
      });
      if (mappedAny) return;
    }
  }

  toast.error(response.data?.message || fallbackMessage);
}
