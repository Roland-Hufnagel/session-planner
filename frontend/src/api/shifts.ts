import {api} from "./client";
import type {Shift, ShiftInput} from "../types/shift";

export const SHIFTS_ENDPOINT = "/api/shifts";

/**
 * Die Route kennt zwei Abfragewege; hier wird der cohortId-Weg genutzt.
 * Er liefert alle Shifts einer Cohorte ohne Zeitraum-Begrenzung.
 */
export const shiftsOfCohortUrl = (cohortId: string): string =>
    `${SHIFTS_ENDPOINT}?cohortId=${cohortId}`;

export const createShift = (input: ShiftInput): Promise<Shift> =>
    api.post<Shift>(SHIFTS_ENDPOINT, input).then((res) => res.data);

export const updateShift = (id: string, input: ShiftInput): Promise<Shift> =>
    api.put<Shift>(`${SHIFTS_ENDPOINT}/${id}`, input).then((res) => res.data);

export const deleteShift = (id: string): Promise<void> =>
    api.delete(`${SHIFTS_ENDPOINT}/${id}`).then(() => undefined);
