import axios from "axios";

/**
 * Zentrale axios-Instanz fuer alle API-Requests.
 *
 * timeout begrenzt, wie lange ein einzelner Request offen bleibt. Ohne Timeout
 * wartet das Frontend beliebig lange – z.B. wenn das Backend zwar laeuft, aber
 * die DB weg ist und der Server erst nach dem Connection-Timeout (~30–60s) mit
 * einem 500 antwortet. Mit 10s bricht der Request vorher ab und die UI kann
 * schnell einen Fehler zeigen (bzw. die optimistische Aenderung zurueckrollen).
 */
export const api = axios.create({
  timeout: 10_000,
});
