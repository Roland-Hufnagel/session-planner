import useSWR from "swr";
import {fetcher} from "../api/client";
import {createShift, deleteShift, shiftsOfCohortUrl, updateShift} from "../api/shifts";
import type {Shift, ShiftInput} from "../types/shift";

/**
 * Shifts einer Cohorte.
 *
 * Ohne cohortId ist der SWR-Key null – dann fragt SWR gar nicht erst an. Genau
 * das ist der gewuenschte Startzustand der Seite: erst Cohorte waehlen, dann
 * laden. Achtung: isLoading ist dabei false, "nichts gewaehlt" und "laedt" sind
 * also zwei verschiedene Zustaende.
 */
export function useShifts(cohortId: string | null) {
    const {data, error, isLoading, mutate} = useSWR<Shift[]>(
        cohortId ? shiftsOfCohortUrl(cohortId) : null,
        fetcher,
    );

    const shifts = data ?? [];

    async function addShift(input: ShiftInput): Promise<Shift> {
        let createdShift: Shift;

        await mutate(
            async (currentShifts = []) => {
                createdShift = await createShift(input);
                return sortByDate([...currentShifts, createdShift]);
            },
            {
                // Kein optimistischer Platzhalter: Die Liste zeigt Coach und
                // Cohorte als Objekte, die wir aus den IDs nicht bauen koennen.
                rollbackOnError: true,
                revalidate: false,
            },
        );

        return createdShift!;
    }

    async function editShift(id: string, input: ShiftInput): Promise<Shift> {
        let updatedShift: Shift;

        await mutate(
            async (currentShifts = []) => {
                updatedShift = await updateShift(id, input);
                return sortByDate(
                    currentShifts.map((shift) => (shift.id === id ? updatedShift : shift)),
                );
            },
            {
                rollbackOnError: true,
                revalidate: false,
            },
        );

        return updatedShift!;
    }

    async function removeShift(id: string): Promise<void> {
        await mutate(
            async (currentShifts = []) => {
                await deleteShift(id);
                return currentShifts.filter((shift) => shift.id !== id);
            },
            {
                optimisticData: (currentShifts = []) =>
                    currentShifts.filter((shift) => shift.id !== id),
                rollbackOnError: true,
                revalidate: false,
            },
        );
    }

    return {shifts, error, isLoading, addShift, editShift, removeShift};
}

/** Das Backend sortiert nach Datum und Startzeit – nach Mutationen selbst nachziehen. */
function sortByDate(shifts: Shift[]): Shift[] {
    return [...shifts].sort((a, b) =>
        a.date === b.date
            ? a.startTime.localeCompare(b.startTime)
            : a.date.localeCompare(b.date),
    );
}
