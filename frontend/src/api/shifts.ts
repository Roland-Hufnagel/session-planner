import {api} from "./client";
import {toShiftImportRow, type ParsedShiftRow, type Shift, type ShiftInput} from "../types/shift";

export const SHIFTS_ENDPOINT = "/api/shifts";
export const SHIFTS_BATCH_ENDPOINT = `${SHIFTS_ENDPOINT}/batch`;

/**
 * Die Route kennt zwei Abfragewege; hier wird der cohortId-Weg genutzt.
 * Er liefert alle Shifts einer Cohorte ohne Zeitraum-Begrenzung.
 */
export const shiftsOfCohortUrl = (cohortId: string): string =>
    `${SHIFTS_ENDPOINT}?cohortId=${cohortId}`;

export const createShift = (input: ShiftInput): Promise<Shift> =>
    api.post<Shift>(SHIFTS_ENDPOINT, input).then((res) => res.data);

/**
 * Legt alle Shifts eines Imports in einer Transaktion an – alles oder nichts.
 *
 * Die Antwort ist 201 ohne Body: Der Server schickt die angelegten Shifts nicht
 * zurueck, weil die Cohorte in jeder Zeile identisch waere.
 */
export const createShifts = (cohortId: string, rows: ParsedShiftRow[]): Promise<void> =>
    api
        .post(SHIFTS_BATCH_ENDPOINT, {cohortId, shifts: rows.map(toShiftImportRow)})
        .then(() => undefined);

export const updateShift = (id: string, input: ShiftInput): Promise<Shift> =>
    api.put<Shift>(`${SHIFTS_ENDPOINT}/${id}`, input).then((res) => res.data);

export const deleteShift = (id: string): Promise<void> =>
    api.delete(`${SHIFTS_ENDPOINT}/${id}`).then(() => undefined);
