import axios from "axios";

/** Fehlerformat des Backends (ApiError). */
export type ApiError = {
  status: number;
  message: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
};

/** Liefert eine anzeigbare Fehlermeldung aus einem beliebigen Fehler. */
export function getErrorMessage(error: unknown, fallback = "Etwas ist schiefgelaufen."): string {
  if (axios.isAxiosError<ApiError>(error)) {
    // Timeout (ECONNABORTED) oder gar keine Antwort -> Server/Netz nicht erreichbar.
    if (error.code === "ECONNABORTED" || !error.response) {
      return "Server nicht erreichbar – bitte später erneut versuchen.";
    }
    return error.response.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

/** Feld-bezogene Validierungsfehler des Backends (400), z.B. { email: "..." }. */
export function getValidationErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.validationErrors ?? {};
  }
  return {};
}
