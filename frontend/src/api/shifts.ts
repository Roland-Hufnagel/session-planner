import {api} from "./client";
import type {Shift, ShiftInput} from "../types/shift";

export const SHIFTS_ENDPOINT = "/api/shifts";

/**
 * Die Route kennt zwei Abfragewege; hier wird der cohortId-Weg genutzt.
 * Er liefert alle Shifts einer Cohorte ohne Zeitraum-Begrenzung.
 */
export const shiftsOfCohortUrl = (cohortId: string): string =>
    `${SHIFTS_ENDPOINT}?cohortId=${cohortId}`;

/**
 * Der zweite Abfrageweg: ein Zeitraum von maximal 30 Tagen. Fuer die
 * Wochenansicht sind es Montag bis Sonntag, also sieben Tage.
 */
export const weekShiftsUrl = (from: string, to: string): string =>
    `${SHIFTS_ENDPOINT}?from=${from}&to=${to}`;

/**
 * Weist einer Shift einen Coach zu oder entfernt ihn.
 *
 * coachId null bedeutet "unbesetzt" – dasselbe Endpunkt fuer beide Richtungen,
 * so wie das Backend es erwartet.
 */
export const assignCoach = (shiftId: string, coachId: string | null): Promise<Shift> =>
    api.put<Shift>(`${SHIFTS_ENDPOINT}/${shiftId}/coach`, {coachId}).then((res) => res.data);

export const createShift = (input: ShiftInput): Promise<Shift> =>
    api.post<Shift>(SHIFTS_ENDPOINT, input).then((res) => res.data);

export const updateShift = (id: string, input: ShiftInput): Promise<Shift> =>
    api.put<Shift>(`${SHIFTS_ENDPOINT}/${id}`, input).then((res) => res.data);

export const deleteShift = (id: string): Promise<void> =>
    api.delete(`${SHIFTS_ENDPOINT}/${id}`).then(() => undefined);
